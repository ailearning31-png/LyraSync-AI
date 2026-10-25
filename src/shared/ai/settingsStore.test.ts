import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAiSettings,
  loadAiSettings,
  memoryStore,
  saveAiSettings,
  setStoreForTesting,
  validateAiSettings,
} from './settingsStore'

beforeEach(() => {
  setStoreForTesting(memoryStore())
})

describe('settingsStore (konfigurasi AI pengguna)', () => {
  it('menyimpan dan memuat ulang konfigurasi', async () => {
    await saveAiSettings({ baseUrl: 'https://ai.example.com/v1', apiKey: 'kunci', model: 'm' })
    const loaded = await loadAiSettings()
    expect(loaded).toEqual({
      baseUrl: 'https://ai.example.com/v1',
      apiKey: 'kunci',
      model: 'm',
    })
  })

  it('menormalkan spasi pada baseUrl dan model', async () => {
    await saveAiSettings({ baseUrl: '  https://x.example/ ', apiKey: ' k ', model: ' m1 ' })
    expect(await loadAiSettings()).toEqual({ baseUrl: 'https://x.example', apiKey: ' k ', model: 'm1' })
  })

  it('menolak menyimpan konfigurasi tidak lengkap', async () => {
    await expect(
      saveAiSettings({ baseUrl: 'https://x', apiKey: '  ', model: 'm' }),
    ).rejects.toThrow(/Lengkapi/)
    expect(await loadAiSettings()).toBeNull()
  })

  it('menghapus konfigurasi', async () => {
    await saveAiSettings({ baseUrl: 'https://x', apiKey: 'k', model: 'm' })
    await clearAiSettings()
    expect(await loadAiSettings()).toBeNull()
  })

  it('memuat nilai null untuk data yang tidak valid/belum ada', async () => {
    expect(await loadAiSettings()).toBeNull()
    expect(validateAiSettings({ baseUrl: 42 })).toBeNull()
    expect(validateAiSettings('teks')).toBeNull()
  })
})
