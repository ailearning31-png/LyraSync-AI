import type { CandidateScores } from './types'

// ===== SEMUA ANGKA DI MODUL INI ADALAH HEURISTIK/ESTIMASI =====
// Mereka membantu membandingkan kandidat, tetapi TIDAK membuktikan
// kecocokan melodi. Audio dan telinga manusia tetap yang menentukan.

/**
 * Bobot skor berbobot — HIPOTESIS awal dari master prompt, belum terkalibrasi.
 * Kalibrasi hanya boleh dilakukan dari data eksperimen nyata (EXP-0001 dst.).
 */
export const SCORE_WEIGHTS = {
  rhythm: 0.3,
  stress: 0.2,
  singability: 0.2,
  meaning: 0.2,
  naturalness: 0.1,
} as const

export interface SyllableEstimate {
  count: number
  uncertain: boolean
}

/**
 * Estimasi suku kata / mora.
 * - Teks Latin (Indonesia): hitung kelompok vokal per kata (diftong "ai/au/oi"
 *   otomatis menyatu karena teregex sebagai satu kelompok).
 * - Jepang: kana ≈ 1 mora. Kanji TIDAK bisa dihitung otomatis → uncertain.
 * - Kata tanpa vokal (mis. singkatan "TV") → uncertain.
 */
export function estimateSyllables(text: string): SyllableEstimate {
  const trimmed = text.trim()
  if (trimmed === '') return { count: 0, uncertain: false }

  const kana = trimmed.match(/[\u3040-\u30FF]/g)
  const kanaCount = kana !== null ? kana.length : 0
  const kanji = trimmed.match(/[\u3400-\u9FFF\uF900-\uFAFF]/g)
  const kanjiCount = kanji !== null ? kanji.length : 0
  if (kanaCount > 0 || kanjiCount > 0) {
    return { count: kanaCount, uncertain: kanjiCount > 0 || kanaCount === 0 }
  }

  const words = trimmed.toLowerCase().match(/[a-z]+/g)
  if (words === null) return { count: 0, uncertain: true }

  let count = 0
  let uncertain = false
  for (const word of words) {
    const vowels = word.match(/[aeiou]/g)
    if (vowels === null) {
      uncertain = true // huruf tanpa vokal (mis. singkatan "TV")
      continue
    }
    // Tiap vokal = satu nukleus (urutan vokal di tengah kata lazim berhiatus:
    // bi-a-sa, di-a). Diftong ai/au/oi hanya disatukan di akhir kata (pan-tai).
    let syllables = vowels.length
    if (/(ai|au|oi)$/.test(word)) syllables -= 1
    count += Math.max(syllables, 1)
  }
  return { count, uncertain }
}

/** Jumlah suku kata efektif: koreksi manual menang atas estimasi otomatis. */
export function effectiveSyllables(
  text: string,
  override: number | null,
): number | null {
  if (override !== null && Number.isFinite(override) && override >= 0) {
    return override
  }
  if (text.trim() === '') return null
  return estimateSyllables(text).count
}

/** Kepadatan suku kata per detik; null bila data belum cukup. */
export function computeDensity(
  syllables: number | null,
  durationSeconds: number | null,
): number | null {
  if (
    syllables === null ||
    durationSeconds === null ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null
  }
  return Math.round((syllables / durationSeconds) * 10) / 10
}

export type RiskLevel = 'padat' | 'renggang' | 'setara' | 'nodata'

/**
 * Bandingkan kepadatan kandidat vs sumber. Ambang 1,25 / 0,7 adalah
 * HIPOTESIS awal — harus dikalibrasi dari eksperimen nyata.
 */
export function densityRisk(
  candidateDensity: number | null,
  sourceDensity: number | null,
): { level: RiskLevel; label: string } {
  if (candidateDensity === null || sourceDensity === null || sourceDensity <= 0) {
    return { level: 'nodata', label: 'belum cukup data' }
  }
  const ratio = candidateDensity / sourceDensity
  // Epsilon melindungi dari sisa floating point (mis. 2.1/3.0 = 0.70000...01)
  if (ratio >= 1.25 - 1e-9) return { level: 'padat', label: 'berisiko padat' }
  if (ratio <= 0.7 + 1e-9) return { level: 'renggang', label: 'berisiko renggang' }
  return { level: 'setara', label: 'setara' }
}

/**
 * Total berbobot hanya dihitung bila KELIMA dimensi terisi — selain itu null
 * (ditampilkan "belum cukup data") supaya tidak ada presisi palsu.
 */
export function weightedTotal(scores: CandidateScores): number | null {
  const values = [
    scores.rhythm,
    scores.stress,
    scores.singability,
    scores.meaning,
    scores.naturalness,
  ]
  if (values.some((value) => value === null || !Number.isFinite(value))) {
    return null
  }
  const total =
    SCORE_WEIGHTS.rhythm * (scores.rhythm as number) +
    SCORE_WEIGHTS.stress * (scores.stress as number) +
    SCORE_WEIGHTS.singability * (scores.singability as number) +
    SCORE_WEIGHTS.meaning * (scores.meaning as number) +
    SCORE_WEIGHTS.naturalness * (scores.naturalness as number)
  return Math.round(total * 10) / 10
}
