import { AiError, type AiSettings } from './types'

const STORAGE_KEY = 'ai-settings'

/** Penyimpanan key-value yang bisa disuntik (chrome.storage.local di ekstensi). */
export interface KeyValueStore {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  remove(key: string): Promise<void>
}

export function memoryStore(): KeyValueStore {
  const data = new Map<string, unknown>()
  return {
    async get(key) {
      return data.has(key) ? data.get(key) : undefined
    },
    async set(key, value) {
      data.set(key, value)
    },
    async remove(key) {
      data.delete(key)
    },
  }
}

function chromeLocalStore(): KeyValueStore | null {
  const storage = (globalThis as { chrome?: { storage?: { local?: {
    get: (key: string) => Promise<Record<string, unknown>>
    set: (items: Record<string, unknown>) => Promise<void>
    remove: (key: string) => Promise<void>
  } } } }).chrome?.storage?.local
  if (storage === undefined) return null
  return {
    async get(key) {
      const items = await storage.get(key)
      return items[key]
    },
    async set(key, value) {
      await storage.set({ [key]: value })
    },
    async remove(key) {
      await storage.remove(key)
    },
  }
}

let storeOverride: KeyValueStore | null = null

/** Dipakai unit test untuk menyuntik store; produksi memakai chrome.storage.local. */
export function setStoreForTesting(store: KeyValueStore | null): void {
  storeOverride = store
}

function getStore(): KeyValueStore {
  if (storeOverride !== null) return storeOverride
  const chromeStore = chromeLocalStore()
  if (chromeStore !== null) return chromeStore
  return memoryStore() // mode dev di luar ekstensi: konfigurasi tidak dipertahankan
}

export interface ValidatedAiSettings {
  baseUrl: string
  apiKey: string
  model: string
}

export function validateAiSettings(raw: unknown): ValidatedAiSettings | null {
  if (typeof raw !== 'object' || raw === null) return null
  const s = raw as Partial<AiSettings>
  if (
    typeof s.baseUrl !== 'string' ||
    typeof s.apiKey !== 'string' ||
    typeof s.model !== 'string' ||
    s.baseUrl.trim() === '' ||
    s.model.trim() === ''
  ) {
    return null
  }
  return {
    baseUrl: s.baseUrl.trim().replace(/\/+$/, ''),
    apiKey: s.apiKey,
    model: s.model.trim(),
  }
}

export async function loadAiSettings(): Promise<ValidatedAiSettings | null> {
  const raw = await getStore().get(STORAGE_KEY)
  return validateAiSettings(raw)
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  const validated = validateAiSettings(settings)
  if (validated === null || validated.apiKey.trim() === '') {
    throw new AiError('Lengkapi alamat layanan, kunci API, dan nama model sebelum menyimpan.')
  }
  await getStore().set(STORAGE_KEY, validated)
}

export async function clearAiSettings(): Promise<void> {
  await getStore().remove(STORAGE_KEY)
}

export function hasAiSettings(): Promise<boolean> {
  return loadAiSettings().then((s) => s !== null)
}
