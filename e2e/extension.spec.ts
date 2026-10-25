import { chromium, expect, test, type Locator } from '@playwright/test'
import { createServer, type Server } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Input[type=range] tidak mendukung fill() Playwright — set nilai lewat
// native setter lalu dispatch input event agar React onChange terpicu.
async function seekSlider(slider: Locator, value: number) {
  await slider.evaluate((element, target) => {
    const input = element as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    setter?.call(input, String(target))
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

const dist = resolve(import.meta.dirname, '..', 'dist')

// WAV PCM 16-bit mono sederhana — cukup untuk memutar dan membaca durasi.
// Tanpa `segments`: nada menerus. Dengan `segments`: nada hanya pada rentang
// tertentu (sisanya hening) — untuk menguji deteksi jeda terhadap batas known.
function makeWavBuffer(
  seconds = 3,
  sampleRate = 8000,
  segments: [number, number][] = [[0, seconds]],
): Buffer {
  const numSamples = Math.floor(seconds * sampleRate)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(1, 22) // mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate
    const active = segments.some(([from, to]) => t >= from && t < to)
    const sample = active ? Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5 : 0
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
  }
  return buffer
}

async function launchExtension() {
  const context = await chromium.launchPersistentContext('', {
    // channel 'chromium' = build penuh dengan new headless; headless shell
    // tidak mendukung --load-extension sehingga service worker tidak pernah aktif
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${dist}`,
      `--load-extension=${dist}`,
      '--mute-audio',
    ],
  })

  let worker = context.serviceWorkers()[0]
  if (!worker) worker = await context.waitForEvent('serviceworker')
  const extensionId = new URL(worker.url()).host

  return { context, extensionId }
}

test('ekstensi dimuat: service worker aktif dan sidepanel dirender tanpa error', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    const problems: string[] = []
    page.on('console', (msg) => {
      const url = msg.location()?.url ?? ''
      if (msg.type() === 'error' && url.includes(extensionId)) {
        problems.push(`console.error: ${msg.text()}`)
      }
    })
    page.on('pageerror', (err) => {
      problems.push(`pageerror: ${err.message}`)
    })

    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await expect(page.getByRole('heading', { name: 'LyraSync AI' })).toBeVisible()
    await expect(page.getByText('Fit the Lyrics. Feel the Melody.')).toBeVisible()

    // Navigasi dasar antar-tab
    await page.getByRole('tab', { name: 'Eksperimen' }).click()
    await expect(page.getByRole('tabpanel')).toContainText('Fase 4')
    await page.getByRole('tab', { name: 'Proyek' }).click()
    await expect(page.getByLabel('Judul proyek baru')).toBeVisible()

    expect(problems).toEqual([])
  } finally {
    await context.close()
  }
})

test('proyek: dibuat, diedit, tersimpan otomatis, dan bertahan setelah panel dibuka ulang', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    // Buat proyek baru
    await page.getByRole('tab', { name: 'Proyek' }).click()
    await page.getByLabel('Judul proyek baru').fill('Proyek Uji E2E')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await expect(page.getByText('Proyek Uji E2E')).toBeVisible()

    // Buka proyek → pindah ke Editor
    await page.getByRole('button', { name: 'Buka' }).click()
    await expect(page.getByLabel('Judul proyek')).toHaveValue('Proyek Uji E2E')

    // Tambah satu frasa dan isi tiga kolom teks terpisah
    await page.getByRole('button', { name: 'Tambah frasa' }).click()
    await page.getByLabel('Sumber').fill('テスト')
    await page.getByLabel('Romanisasi').fill('tesuto')
    await page.getByLabel('Bahasa Indonesia').fill('uji coba')

    // Kolom teks harus tetap independen satu sama lain
    await expect(page.getByLabel('Sumber')).toHaveValue('テスト')
    await expect(page.getByLabel('Romanisasi')).toHaveValue('tesuto')

    // Autosave selesai sebelum panel ditutup
    await expect(page.getByText('Tersimpan')).toBeVisible({ timeout: 5000 })

    // Tutup panel (halaman) lalu buka ulang — data harus bertahan
    await page.close()
    const page2 = await context.newPage()
    await page2.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page2.getByRole('tab', { name: 'Proyek' }).click()
    await expect(page2.getByText('Proyek Uji E2E')).toBeVisible()
    await expect(page2.getByText(/1 frasa/)).toBeVisible()

    await page2.getByRole('button', { name: 'Buka' }).click()
    await expect(page2.getByLabel('Sumber')).toHaveValue('テスト')
    await expect(page2.getByLabel('Romanisasi')).toHaveValue('tesuto')
    await expect(page2.getByLabel('Bahasa Indonesia')).toHaveValue('uji coba')
  } finally {
    await context.close()
  }
})

test('proyek: penghapusan memakai konfirmasi dua langkah', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page.getByLabel('Judul proyek baru').fill('Proyek Dihapus')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await expect(page.getByText('Proyek Dihapus')).toBeVisible()

    // Langkah pertama hanya menampilkan konfirmasi, belum menghapus
    await page.getByRole('button', { name: 'Hapus', exact: true }).click()
    await page.getByRole('button', { name: 'Batal' }).click()
    await expect(page.getByText('Proyek Dihapus')).toBeVisible()

    await page.getByRole('button', { name: 'Hapus', exact: true }).click()
    await page.getByRole('button', { name: 'Yakin? Hapus' }).click()
    await expect(page.getByText('Belum ada proyek')).toBeVisible()
  } finally {
    await context.close()
  }
})

test('audio: impor, timestamp manual, overlay mengikuti seek, dan bertahan setelah dibuka ulang', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page.getByLabel('Judul proyek baru').fill('Proyek Audio E2E')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await expect(page.getByText('Proyek Audio E2E')).toBeVisible()
    await page.getByRole('button', { name: 'Buka' }).click()

    // Impor audio WAV sintetis 3 detik
    await page
      .getByLabel('Impor audio lokal')
      .setInputFiles({
        name: 'uji.wav',
        mimeType: 'audio/wav',
        buffer: makeWavBuffer(3),
      })
    await expect(page.getByText('uji.wav')).toBeVisible()
    await expect(page.getByText(/0:03\.0/)).toBeVisible({ timeout: 5000 })

    // Frasa + timestamp manual lewat input teks
    await page.getByRole('button', { name: 'Tambah frasa' }).click()
    await page.getByLabel('Sumber').fill('テスト')
    await page.getByLabel('Bahasa Indonesia').fill('uji coba')
    await page.getByLabel('Mulai (m:ss.d)').fill('0:00.5')
    await page.getByLabel('Mulai (m:ss.d)').blur()
    await page.getByLabel('Akhir (m:ss.d)').fill('0:02.0')
    await page.getByLabel('Akhir (m:ss.d)').blur()

    // Overlay mengikuti seek: di dalam rentang → aktif, di luar → tidak
    const slider = page.getByRole('slider', { name: 'Posisi audio' })
    await seekSlider(slider, 1.0)
    await expect(page.locator('[aria-current="true"]')).toContainText('uji coba')
    await seekSlider(slider, 2.5)
    await expect(page.locator('[aria-current="true"]')).toHaveCount(0)

    // Set dari pemutar: posisi 1.5 diambil sebagai waktu akhir
    await seekSlider(slider, 1.5)
    await page.getByRole('button', { name: 'Set akhir' }).click()
    await expect(page.getByLabel('Akhir (m:ss.d)')).toHaveValue('0:01.5')

    // Ganti frasa lewat overlay: klik baris pertama melompat ke waktunya
    await page.locator('.overlay-line').first().click()
    await expect(page.getByText(/0:00\.5 \/ /)).toBeVisible()

    // Putar/jeda memakai satu elemen audio yang sama
    await page.getByRole('button', { name: 'Putar', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Jeda', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Jeda', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Putar', exact: true })).toBeVisible()

    await expect(page.getByText('Tersimpan')).toBeVisible({ timeout: 5000 })

    // Buka ulang panel: audio (bytes) dan timestamp manual bertahan
    await page.close()
    const page2 = await context.newPage()
    await page2.goto(`chrome-extension://${extensionId}/sidepanel.html`)
    await page2.getByRole('tab', { name: 'Proyek' }).click()
    await page2.getByRole('button', { name: 'Buka' }).click()
    await expect(page2.getByText('uji.wav')).toBeVisible()
    await expect(page2.getByLabel('Mulai (m:ss.d)')).toHaveValue('0:00.5')
    await expect(page2.getByLabel('Akhir (m:ss.d)')).toHaveValue('0:01.5')
  } finally {
    await context.close()
  }
})

test('audio: file korup menghasilkan pesan error yang jelas', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page.getByLabel('Judul proyek baru').fill('Proyek Korup')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await page.getByRole('button', { name: 'Buka' }).click()

    await page.getByLabel('Impor audio lokal').setInputFiles({
      name: 'rusak.wav',
      mimeType: 'audio/wav',
      buffer: Buffer.from('ini bukan file audio'),
    })

    await expect(
      page.getByRole('alert').filter({ hasText: 'Audio tidak dapat diputar' }),
    ).toBeVisible({ timeout: 5000 })
  } finally {
    await context.close()
  }
})

test('kandidat: estimasi suku kata, heuristik, skor berbobot, bandingkan, terapkan, ekspor eksperimen', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page.getByLabel('Judul proyek baru').fill('Proyek Kandidat')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await page.getByRole('button', { name: 'Buka' }).click()

    await page.getByRole('button', { name: 'Tambah frasa' }).click()
    await page.getByLabel('Sumber').fill('bukan cinta biasa')
    await page.getByLabel('Bahasa Indonesia').fill('bukan cinta biasa')
    await page.getByLabel('Mulai (m:ss.d)').fill('0:00.0')
    await page.getByLabel('Mulai (m:ss.d)').blur()
    await page.getByLabel('Akhir (m:ss.d)').fill('0:02.0')
    await page.getByLabel('Akhir (m:ss.d)').blur()

    // Kandidat A: teks sama dengan sumber → 7 suku kata, kepadatan setara
    await page.getByRole('button', { name: 'Tambah kandidat' }).click()
    await expect(page.getByText('belum cukup data').first()).toBeVisible()
    await page.getByLabel('Teks kandidat (A)').fill('bukan cinta biasa')
    await expect(page.getByText('≈ 7 suku kata').first()).toBeVisible()
    await expect(page.locator('.chip-setara')).toBeVisible()

    // Kandidat B: jauh lebih pendek ('cinta' = 2) → kepadatan 1.0/dtk vs 3.5/dtk → renggang
    await page.getByRole('button', { name: 'Tambah kandidat' }).click()
    await page.getByLabel('Teks kandidat (B)').fill('cinta')
    await expect(page.getByText('≈ 2 suku kata')).toBeVisible()
    await expect(page.locator('.chip-renggang')).toBeVisible()

    // Koreksi manual suku kata B: 5 → kepadatan 2.5/dtk → setara; lalu kembali ke estimasi
    await page.getByLabel('Koreksi suku kata (B)').fill('5')
    await expect(page.locator('.chip-renggang')).toHaveCount(0)
    await page.getByRole('button', { name: 'Pakai estimasi (B)' }).click()
    await expect(page.locator('.chip-renggang')).toBeVisible()

    // Skor manual kandidat A (kelima dimensi) → total berbobot hipotesis 3.6
    await page.getByLabel('Skor makna (A)').selectOption('3')
    await page.getByLabel('Skor alami (A)').selectOption('4')
    await page.getByLabel('Skor ritme (A)').selectOption('4')
    await page.getByLabel('Skor stres (A)').selectOption('3')
    await page.getByLabel('Skor nyanyi (A)').selectOption('4')
    await expect(page.getByText('≈ 3.6 (hipotesis 30/20/20/20/10)')).toBeVisible()

    // Perbandingan berdampingan
    await page.getByRole('button', { name: 'Bandingkan' }).click()
    const table = page.getByRole('table')
    await expect(table).toBeVisible()
    await expect(table).toContainText('cinta biasa')
    await expect(table).toContainText('berisiko renggang')

    // Terapkan kandidat B sebagai adaptasi terpilih
    await page.getByRole('button', { name: 'Gunakan sebagai adaptasi (B)' }).click()
    await expect(page.getByLabel('Bahasa Indonesia')).toHaveValue('cinta')

    // Ekspor catatan eksperimen Markdown
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Unduh eksperimen' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^eksperimen-.*\.md$/)
    const markdown = await readFile(await download.path(), 'utf-8')
    expect(markdown).toContain('# Eksperimen adaptasi — Proyek Kandidat')
    expect(markdown).toContain('### Kandidat A')
    expect(markdown).toContain('estimasi/hipotesis')

    // Kandidat + skor + koreksi bertahan setelah panel dibuka ulang
    await expect(page.getByText('Tersimpan')).toBeVisible({ timeout: 5000 })
    await page.close()
    const page2 = await context.newPage()
    await page2.goto(`chrome-extension://${extensionId}/sidepanel.html`)
    await page2.getByRole('tab', { name: 'Proyek' }).click()
    await page2.getByRole('button', { name: 'Buka' }).click()
    await expect(page2.getByLabel('Teks kandidat (B)')).toHaveValue('cinta')
    await expect(page2.getByLabel('Skor makna (A)')).toHaveValue('3')
    await expect(page2.getByLabel('Bahasa Indonesia')).toHaveValue('cinta')
  } finally {
    await context.close()
  }
})

// Server HTTP lokal yang selalu menjawab 401 — membuat jalur error AI
// deterministik (tanpa bergantung pada perilaku port mati sistem operasi).
async function startUnauthorizedServer(): Promise<{ server: Server; baseUrl: string }> {
  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end('{"error":{"message":"invalid key"}}')
  })
  await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  const port = typeof address === 'object' && address !== null ? address.port : 0
  return { server, baseUrl: `http://127.0.0.1:${port}/v1` }
}

test('AI: pengaturan tersimpan lokal, pesan saat belum dikonfigurasi, dan kegagalan layanan tertangani', async () => {
  const { server, baseUrl } = await startUnauthorizedServer()
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    // Siapkan proyek + frasa
    await page.getByLabel('Judul proyek baru').fill('Proyek AI')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await page.getByRole('button', { name: 'Buka' }).click()
    await page.getByRole('button', { name: 'Tambah frasa' }).click()
    await page.getByLabel('Sumber').fill('テスト')

    // 1) Belum dikonfigurasi → pesan jelas, tanpa crash, teks tetap utuh
    await page.getByRole('button', { name: 'Buat kandidat (AI)' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'belum dikonfigurasi' }),
    ).toBeVisible()
    await expect(page.getByLabel('Sumber')).toHaveValue('テスト')

    // 2) Konfigurasi di tab Pengaturan — arahkan ke server uji 401
    await page.getByRole('tab', { name: 'Pengaturan' }).click()
    await page.getByLabel('Alamat layanan (Base URL)').fill(baseUrl)
    await page.getByLabel('Kunci API').fill('kunci-uji')
    await page.getByLabel('Nama model').fill('model-uji')
    await page.getByRole('button', { name: 'Simpan pengaturan' }).click()
    await expect(page.getByText('Pengaturan tersimpan')).toBeVisible()

    // 3) Generate → layanan menjawab 401 → pesan jelas, tanpa retry liar
    await page.getByRole('tab', { name: 'Editor' }).click()
    await page.getByRole('button', { name: 'Buat kandidat (AI)' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: /Kunci API ditolak|401/ }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(page.getByLabel('Sumber')).toHaveValue('テスト')

    // 4) Pengaturan bertahan setelah panel dibuka ulang (tersimpan lokal)
    await page.close()
    const page2 = await context.newPage()
    await page2.goto(`chrome-extension://${extensionId}/sidepanel.html`)
    await page2.getByRole('tab', { name: 'Pengaturan' }).click()
    await expect(page2.getByLabel('Alamat layanan (Base URL)')).toHaveValue(baseUrl)
    await expect(page2.getByLabel('Nama model')).toHaveValue('model-uji')
  } finally {
    await context.close()
    server.close()
  }
})

test('analisis: jeda antar segmen terdeteksi sesuai batas known dan bisa diverifikasi via seek', async () => {
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page.getByLabel('Judul proyek baru').fill('Proyek Analisis')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await page.getByRole('button', { name: 'Buka' }).click()

    // WAV 3.5 dtk: nada [0–1], hening [1–1.5], nada [1.5–2.5], hening [2.5–3], nada [3–3.5]
    await page.getByLabel('Impor audio lokal').setInputFiles({
      name: 'bersegmen.wav',
      mimeType: 'audio/wav',
      buffer: makeWavBuffer(3.5, 8000, [
        [0, 1],
        [1.5, 2.5],
        [3, 3.5],
      ]),
    })
    await expect(page.getByText('bersegmen.wav')).toBeVisible()

    await page.getByRole('button', { name: 'Analisis jeda (estimasi)' }).click()
    await expect(page.getByText(/2 jeda/)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Estimasi otomatis berbasis energi/)).toBeVisible()

    // Klik jeda pertama → pemutar melompat ke awal jeda (0:01.0)
    await page.getByRole('button', { name: /Jeda 0:01\.0/ }).click()
    await expect(page.getByText(/0:01\.0 \/ /)).toBeVisible()
  } finally {
    await context.close()
  }
})

// Server tiruan berperilaku seperti Ollama lokal: endpoint kompatibel OpenAI,
// TANPA kunci (Authorization diabaikan), CORS diizinkan. Ini proxy jujur untuk
// menguji jalur "mode lokal tanpa API key" — Ollama asli diuji di mesin pengguna.
async function startOllamaLikeServer(): Promise<{ server: Server; baseUrl: string }> {
  const payload = {
    candidates: [
      { slot: 'meaning', text: 'kandidat lokal A', rationale: 'setia makna' },
      { slot: 'balanced', text: 'kandidat lokal B', rationale: 'seimbang' },
      { slot: 'singability', text: 'kandidat lokal C', rationale: 'mudah dinyanyikan' },
    ],
  }
  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }))
  })
  await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  const port = typeof address === 'object' && address !== null ? address.port : 0
  return { server, baseUrl: `http://127.0.0.1:${port}/v1` }
}

test('AI lokal tanpa kunci: kandidat terisi penuh via server lokal bergaya Ollama', async () => {
  const { server, baseUrl } = await startOllamaLikeServer()
  const { context, extensionId } = await launchExtension()

  try {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`)

    await page.getByLabel('Judul proyek baru').fill('Proyek Ollama')
    await page.getByRole('button', { name: 'Buat proyek' }).click()
    await page.getByRole('button', { name: 'Buka' }).click()
    await page.getByRole('button', { name: 'Tambah frasa' }).click()
    await page.getByLabel('Sumber').fill('テスト')

    // Konfigurasi: base URL server lokal, kunci DIBIARKAN KOSONG, model diisi
    await page.getByRole('tab', { name: 'Pengaturan' }).click()
    await page.getByLabel('Alamat layanan (Base URL)').fill(baseUrl)
    await page.getByLabel('Kunci API (opsional)').fill('')
    await page.getByLabel('Nama model').fill('model-lokal-uji')
    await page.getByRole('button', { name: 'Simpan pengaturan' }).click()
    await expect(page.getByText('Pengaturan tersimpan')).toBeVisible()

    // Generate → kandidat A terisi tanpa kunci apa pun
    await page.getByRole('tab', { name: 'Editor' }).click()
    await page.getByRole('button', { name: 'Buat kandidat (AI)' }).click()
    await expect(page.getByLabel('Teks kandidat (A)')).toHaveValue('kandidat lokal A', {
      timeout: 10_000,
    })
    await expect(page.getByText('oleh model-lokal-uji').first()).toBeVisible()
    await expect(page.getByLabel('Teks kandidat (C)')).toHaveValue('kandidat lokal C')
  } finally {
    await context.close()
    server.close()
  }
})
