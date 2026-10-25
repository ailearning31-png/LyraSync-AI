import type { Candidate } from '../types'
import type { GeneratedCandidate } from './types'

const SLOT_ORDER: GeneratedCandidate['slot'][] = ['meaning', 'balanced', 'singability']

/**
 * Mengisi slot kandidat dari hasil AI secara NON-DESTRUKTIF: hanya slot yang
 * teksnya kosong yang diisi — teks tulisan pengguna tidak pernah ditimpa.
 * Rationale disimpan di catatan kandidat dengan penanda [AI model].
 */
export function applyGeneratedCandidates(
  candidates: Candidate[],
  generated: GeneratedCandidate[],
  model: string,
): { candidates: Candidate[]; filled: number } {
  const next = candidates.map((candidate) => ({ ...candidate }))
  let filled = 0

  for (const item of generated) {
    const slotIndex = SLOT_ORDER.indexOf(item.slot)
    if (slotIndex < 0) continue

    while (next.length < slotIndex + 1) {
      next.push({
        id: crypto.randomUUID(),
        text: '',
        syllablesOverride: null,
        scores: {
          meaning: null,
          naturalness: null,
          rhythm: null,
          stress: null,
          singability: null,
        },
        notes: '',
        generatedBy: null,
      })
    }

    const target = next[slotIndex]
    if (target.text.trim() !== '') continue // slot terisi — tidak ditimpa
    next[slotIndex] = {
      ...target,
      text: item.text,
      generatedBy: model,
      notes: `[AI ${model}] ${item.rationale}`.trim(),
    }
    filled += 1
  }

  return { candidates: next, filled }
}
