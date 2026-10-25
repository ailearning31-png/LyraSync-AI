import { chromium, expect, test } from '@playwright/test'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')

test('ekstensi dimuat: service worker aktif dan sidepanel dirender tanpa error', async () => {
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

  try {
    // Service worker MV3 mungkin butuh waktu untuk terdaftar
    let worker = context.serviceWorkers()[0]
    if (!worker) worker = await context.waitForEvent('serviceworker')
    expect(worker.url()).toContain('chrome-extension://')

    const extensionId = new URL(worker.url()).host

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
    await expect(page.getByRole('tabpanel')).toContainText('Fase 2')

    expect(problems).toEqual([])
  } finally {
    await context.close()
  }
})
