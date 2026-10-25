import { describe, expect, it } from 'vitest'
import {
  computeDensity,
  densityRisk,
  effectiveSyllables,
  estimateSyllables,
  weightedTotal,
} from './heuristics'

describe('estimateSyllables', () => {
  it('menghitung kelompok vokal per kata untuk teks Indonesia', () => {
    expect(estimateSyllables('bukan cinta biasa')).toEqual({ count: 7, uncertain: false })
    expect(estimateSyllables('Indonesia raya')).toEqual({ count: 7, uncertain: false })
    expect(estimateSyllables('bukan, cinta!')).toEqual({ count: 4, uncertain: false })
  })

  it('diftong menyatu menjadi satu suku kata', () => {
    expect(estimateSyllables('pantai')).toEqual({ count: 2, uncertain: false })
    expect(estimateSyllables('bangau')).toEqual({ count: 2, uncertain: false })
  })

  it('teks kosong menghasilkan nol tanpa tanda tidak pasti', () => {
    expect(estimateSyllables('   ')).toEqual({ count: 0, uncertain: false })
  })

  it('kana dihitung per mora', () => {
    expect(estimateSyllables('テスト')).toEqual({ count: 3, uncertain: false })
    expect(estimateSyllables('ありがとう')).toEqual({ count: 5, uncertain: false })
  })

  it('kanji tidak bisa dihitung otomatis: ditandai tidak pasti', () => {
    expect(estimateSyllables('太陽')).toEqual({ count: 0, uncertain: true })
    expect(estimateSyllables('太陽の光')).toEqual({ count: 1, uncertain: true })
  })

  it('kata tanpa vokal ditandai tidak pasti', () => {
    expect(estimateSyllables('TV')).toEqual({ count: 0, uncertain: true })
  })
})

describe('effectiveSyllables', () => {
  it('koreksi manual menang atas estimasi', () => {
    expect(effectiveSyllables('bukan', 9)).toBe(9)
  })

  it('tanpa override memakai estimasi; teks kosong menghasilkan null', () => {
    expect(effectiveSyllables('bukan', null)).toBe(2)
    expect(effectiveSyllables('   ', null)).toBeNull()
  })

  it('override tidak valid diabaikan', () => {
    expect(effectiveSyllables('bukan', Number.NaN)).toBe(2)
  })
})

describe('computeDensity', () => {
  it('membagi suku kata dengan durasi (1 desimal)', () => {
    expect(computeDensity(7, 2)).toBe(3.5)
    expect(computeDensity(4, 3)).toBe(1.3)
  })

  it('null bila data belum cukup', () => {
    expect(computeDensity(null, 2)).toBeNull()
    expect(computeDensity(7, null)).toBeNull()
    expect(computeDensity(7, 0)).toBeNull()
  })
})

describe('densityRisk', () => {
  it('membandingkan kepadatan kandidat vs sumber dengan ambang hipotesis', () => {
    expect(densityRisk(3.5, 3.5).level).toBe('setara')
    expect(densityRisk(4.5, 3.0).level).toBe('padat')
    expect(densityRisk(2.0, 3.0).level).toBe('renggang')
    expect(densityRisk(3.75, 3.0).level).toBe('padat') // tepat 1.25
    expect(densityRisk(2.1, 3.0).level).toBe('renggang') // tepat 0.7
  })

  it('belum cukup data bila salah satu kosong atau sumber nol', () => {
    expect(densityRisk(null, 3).level).toBe('nodata')
    expect(densityRisk(2, null).level).toBe('nodata')
    expect(densityRisk(2, 0).level).toBe('nodata')
  })
})

describe('weightedTotal', () => {
  it('menghitung 30/20/20/20/10 bila kelima dimensi terisi', () => {
    expect(
      weightedTotal({ meaning: 3, naturalness: 4, rhythm: 4, stress: 3, singability: 4 }),
    ).toBe(3.6)
  })

  it('null bila ada dimensi yang belum diisi: tanpa presisi palsu', () => {
    expect(
      weightedTotal({ meaning: 3, naturalness: 4, rhythm: 4, stress: 3, singability: null }),
    ).toBeNull()
  })
})
