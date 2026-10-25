import { describe, expect, it } from 'vitest'
import { formatTimestamp, parseTimeInput } from './timeFormat'

describe('formatTimestamp', () => {
  it('memformat detik menjadi m:ss.d', () => {
    expect(formatTimestamp(0)).toBe('0:00.0')
    expect(formatTimestamp(0.5)).toBe('0:00.5')
    expect(formatTimestamp(3)).toBe('0:03.0')
    expect(formatTimestamp(62.5)).toBe('1:02.5')
    expect(formatTimestamp(3725.25)).toBe('62:05.2')
  })

  it('menangani nilai tidak valid dengan string kosong', () => {
    expect(formatTimestamp(null)).toBe('')
    expect(formatTimestamp(-1)).toBe('')
    expect(formatTimestamp(Number.NaN)).toBe('')
    expect(formatTimestamp(Number.POSITIVE_INFINITY)).toBe('')
  })
})

describe('parseTimeInput', () => {
  it('menerima format m:ss.d dan detik polos', () => {
    expect(parseTimeInput('0:00.5')).toBe(0.5)
    expect(parseTimeInput('1:02.0')).toBe(62)
    expect(parseTimeInput('01:05.25')).toBe(65.25)
    expect(parseTimeInput('1:02,5')).toBe(62.5)
    expect(parseTimeInput('2.5')).toBe(2.5)
    expect(parseTimeInput('0:00')).toBe(0)
  })

  it('menolak input tidak valid dengan null', () => {
    expect(parseTimeInput('')).toBeNull()
    expect(parseTimeInput('   ')).toBeNull()
    expect(parseTimeInput('abc')).toBeNull()
    expect(parseTimeInput('-3')).toBeNull()
    expect(parseTimeInput('1:75')).toBeNull()
  })

  it('roundtrip: parse dari hasil format tetap konsisten pada presisi sepersepuluh', () => {
    for (const seconds of [0, 0.5, 3, 62.5, 125.7]) {
      expect(parseTimeInput(formatTimestamp(seconds))).toBeCloseTo(seconds, 1)
    }
  })
})
