import { chromium, expect, test } from '@playwright/test'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')

async function launchExtension() {
  const context = await chromium.launchPersistentContext('', {
    // channel 'chromium' = build penuh dengan new headless; headless shell
    // tidak mendukung --load-extension sehingga service worker tidak pernah aktif
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${dist}`,
      `--load-extension=${dist}`,
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
