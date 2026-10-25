import type { Phrase } from '../../shared/types'

const FIELD_LABELS: { field: keyof Omit<Phrase, 'id'>; label: string; placeholder: string }[] = [
  {
    field: 'source',
    label: 'Sumber',
    placeholder: 'Lirik sumber (mis. Jepang)',
  },
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
  confirmDelete,
  onChange,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  index: number
  phrase: Phrase
  confirmDelete: boolean
  onChange: (id: string, field: keyof Omit<Phrase, 'id'>, value: string) => void
  onRequestDelete: (id: string) => void
  onCancelDelete: () => void
  onConfirmDelete: (id: string) => void
}) {
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
    </section>
  )
}
