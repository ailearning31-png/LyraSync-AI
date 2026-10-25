import { useCallback, useEffect, useRef, useState } from 'react'

export interface AudioPlayerApi {
  /** Nama file yang sedang dimuat; null = tidak ada audio. */
  name: string | null
  duration: number | null
  currentTime: number
  playing: boolean
  error: string | null
  loadBlob: (blob: Blob, name: string) => void
  toggle: () => void
  seek: (time: number) => void
  reset: () => void
}

export function useAudioPlayer(
  onDurationKnown?: (duration: number) => void,
): AudioPlayerApi {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const durationCallbackRef = useRef(onDurationKnown)
  const [name, setName] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    durationCallbackRef.current = onDurationKnown
  })

  const handleDuration = useCallback((value: number) => {
    const finite = Number.isFinite(value) ? value : null
    setDuration(finite)
    if (finite !== null) durationCallbackRef.current?.(finite)
  }, [])

  // Satu elemen Audio untuk seluruh siklus hidup hook: tidak ada kemungkinan
  // playback ganda karena selalu elemen yang sama yang diputar/dijeda.
  const ensureElement = useCallback((): HTMLAudioElement => {
    if (audioRef.current !== null) return audioRef.current
    const el = new Audio()
    el.preload = 'metadata'
    el.addEventListener('timeupdate', () => setCurrentTime(el.currentTime))
    el.addEventListener('loadedmetadata', () => handleDuration(el.duration))
    el.addEventListener('durationchange', () => handleDuration(el.duration))
    el.addEventListener('play', () => setPlaying(true))
    el.addEventListener('pause', () => setPlaying(false))
    el.addEventListener('ended', () => setPlaying(false))
    el.addEventListener('error', () => {
      setError('Audio tidak dapat diputar: format mungkin tidak didukung atau file rusak.')
      setPlaying(false)
    })
    audioRef.current = el
    return el
  }, [handleDuration])

  const loadBlob = useCallback(
    (blob: Blob, audioName: string) => {
      if (urlRef.current !== null) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(blob)
      urlRef.current = url
      const el = ensureElement()
      el.src = url
      el.load()
      setName(audioName)
      setCurrentTime(0)
      setPlaying(false)
      setError(null)
    },
    [ensureElement],
  )

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (el === null || el.src === '') return
    if (el.paused) {
      void el.play().catch(() => {
        setError('Gagal memutar audio.')
        setPlaying(false)
      })
    } else {
      el.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    const el = audioRef.current
    if (el === null) return
    const max = Number.isFinite(el.duration) ? el.duration : time
    const clamped = Math.min(Math.max(time, 0), max)
    el.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  const reset = useCallback(() => {
    const el = audioRef.current
    if (el !== null) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    if (urlRef.current !== null) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setName(null)
    setDuration(null)
    setCurrentTime(0)
    setPlaying(false)
    setError(null)
  }, [])

  useEffect(
    () => () => {
      const el = audioRef.current
      if (el !== null) el.pause()
      if (urlRef.current !== null) URL.revokeObjectURL(urlRef.current)
    },
    [],
  )

  return { name, duration, currentTime, playing, error, loadBlob, toggle, seek, reset }
}
