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

  it('kunci kosong sah untuk server lokal; baseUrl/model tetap wajib', async () => {
    await saveAiSettings({
      baseUrl: 'http://localhost:11434/v1',
      apiKey: '',
      model: 'llama3.1:8b',
    })
    expect(await loadAiSettings()).toEqual({
      baseUrl: 'http://localhost:11434/v1',
      apiKey: '',
      model: 'llama3.1:8b',
    })

    await expect(
      saveAiSettings({ baseUrl: '   ', apiKey: 'kunci', model: 'm' }),
    ).rejects.toThrow(/Lengkapi/)
    await expect(
      saveAiSettings({ baseUrl: 'https://x', apiKey: 'kunci', model: ' ' }),
    ).rejects.toThrow(/Lengkapi/)
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
