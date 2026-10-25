export type AiSlot = 'meaning' | 'balanced' | 'singability'

/** Konfigurasi layanan AI milik pengguna: hanya disimpan lokal (storage.local). */
export interface AiSettings {
  baseUrl: string
  apiKey: string
  model: string
}

/** Konteks frasa yang DIKIRIM ke layanan AI (teks saja: audio tidak pernah). */
export interface PhraseContext {
  source: string
  romanized: string
  current: string
  start: number | null
  end: number | null
  duration: number | null
  sourceSyllables: number | null
  notes: string
}

export interface GeneratedCandidate {
  slot: AiSlot
  text: string
  rationale: string
}

/** Error AI dengan pesan ramah pengguna; tidak pernah menyertakan kunci API. */
export class AiError extends Error {}
