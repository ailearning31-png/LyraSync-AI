import { describe, expect, it } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('memformat detik menjadi m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(5)).toBe('0:05')
    expect(formatDuration(59.9)).toBe('0:59')
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(212.224)).toBe('3:32')
    expect(formatDuration(600)).toBe('10:00')
    expect(formatDuration(3725)).toBe('62:05')
  })

  it('menangani nilai tidak valid dengan aman', () => {
    expect(formatDuration(-3)).toBe('0:00')
    expect(formatDuration(Number.NaN)).toBe('0:00')
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00')
  })
})
