import type { Phrase, Project } from './types'

// Pemastian bentuk data saat MEMBACA dari penyimpanan: record yang rusak
// (mis. hasil penulisan yang terpotong atau versi lama) harus bisa dilewati,
// bukan membuat seluruh aplikasi gagal.
export function isPhraseRecord(value: unknown): value is Phrase {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.source === 'string' &&
    typeof p.romanized === 'string' &&
    typeof p.indonesian === 'string'
  )
}

export function isProjectRecord(value: unknown): value is Project {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.title === 'string' &&
    typeof p.createdAt === 'number' &&
    Number.isFinite(p.createdAt) &&
    typeof p.updatedAt === 'number' &&
    Number.isFinite(p.updatedAt) &&
    Array.isArray(p.phrases) &&
    p.phrases.every(isPhraseRecord)
  )
}
