import type { Phrase, Project } from './types'

// Teks ekspor untuk workflow eksternal (mis. Suno). Frasa tanpa teks pada
// satu bahasa tidak membuat baris kosong pada seksi tersebut.
export function buildExportText(project: Project): string {
  const lines: string[] = [`# ${project.title}`]

  const addSection = (label: string, pick: (phrase: Phrase) => string) => {
    const values = project.phrases
      .map(pick)
      .filter((value) => value.trim().length > 0)
    if (values.length === 0) return
    lines.push('', `## ${label}`)
    lines.push(...values)
  }

  addSection('Sumber', (p) => p.source)
  addSection('Romanisasi', (p) => p.romanized)
  addSection('Bahasa Indonesia', (p) => p.indonesian)

  if (lines.length === 1) lines.push('', '(belum ada teks)')
  return lines.join('\n')
}

export function safeFileName(title: string): string {
  const cleaned = title
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .trim()
  const base = cleaned.length > 0 ? cleaned : 'proyek'
  return `${base.slice(0, 50)}.json`
}
