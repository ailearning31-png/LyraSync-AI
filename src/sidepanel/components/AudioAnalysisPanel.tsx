import { useState } from 'react'
import {
  analyzeEnergyPcm,
  decodeForAnalysis,
  type AnalysisResult,
} from '../../shared/audio/analysis'
import { formatTimestamp } from '../../shared/timeFormat'

// Panel analisis jeda berbasis energi. SEMUA hasil berlabel estimasi;
// tujuannya mempercepat penandaan waktu manual, bukan menggantikannya.
export function AudioAnalysisPanel({
  audioBlob,
  onSeek,
}: {
  audioBlob: Blob | null
  onSeek: (time: number) => void
}) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    if (audioBlob === null || running) return
    setRunning(true)
    setError(null)
    try {
      const decoded = await decodeForAnalysis(audioBlob)
      setResult(analyzeEnergyPcm(decoded.samples, decoded.sampleRate))
    } catch (err) {
      setError(
        `Analisis gagal: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="analysis" aria-label="Analisis jeda">
      <div className="player-row">
        <button
          type="button"
          disabled={audioBlob === null || running}
          title="Deteksi jeda antar frasa berbasis energi: estimasi otomatis, koreksi manual tetap sumber utama"
          onClick={() => void handleRun()}
        >
          {running ? 'Menganalisis…' : 'Analisis jeda (estimasi)'}
        </button>
        {result !== null && (
          <span className="analysis-summary">
            {result.segments.length} segmen suara · {result.pauses.length} jeda
            {' '}· durasi {formatTimestamp(result.duration)}
          </span>
        )}
      </div>

      {error !== null && (
        <p className="player-error" role="alert">
          {error}
        </p>
      )}

      {result !== null && (
        <>
          <p className="analysis-note">
            Estimasi otomatis berbasis energi (ambang {result.threshold.toFixed(4)} dari
            puncak). Musik nyata punya bagian pelan yang bukan jeda: verifikasi
            dengan telinga dan koreksi manual.
          </p>
          {result.pauses.length === 0 ? (
            <p className="empty-hint">Tidak ada jeda ≥ 0,25 dtk terdeteksi.</p>
          ) : (
            <ul className="analysis-pauses">
              {result.pauses.map((pause) => (
                <li key={`${pause.start}-${pause.end}`}>
                  <button
                    type="button"
                    onClick={() => onSeek(pause.start)}
                    title="Klik untuk mendengarkan mulai awal jeda ini"
                  >
                    Jeda {formatTimestamp(pause.start)} – {formatTimestamp(pause.end)} ({pause.duration} dtk)
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
