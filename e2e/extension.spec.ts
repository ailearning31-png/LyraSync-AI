import { chromium, expect, test, type Locator } from '@playwright/test'
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
function makeWavBuffer(seconds = 3, sampleRate = 8000): Buffer {
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
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5
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
    await page.getByRole('button', { name: 'Putar' }).click()
    await expect(page.getByRole('button', { name: 'Jeda' })).toBeVisible()
    await page.getByRole('button', { name: 'Jeda' }).click()
    await expect(page.getByRole('button', { name: 'Putar' })).toBeVisible()

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
