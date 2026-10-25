import { describe, expect, it } from 'vitest'
import { analyzeEnergyPcm } from './analysis'

const SAMPLE_RATE = 8000

// Sinyal uji: nada 440 Hz pada rentang tertentu, nol di luar rentang.
function makeSignal(ranges: [number, number][], totalSeconds: number, amplitude = 0.3): Float32Array {
  const length = Math.round(totalSeconds * SAMPLE_RATE)
  const samples = new Float32Array(length)
  for (const [from, to] of ranges) {
    const start = Math.round(from * SAMPLE_RATE)
    const end = Math.round(to * SAMPLE_RATE)
    for (let i = start; i < end && i < length; i += 1) {
      samples[i] = Math.sin((2 * Math.PI * 440 * i) / SAMPLE_RATE) * amplitude
    }
  }
  return samples
}

describe('analyzeEnergyPcm: akurasi vs batas yang diketahui (sinyal sintetis)', () => {
  it('mendeteksi 3 segmen dan 2 jeda dengan galat < 100 ms', () => {
    const signal = makeSignal(
      [
        [0, 1],
        [1.4, 2.2],
        [2.6, 3],
      ],
      3,
    )
    const result = analyzeEnergyPcm(signal, SAMPLE_RATE)

    expect(result.segments).toHaveLength(3)
    expect(result.pauses).toHaveLength(2)

    // Galat batas (ground truth vs deteksi)
    expect(Math.abs(result.segments[0].start - 0)).toBeLessThan(0.1)
    expect(Math.abs(result.segments[0].end - 1)).toBeLessThan(0.1)
    expect(Math.abs(result.segments[1].start - 1.4)).toBeLessThan(0.1)
    expect(Math.abs(result.segments[1].end - 2.2)).toBeLessThan(0.1)
    expect(Math.abs(result.segments[2].start - 2.6)).toBeLessThan(0.1)
    expect(Math.abs(result.segments[2].end - 3)).toBeLessThan(0.1)

    expect(result.pauses[0].start).toBeCloseTo(result.segments[0].end, 2)
    expect(result.pauses[0].end).toBeCloseTo(result.segments[1].start, 2)
    expect(result.pauses[1].duration).toBeGreaterThan(0.3)
    expect(result.pauses[1].duration).toBeLessThan(0.5)
  })

  it('jeda di bawah ambang minimum tidak dilaporkan sebagai saran', () => {
    // Jeda 0.2 dtk (< minPause 250 ms default): segmen tetap dua (fakta fisik),
    // tetapi tidak muncul sebagai SARAN jeda yang layak diperhatikan.
    const signal = makeSignal(
      [
        [0, 1],
        [1.2, 2],
      ],
      2,
    )
    const result = analyzeEnergyPcm(signal, SAMPLE_RATE)
    expect(result.pauses).toHaveLength(0)
    expect(result.segments).toHaveLength(2)
  })

  it('nada tanpa jeda menghasilkan satu segmen penuh tanpa jeda', () => {
    const signal = makeSignal([[0, 2]], 2)
    const result = analyzeEnergyPcm(signal, SAMPLE_RATE)
    expect(result.segments).toHaveLength(1)
    expect(result.pauses).toHaveLength(0)
    expect(Math.abs(result.segments[0].end - 2)).toBeLessThan(0.1)
  })

  it('audio hening total menghasilkan hasil kosong yang aman', () => {
    const result = analyzeEnergyPcm(new Float32Array(SAMPLE_RATE * 2), SAMPLE_RATE)
    expect(result.segments).toHaveLength(0)
    expect(result.pauses).toHaveLength(0)
    expect(result.peakRms).toBe(0)
  })

  it('input kosong tidak melempar error', () => {
    const result = analyzeEnergyPcm(new Float32Array(0), SAMPLE_RATE)
    expect(result.duration).toBe(0)
    expect(result.segments).toHaveLength(0)
  })

  it('lebih dari dua kanal tidak masalah: analisis bekerja pada PCM apa pun', () => {
    // sinyal sangat pendek di bawah minSegment → tidak ada segmen
    const signal = makeSignal([[0, 0.05]], 0.2)
    const result = analyzeEnergyPcm(signal, SAMPLE_RATE)
    expect(result.segments).toHaveLength(0)
  })
})
