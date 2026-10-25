import type { Candidate, CandidateScores, Phrase } from '../../shared/types'
import { CandidateSection, type CandidateSectionHandlers } from './CandidateSection'
import { TimeField } from './TimeField'

const FIELD_LABELS: {
  field: keyof Omit<Phrase, 'id' | 'start' | 'end' | 'notes' | 'candidates'>
  label: string
  placeholder: string
}[] = [
  { field: 'source', label: 'Sumber', placeholder: 'Lirik sumber (mis. Jepang)' },
  {
    field: 'romanized',
    label: 'Romanisasi',
    placeholder: 'Romaji / pelafalan (opsional)',
  },
  {
    field: 'indonesian',
    label: 'Bahasa Indonesia',
    placeholder: 'Adaptasi Indonesia',
  },
]

export function PhraseCard({
  index,
  phrase,
  playerReady,
  confirmDelete,
  onChange,
  onTimeCommit,
  onSetFromPlayer,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onCandidateAdd,
  onCandidateChange,
  onCandidateScoreChange,
  onCandidateDelete,
  onUseCandidate,
  onGenerateAi,
  generatingAi,
}: {
  index: number
  phrase: Phrase
  playerReady: boolean
  confirmDelete: boolean
  onChange: (
    id: string,
    field: keyof Omit<Phrase, 'id'>,
    value: string,
  ) => void
  onTimeCommit: (id: string, field: 'start' | 'end', value: number | null) => void
  onSetFromPlayer: (id: string, field: 'start' | 'end') => void
  onRequestDelete: (id: string) => void
  onCancelDelete: () => void
  onConfirmDelete: (id: string) => void
  onCandidateAdd: (phraseId: string) => void
  onCandidateChange: (phraseId: string, candId: string, patch: Partial<Candidate>) => void
  onCandidateScoreChange: (
    phraseId: string,
    candId: string,
    dim: keyof CandidateScores,
    value: number | null,
  ) => void
  onCandidateDelete: (phraseId: string, candId: string) => void
  onUseCandidate: (phraseId: string, candId: string) => void
  onGenerateAi: (phraseId: string) => void
  generatingAi: boolean
}) {
  const duration =
    phrase.start !== null && phrase.end !== null && phrase.end > phrase.start
      ? Math.round((phrase.end - phrase.start) * 10) / 10
      : null

  const candidateHandlers: CandidateSectionHandlers = {
    onAdd: () => onCandidateAdd(phrase.id),
    onChange: (candId, patch) => onCandidateChange(phrase.id, candId, patch),
    onScoreChange: (candId, dim, value) =>
      onCandidateScoreChange(phrase.id, candId, dim, value),
    onDelete: (candId) => onCandidateDelete(phrase.id, candId),
    onUse: (candId) => onUseCandidate(phrase.id, candId),
    onGenerateAi: () => onGenerateAi(phrase.id),
  }
  return (
    <section className="phrase-card" aria-label={`Frasa ${index + 1}`}>
      <header className="phrase-header">
        <span className="phrase-index">Frasa {index + 1}</span>
        {confirmDelete ? (
          <span className="phrase-confirm">
            Hapus frasa ini?
            <button
              type="button"
              className="danger"
              onClick={() => onConfirmDelete(phrase.id)}
            >
              Hapus
            </button>
            <button type="button" onClick={onCancelDelete}>
              Batal
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="danger link"
            onClick={() => onRequestDelete(phrase.id)}
          >
            Hapus
          </button>
        )}
      </header>

      {FIELD_LABELS.map(({ field, label, placeholder }) => (
        <div key={field} className="phrase-field">
          <label htmlFor={`${field}-${phrase.id}`}>{label}</label>
          <textarea
            id={`${field}-${phrase.id}`}
            value={phrase[field]}
            rows={2}
            placeholder={placeholder}
            onChange={(event) => onChange(phrase.id, field, event.target.value)}
          />
        </div>
      ))}

      <div className="phrase-timing">
        <TimeField
          key={`start-${phrase.id}-${phrase.start ?? 'none'}`}
          id={`start-${phrase.id}`}
          label="Mulai (m:ss.d)"
          value={phrase.start}
          onCommit={(value) => onTimeCommit(phrase.id, 'start', value)}
        />
        <button
          type="button"
          disabled={!playerReady}
          title="Ambil posisi pemutar saat ini sebagai waktu mulai"
          onClick={() => onSetFromPlayer(phrase.id, 'start')}
        >
          Set mulai
        </button>
        <TimeField
          key={`end-${phrase.id}-${phrase.end ?? 'none'}`}
          id={`end-${phrase.id}`}
          label="Akhir (m:ss.d)"
          value={phrase.end}
          onCommit={(value) => onTimeCommit(phrase.id, 'end', value)}
        />
        <button
          type="button"
          disabled={!playerReady}
          title="Ambil posisi pemutar saat ini sebagai waktu akhir"
          onClick={() => onSetFromPlayer(phrase.id, 'end')}
        >
          Set akhir
        </button>
      </div>

      <div className="phrase-field">
        <label htmlFor={`notes-${phrase.id}`}>
          Catatan (jeda / nada panjang / bagian sulit)
        </label>
        <textarea
          id={`notes-${phrase.id}`}
          value={phrase.notes}
          rows={2}
          placeholder="Mis. vokal panjang di suku kata pertama"
          onChange={(event) => onChange(phrase.id, 'notes', event.target.value)}
        />
      </div>

      <CandidateSection
        phrase={phrase}
        duration={duration}
        generating={generatingAi}
        handlers={candidateHandlers}
      />
    </section>
  )
}
