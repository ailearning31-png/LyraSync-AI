import { useState } from 'react'
import {
  computeDensity,
  densityRisk,
  effectiveSyllables,
  estimateSyllables,
  weightedTotal,
} from '../../shared/heuristics'
import type { Candidate, CandidateScores, Phrase } from '../../shared/types'

const SLOT_NAMES = [
  'A: meaning-first',
  'B: balanced',
  'C: singability-first',
] as const

const SCORE_FIELDS: { key: keyof CandidateScores; label: string }[] = [
  { key: 'meaning', label: 'makna' },
  { key: 'naturalness', label: 'alami' },
  { key: 'rhythm', label: 'ritme' },
  { key: 'stress', label: 'stres' },
  { key: 'singability', label: 'nyanyi' },
]

export interface CandidateSectionHandlers {
  onAdd: () => void
  onChange: (candId: string, patch: Partial<Candidate>) => void
  onScoreChange: (
    candId: string,
    dim: keyof CandidateScores,
    value: number | null,
  ) => void
  onDelete: (candId: string) => void
  onUse: (candId: string) => void
  onGenerateAi: () => void
}

export function CandidateSection({
  phrase,
  duration,
  generating,
  handlers,
}: {
  phrase: Phrase
  duration: number | null
  generating: boolean
  handlers: CandidateSectionHandlers
}) {
  const [showCompare, setShowCompare] = useState(false)
  const sourceEstimate = estimateSyllables(phrase.source)
  const sourceDensity =
    sourceEstimate.count > 0 ? computeDensity(sourceEstimate.count, duration) : null

  return (
    <div className="candidate-section">
      <div className="candidate-section-header">
        <span className="section-title">Kandidat adaptasi (maks 3)</span>
        <span className="candidate-spacer" />
        {phrase.candidates.length > 0 && (
          <button type="button" onClick={() => setShowCompare((v) => !v)}>
            {showCompare ? 'Tutup perbandingan' : 'Bandingkan'}
          </button>
        )}
        <button
          type="button"
          disabled={generating}
          title="Mengisi slot kandidat yang masih kosong memakai layanan AI dari tab Pengaturan. Teks yang sudah Anda tulis tidak akan ditimpa."
          onClick={handlers.onGenerateAi}
        >
          {generating ? 'Membuat…' : 'Buat kandidat (AI)'}
        </button>
        <button
          type="button"
          disabled={phrase.candidates.length >= 3}
          title={
            phrase.candidates.length >= 3 ? 'Maksimal 3 kandidat' : undefined
          }
          onClick={handlers.onAdd}
        >
          Tambah kandidat
        </button>
      </div>

      {phrase.candidates.length === 0 && (
        <p className="empty-hint">
          Belum ada kandidat. Tambahkan untuk membandingkan pendekatan
          meaning-first / balanced / singability-first.
        </p>
      )}

      {phrase.candidates.map((candidate, index) => (
        <CandidateRow
          key={candidate.id}
          slot={SLOT_NAMES[index] ?? `#${index + 1}`}
          candidate={candidate}
          duration={duration}
          sourceDensity={sourceDensity}
          handlers={handlers}
        />
      ))}

      {showCompare && phrase.candidates.length > 0 && (
        <CandidateTable
          candidates={phrase.candidates}
          duration={duration}
          sourceDensity={sourceDensity}
        />
      )}
    </div>
  )
}

function CandidateRow({
  slot,
  candidate,
  duration,
  sourceDensity,
  handlers,
}: {
  slot: string
  candidate: Candidate
  duration: number | null
  sourceDensity: number | null
  handlers: CandidateSectionHandlers
}) {
  const slotLetter = slot.charAt(0)
  const estimate = estimateSyllables(candidate.text)
  const syllables = effectiveSyllables(candidate.text, candidate.syllablesOverride)
  const density = computeDensity(syllables, duration)
  const risk = densityRisk(density, sourceDensity)
  const total = weightedTotal(candidate.scores)

  const syllableLabel =
    syllables === null
      ? 'suku kata: -'
      : `≈ ${syllables} suku kata${
          candidate.syllablesOverride !== null
            ? ' (koreksi manual)'
            : estimate.uncertain
              ? ' (estimasi, tidak pasti)'
              : ' (estimasi)'
        }`

  return (
    <div className="candidate">
      <div className="candidate-header">
        <span className="candidate-slot">{slot}</span>
        <span className="candidate-syllables">{syllableLabel}</span>
        {candidate.generatedBy !== null && (
          <span className="candidate-gen" title="Kandidat ini dibuat oleh layanan AI">
            oleh {candidate.generatedBy}
          </span>
        )}
        <span className="candidate-spacer" />
        <button
          type="button"
          aria-label={`Gunakan sebagai adaptasi (${slotLetter})`}
          disabled={candidate.text.trim() === ''}
          title="Salin teks kandidat ke kolom Bahasa Indonesia (adaptasi terpilih)"
          onClick={() => handlers.onUse(candidate.id)}
        >
          Gunakan
        </button>
        <button
          type="button"
          className="danger link"
          aria-label={`Hapus kandidat (${slotLetter})`}
          onClick={() => handlers.onDelete(candidate.id)}
        >
          Hapus
        </button>
      </div>

      <textarea
        aria-label={`Teks kandidat (${slotLetter})`}
        value={candidate.text}
        rows={2}
        placeholder="Tulis kandidat adaptasi untuk pendekatan ini"
        onChange={(event) =>
          handlers.onChange(candidate.id, { text: event.target.value })
        }
      />

      <div className="candidate-metrics">
        <span className="candidate-density">
          {density !== null && sourceDensity !== null
            ? `kepadatan ${density}/dtk vs sumber ${sourceDensity}/dtk${
                duration !== null ? ` (durasi ${duration.toFixed(1)} dtk)` : ''
              }`
            : 'kepadatan butuh teks kandidat + waktu Mulai & Akhir frasa'}
        </span>
        <span className={`chip chip-${risk.level}`}>
          {risk.label} (estimasi)
        </span>
      </div>

      <div className="candidate-override">
        <label htmlFor={`override-${candidate.id}`}>
          Koreksi suku kata ({slotLetter})
        </label>
        <input
          id={`override-${candidate.id}`}
          type="number"
          min={0}
          step={1}
          value={candidate.syllablesOverride ?? ''}
          placeholder="(pakai estimasi)"
          onChange={(event) => {
            const raw = event.target.value.trim()
            const num = Number(raw)
            handlers.onChange(candidate.id, {
              syllablesOverride:
                raw === '' || !Number.isFinite(num)
                  ? null
                  : Math.max(0, Math.round(num)),
            })
          }}
        />
        {candidate.syllablesOverride !== null && (
          <button
            type="button"
            aria-label={`Pakai estimasi (${slotLetter})`}
            onClick={() =>
              handlers.onChange(candidate.id, { syllablesOverride: null })
            }
          >
            Pakai estimasi
          </button>
        )}
      </div>

      <div className="candidate-scores">
        {SCORE_FIELDS.map(({ key, label }) => (
          <div key={key} className="score-field">
            <label htmlFor={`score-${key}-${candidate.id}`}>
              Skor {label} ({slotLetter})
            </label>
            <select
              id={`score-${key}-${candidate.id}`}
              value={candidate.scores[key] ?? ''}
              onChange={(event) =>
                handlers.onScoreChange(
                  candidate.id,
                  key,
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            >
              <option value="">-</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="candidate-total">
          {total === null
            ? 'belum cukup data'
            : `≈ ${total.toFixed(1)} (hipotesis 30/20/20/20/10)`}
        </div>
      </div>

      <textarea
        className="candidate-notes"
        aria-label={`Catatan kandidat (${slotLetter})`}
        value={candidate.notes}
        rows={1}
        placeholder="Catatan makna / kealamian (opsional)"
        onChange={(event) =>
          handlers.onChange(candidate.id, { notes: event.target.value })
        }
      />
    </div>
  )
}

function CandidateTable({
  candidates,
  duration,
  sourceDensity,
}: {
  candidates: Candidate[]
  duration: number | null
  sourceDensity: number | null
}) {
  return (
    <table className="candidate-table">
      <caption>
        Perbandingan berdampingan: semua angka estimasi/hipotesis, bukan bukti
        kecocokan melodi. Putar audio dan nyanyikan tiap kandidat untuk memutuskan.
      </caption>
      <thead>
        <tr>
          <th scope="col" aria-label="Aspek" />
          {candidates.map((candidate, index) => (
            <th key={candidate.id} scope="col">
              {(SLOT_NAMES[index] ?? `#${index + 1}`).charAt(0)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Teks</th>
          {candidates.map((c) => (
            <td key={c.id}>{c.text || '-'}</td>
          ))}
        </tr>
        <tr>
          <th scope="row">Suku kata (est.)</th>
          {candidates.map((c) => {
            const s = effectiveSyllables(c.text, c.syllablesOverride)
            return <td key={c.id}>{s === null ? '-' : `≈ ${s}`}</td>
          })}
        </tr>
        <tr>
          <th scope="row">Kepadatan (/dtk)</th>
          {candidates.map((c) => {
            const d = computeDensity(
              effectiveSyllables(c.text, c.syllablesOverride),
              duration,
            )
            return <td key={c.id}>{d === null ? '-' : d}</td>
          })}
        </tr>
        <tr>
          <th scope="row">Risiko (est.)</th>
          {candidates.map((c) => {
            const r = densityRisk(
              computeDensity(effectiveSyllables(c.text, c.syllablesOverride), duration),
              sourceDensity,
            )
            return <td key={c.id}>{r.label}</td>
          })}
        </tr>
        {SCORE_FIELDS.map(({ key, label }) => (
          <tr key={key}>
            <th scope="row">{label}</th>
            {candidates.map((c) => (
              <td key={c.id}>{c.scores[key] ?? '-'}</td>
            ))}
          </tr>
        ))}
        <tr>
          <th scope="row">Total berbobot</th>
          {candidates.map((c) => {
            const t = weightedTotal(c.scores)
            return <td key={c.id}>{t === null ? 'belum cukup data' : `≈ ${t.toFixed(1)}`}</td>
          })}
        </tr>
        <tr>
          <th scope="row">Catatan</th>
          {candidates.map((c) => (
            <td key={c.id}>{c.notes || '-'}</td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
