import { useEffect, useRef } from 'react'
import { findActivePhraseId } from '../../shared/activePhrase'
import { formatTimestamp } from '../../shared/timeFormat'
import type { Phrase } from '../../shared/types'

// Overlay lirik terkoordinasi: frasa yang rentang waktunya memuat posisi
// audio ditandai aktif (aria-current) dan otomatis digulir ke pandangan.
// Semua waktu berasal dari entri manual — tidak pernah ditebak dari panjang teks.
export function Overlay({
  phrases,
  currentTime,
  canSeek,
  onSeek,
}: {
  phrases: Phrase[]
  currentTime: number
  canSeek: boolean
  onSeek: (time: number) => void
}) {
  const activeId = findActivePhraseId(phrases, currentTime)
  const activeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  if (phrases.length === 0) return null

  return (
    <div className="overlay" aria-label="Overlay lirik">
      {phrases.map((phrase, index) => {
        const isActive = phrase.id === activeId
        return (
          <div
            key={phrase.id}
            ref={isActive ? activeRef : undefined}
            className={isActive ? 'overlay-line active' : 'overlay-line'}
            aria-current={isActive ? 'true' : undefined}
            onClick={canSeek ? () => onSeek(phrase.start ?? 0) : undefined}
            title={canSeek ? 'Klik untuk melompat ke frasa ini' : undefined}
          >
            <span className="overlay-time">
              {phrase.start !== null ? formatTimestamp(phrase.start) : '—'}
            </span>
            <span className="overlay-texts">
              <span className="overlay-index">#{index + 1}</span>
              <span className="overlay-source">{phrase.source || '…'}</span>
              {phrase.romanized.trim() !== '' && (
                <span className="overlay-roman">{phrase.romanized}</span>
              )}
              <span className="overlay-id">{phrase.indonesian || '…'}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
