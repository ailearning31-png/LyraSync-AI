// Analisis energi sederhana yang dapat dijelaskan (Fase 6 MVP):
// envelope RMS per frame → segmen suara vs jeda. SEMUA hasil adalah
// ESTIMASI: musik nyata punya bagian pelan yang bukan jeda; koreksi
// manual tetap sumber utama. Murni lokal (Web Audio API), tanpa dependensi.

export interface PauseSuggestion {
  start: number
  end: number
  duration: number
}

export interface SoundSegment {
  /** Awal segmen = onset kandidat. */
  start: number
  end: number
}

export interface AnalysisResult {
  segments: SoundSegment[]
  pauses: PauseSuggestion[]
  duration: number
  peakRms: number
  threshold: number
}

export interface AnalysisOptions {
  windowMs?: number
  hopMs?: number
  /** Frame dianggap senyap bila RMS < peakFraction × RMS puncak. */
  peakFraction?: number
  minPauseMs?: number
  minSegmentMs?: number
}

export function analyzeEnergyPcm(
  samples: Float32Array,
  sampleRate: number,
  options: AnalysisOptions = {},
): AnalysisResult {
  const windowMs = options.windowMs ?? 50
  const hopMs = options.hopMs ?? 25
  const peakFraction = options.peakFraction ?? 0.05
  const minPauseMs = options.minPauseMs ?? 250
  const minSegmentMs = options.minSegmentMs ?? 150
  const duration = samples.length / sampleRate
  const empty: AnalysisResult = {
    segments: [],
    pauses: [],
    duration,
    peakRms: 0,
    threshold: 0,
  }
  if (samples.length === 0 || sampleRate <= 0) return empty

  const win = Math.max(1, Math.round((windowMs / 1000) * sampleRate))
  const hop = Math.max(1, Math.round((hopMs / 1000) * sampleRate))

  const frameRms: number[] = []
  for (let start = 0; start < samples.length; start += hop) {
    const end = Math.min(start + win, samples.length)
    let sum = 0
    for (let i = start; i < end; i += 1) {
      sum += samples[i] * samples[i]
    }
    frameRms.push(Math.sqrt(sum / Math.max(1, end - start)))
  }

  const peakRms = frameRms.reduce((max, value) => Math.max(max, value), 0)
  if (peakRms <= 0) return { ...empty, duration }

  const threshold = peakRms * peakFraction
  const windowSec = windowMs / 1000

  // Runs suara: dari frame bersuara pertama sampai terakhir (+panjang window)
  const segments: SoundSegment[] = []
  let current: SoundSegment | null = null
  for (let i = 0; i < frameRms.length; i += 1) {
    const time = (i * hop) / sampleRate
    if (frameRms[i] >= threshold) {
      if (current === null) current = { start: time, end: time + windowSec }
      else current.end = time + windowSec
    } else if (current !== null) {
      segments.push(current)
      current = null
    }
  }
  if (current !== null) segments.push(current)

  const keptSegments = segments.filter(
    (segment) => segment.end - segment.start >= minSegmentMs / 1000,
  )

  const pauses: PauseSuggestion[] = []
  for (let i = 1; i < keptSegments.length; i += 1) {
    const gapStart = keptSegments[i - 1].end
    const gapEnd = keptSegments[i].start
    const gap = Math.round((gapEnd - gapStart) * 100) / 100
    if (gap >= minPauseMs / 1000) {
      pauses.push({ start: gapStart, end: gapEnd, duration: gap })
    }
  }

  return { segments: keptSegments, pauses, duration, peakRms, threshold }
}

type DecodingContext = AudioContext | OfflineAudioContext

async function decodeWith(
  context: DecodingContext,
  blob: Blob,
): Promise<{ samples: Float32Array; sampleRate: number; duration: number }> {
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer())
    const channels = buffer.numberOfChannels
    const out = new Float32Array(buffer.length)
    for (let c = 0; c < channels; c += 1) {
      const data = buffer.getChannelData(c)
      for (let i = 0; i < out.length; i += 1) {
        out[i] += data[i] / channels
      }
    }
    return { samples: out, sampleRate: buffer.sampleRate, duration: buffer.duration }
  } finally {
    // OfflineAudioContext di beberapa versi lib tidak mendeklarasikan close()
    void (context as { close?: () => Promise<void> }).close?.()
  }
}

/** Decode blob audio menjadi PCM mono untuk analisis (butuh Web Audio API). */
export async function decodeForAnalysis(
  blob: Blob,
): Promise<{ samples: Float32Array; sampleRate: number; duration: number }> {
  const g = globalThis as {
    AudioContext?: typeof AudioContext
    OfflineAudioContext?: typeof OfflineAudioContext
  }
  // OfflineAudioContext dipilih bila tersedia: decode tidak butuh perangkat
  // audio keluaran (lebih andal di lingkungan headless).
  if (g.OfflineAudioContext !== undefined) {
    return decodeWith(new g.OfflineAudioContext(1, 1, 44100), blob)
  }
  if (g.AudioContext !== undefined) {
    return decodeWith(new g.AudioContext(), blob)
  }
  throw new Error('Web Audio API tidak tersedia di lingkungan ini.')
}
