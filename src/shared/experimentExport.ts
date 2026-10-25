import type { Project } from './types'

export function experimentFileName(title: string): string {
  const cleaned = title
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .trim()
  const base = cleaned.length > 0 ? cleaned : 'eksperimen'
  return `eksperimen-${base.slice(0, 50)}.md`
}

// Catatan eksperimen dalam format Markdown yang bisa ditempel ke
// EXPERIMENT_LOG.md / worksheet. Semua angka diberi label estimasi/hipotesis;
// ekspor ini TIDAK menggantikan pendengaran langsung.
export function buildExperimentMarkdown(project: Project): string {
  const exportedAt = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const lines: string[] = [
    `# Eksperimen adaptasi — ${project.title}`,
    '',
    `Diekspor: ${exportedAt} · LyraSync AI`,
    `Audio referensi: ${project.audioName ?? '(belum ada)'}${
      project.audioDuration !== null
        ? ` · durasi terukur ${project.audioDuration.toFixed(1)} dtk`
        : ''
    }`,
    '',
    '> Semua angka di bawah adalah estimasi/hipotesis — bukan bukti kecocokan melodi.',
    '',
  ]

  if (project.phrases.length === 0) {
    lines.push('(belum ada frasa)', '')
    return lines.join('\n')
  }

  project.phrases.forEach((phrase, index) => {
    const timing =
      phrase.start !== null || phrase.end !== null
        ? `${phrase.start !== null ? phrase.start.toFixed(1) : '?'} – ${phrase.end !== null ? phrase.end.toFixed(1) : '?'} dtk`
        : 'belum diatur'
    const duration =
      phrase.start !== null && phrase.end !== null && phrase.end > phrase.start
        ? Math.round((phrase.end - phrase.start) * 10) / 10
        : null

    lines.push(`## Frasa ${index + 1} (${timing})`)
    lines.push(`- Sumber: ${phrase.source || '(kosong)'}`)
    lines.push(`- Romanisasi: ${phrase.romanized || '(kosong)'}`)
    lines.push(`- Adaptasi terpilih: ${phrase.indonesian || '(kosong)'}`)
    if (duration !== null) lines.push(`- Durasi frasa: ${duration} dtk`)
    if (phrase.notes.trim() !== '') lines.push(`- Catatan frasa: ${phrase.notes}`)

    if (phrase.candidates.length === 0) {
      lines.push('- Kandidat: (belum ada)')
    }
    phrase.candidates.forEach((candidate, slotIndex) => {
      const slot = ['A', 'B', 'C'][slotIndex] ?? `#${slotIndex + 1}`
      lines.push('')
      lines.push(`### Kandidat ${slot}`)
      lines.push(`- Teks: ${candidate.text || '(kosong)'}`)
      if (candidate.generatedBy !== null) {
        lines.push(`- Dibuat oleh: ${candidate.generatedBy} (AI)`)
      }
      if (candidate.syllablesOverride !== null) {
        lines.push(`- Suku kata: ${candidate.syllablesOverride} (koreksi manual)`)
      }
      lines.push('- Catatan kandidat: ' + (candidate.notes || '(kosong)'))
      const scoreParts = [
        `Makna ${candidate.scores.meaning ?? '—'}`,
        `Alami ${candidate.scores.naturalness ?? '—'}`,
        `Ritme ${candidate.scores.rhythm ?? '—'}`,
        `Stres ${candidate.scores.stress ?? '—'}`,
        `Nyanyi ${candidate.scores.singability ?? '—'}`,
      ]
      lines.push(`- Skor (1–5): ${scoreParts.join(' · ')}`)
    })
    lines.push('')
  })

  lines.push(
    '---',
    '',
    'Hasil audio generasi (Suno dsb.) dicatat terpisah setelah benar-benar dites.',
    '',
  )
  return lines.join('\n')
}
