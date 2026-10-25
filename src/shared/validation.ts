import type { Phrase, Project } from './types'

// Pemastian bentuk data saat MEMBACA dari penyimpanan: record yang rusak
// (mis. hasil penulisan yang terpotong atau versi lama) harus bisa dilewati,
// bukan membuat seluruh aplikasi gagal. Kolom yang ditambahkan belakangan
// (start/end/notes/audio) boleh tidak ada pada record lama — normalisasi di
// projectRepo yang mengisi defaultnya.
export function isPhraseRecord(value: unknown): value is Phrase {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.source === 'string' &&
    typeof p.romanized === 'string' &&
    typeof p.indonesian === 'string' &&
    timingOk(p.start) &&
    timingOk(p.end) &&
    (p.notes === undefined || typeof p.notes === 'string')
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
    p.phrases.every(isPhraseRecord) &&
    (p.audioName === undefined || p.audioName === null || typeof p.audioName === 'string') &&
    (p.audioDuration === undefined ||
      p.audioDuration === null ||
      (typeof p.audioDuration === 'number' && Number.isFinite(p.audioDuration)))
  )
}

function timingOk(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'number' && Number.isFinite(value))
  )
}
