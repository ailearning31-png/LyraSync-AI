import { describe, expect, it } from 'vitest'
import { findActivePhraseId } from './activePhrase'
import type { Phrase } from './types'

function phrase(id: string, start: number | null, end: number | null): Phrase {
  return { id, source: '', romanized: '', indonesian: '', start, end, notes: '', candidates: [] }
}

describe('findActivePhraseId', () => {
  const phrases = [
    phrase('a', 0, 2),
    phrase('b', 2, 5),
    phrase('c', null, null),
    phrase('d', 7, null),
  ]

  it('sebelum frasa pertama tidak ada yang aktif', () => {
    expect(findActivePhraseId(phrases, -0.1)).toBeNull()
  })

  it('waktu di dalam rentang mengembalikan frasa yang tepat', () => {
    expect(findActivePhraseId(phrases, 0)).toBe('a')
    expect(findActivePhraseId(phrases, 1.99)).toBe('a')
    expect(findActivePhraseId(phrases, 2)).toBe('b')
    expect(findActivePhraseId(phrases, 4.99)).toBe('b')
  })

  it('waktu tepat di end tidak lagi aktif untuk frasa itu', () => {
    expect(findActivePhraseId(phrases, 5)).toBeNull()
  })

  it('end null berarti terbuka sampai tak terbatas', () => {
    expect(findActivePhraseId(phrases, 100)).toBe('d')
  })

  it('frasa tanpa start diabaikan', () => {
    expect(findActivePhraseId([phrase('c', null, null)], 3)).toBeNull()
  })

  it('tumpang tindih: frasa dengan start terbesar yang menang', () => {
    const overlapping = [phrase('x', 0, 10), phrase('y', 4, 6)]
    expect(findActivePhraseId(overlapping, 5)).toBe('y')
    expect(findActivePhraseId(overlapping, 3)).toBe('x')
  })

  it('frasa kosong mengembalikan null', () => {
    expect(findActivePhraseId([], 1)).toBeNull()
  })
})
