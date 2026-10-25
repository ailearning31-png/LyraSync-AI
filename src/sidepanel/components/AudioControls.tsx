import { formatTimestamp } from '../../shared/timeFormat'
import type { AudioPlayerApi } from '../hooks/useAudioPlayer'

export function AudioControls({
  player,
  hasStoredAudio,
  onImportFile,
  onRemoveAudio,
}: {
  player: AudioPlayerApi
  hasStoredAudio: boolean
  onImportFile: (file: File) => void
  onRemoveAudio: () => void
}) {
  return (
    <section className="player" aria-label="Pemutar audio">
      <div className="player-row">
        <label htmlFor="audio-file" className="button-like">
          {hasStoredAudio ? 'Ganti audio' : 'Impor audio lokal'}
        </label>
        <input
          id="audio-file"
          type="file"
          accept="audio/*"
          className="visually-hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file !== undefined) onImportFile(file)
            event.target.value = ''
          }}
        />

        {player.name !== null && (
          <>
            <button type="button" onClick={player.toggle}>
              {player.playing ? 'Jeda' : 'Putar'}
            </button>
            <button type="button" className="danger" onClick={onRemoveAudio}>
              Hapus audio
            </button>
          </>
        )}
      </div>

      {player.error !== null && (
        <p className="player-error" role="alert">
          {player.error}
        </p>
      )}

      {player.name !== null && (
        <>
          <div className="player-row">
            <input
              type="range"
              className="seek"
              min={0}
              max={Math.max(player.duration ?? 0, 0.1)}
              step={0.1}
              value={Math.min(player.currentTime, player.duration ?? player.currentTime)}
              onChange={(event) => player.seek(Number(event.target.value))}
              aria-label="Posisi audio"
            />
            <span className="player-time">
              {formatTimestamp(player.currentTime)}
              {' / '}
              {player.duration !== null
                ? formatTimestamp(player.duration)
                : '…'}
            </span>
          </div>
          <p className="player-meta">
            {player.name}
            {player.duration === null ? ' · membaca durasi…' : ''}
          </p>
        </>
      )}
    </section>
  )
}
