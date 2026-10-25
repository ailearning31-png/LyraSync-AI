import { useState } from 'react'
import { formatTimestamp, parseTimeInput } from '../../shared/timeFormat'

// Input waktu manual m:ss.d. Terkendali lokal: mengetik bebas, saat blur
// nilai diparse (valid → dikomit; tidak valid → kembali ke nilai semula).
// Parent memberi key yang bergantung nilai terkomit, sehingga perubahan dari
// luar (tombol "Set dari pemutar") membuat field menampilkan nilai terbaru.
export function TimeField({
  id,
  label,
  value,
  onCommit,
}: {
  id: string
  label: string
  value: number | null
  onCommit: (value: number | null) => void
}) {
  const [text, setText] = useState(() => formatTimestamp(value))

  const handleBlur = () => {
    const parsed = parseTimeInput(text)
    const resolved = parsed ?? value
    onCommit(resolved)
    setText(formatTimestamp(resolved))
  }

  return (
    <div className="time-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={text}
        placeholder="m:ss.d"
        onChange={(event) => setText(event.target.value)}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'Enter') (event.target as HTMLInputElement).blur()
        }}
      />
    </div>
  )
}
