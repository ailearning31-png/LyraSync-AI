import { describe, expect, it } from 'vitest'
import { applyGeneratedCandidates } from './apply'
import type { Candidate } from '../types'
import type { GeneratedCandidate } from './types'

function makeCandidate(text: string, overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: `c-${text || 'kosong'}`,
    text,
    syllablesOverride: null,
    scores: { meaning: null, naturalness: null, rhythm: null, stress: null, singability: null },
    notes: '',
    generatedBy: null,
    ...overrides,
  }
}

const generated: GeneratedCandidate[] = [
  { slot: 'meaning', text: 'A1', rationale: 'setia makna' },
  { slot: 'balanced', text: 'B1', rationale: 'seimbang' },
  { slot: 'singability', text: 'C1', rationale: 'mudah dinyanyikan' },
]

describe('applyGeneratedCandidates', () => {
  it('mengisi slot kosong berurutan A/B/C dengan penjejak model', () => {
    const { candidates, filled } = applyGeneratedCandidates([], generated, 'model-uji')
    expect(filled).toBe(3)
    expect(candidates.map((c) => c.text)).toEqual(['A1', 'B1', 'C1'])
    expect(candidates[0].generatedBy).toBe('model-uji')
    expect(candidates[0].notes).toBe('[AI model-uji] setia makna')
  })

  it('TIDAK menimpa teks tulisan pengguna', () => {
    const existing = [makeCandidate('punya pengguna', { notes: 'catatan saya' })]
    const { candidates, filled } = applyGeneratedCandidates(existing, generated, 'm')
    expect(filled).toBe(2) // hanya slot B dan C yang kosong
    expect(candidates[0].text).toBe('punya pengguna')
    expect(candidates[0].notes).toBe('catatan saya')
    expect(candidates[0].generatedBy).toBeNull()
    expect(candidates[1].text).toBe('B1')
  })

  it('slot A kosong tapi B terisi: AI tetap mengisi A dan C', () => {
    const existing = [makeCandidate(''), makeCandidate('B pengguna')]
    const { candidates, filled } = applyGeneratedCandidates(existing, generated, 'm')
    expect(filled).toBe(2)
    expect(candidates[0].text).toBe('A1')
    expect(candidates[1].text).toBe('B pengguna')
    expect(candidates[2].text).toBe('C1')
  })
})
