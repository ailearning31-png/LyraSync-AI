import type { AiSlot, PhraseContext } from './types'

const SYSTEM_PROMPT = [
  'Kamu membantu pengguna mengadaptasi lirik lagu ke bahasa Indonesia yang nyaman dinyanyikan mengikuti melodi referensi.',
  'Aturan:',
  '1. Pertahankan makna inti; jangan menambah informasi baru atau mengubah pesan.',
  '2. Gunakan bahasa Indonesia yang alami, bukan terjemahan kata per kata.',
  '3. Usahakan jumlah suku kata mendekati target yang diberikan; melisma dan vokal panjang boleh dimanfaatkan.',
  '4. Jaga tekanan kata agar jatuh alami pada melodi.',
  '5. Sediakan tiga pendekatan: "meaning" (utamakan makna), "balanced" (seimbang), "singability" (utamakan kenyamanan dinyanyikan).',
  '6. Balas HANYA JSON valid tanpa penjelasan di luar JSON, dengan bentuk:',
  '{"candidates":[{"slot":"meaning","text":"...","rationale":"..."},{"slot":"balanced","text":"...","rationale":"..."},{"slot":"singability","text":"...","rationale":"..."}]}',
  'Field "rationale" berisi 1 kalimat trade-off kandidat tersebut.',
].join('\n')

export function buildMessages(context: PhraseContext): {
  role: 'system' | 'user'
  content: string
}[] {
  const lines: string[] = []
  lines.push('Teks sumber:')
  lines.push(context.source || '(kosong)')
  if (context.romanized.trim() !== '') {
    lines.push('')
    lines.push(`Romanisasi/pelafalan: ${context.romanized}`)
  }
  if (context.current.trim() !== '') {
    lines.push('')
    lines.push(`Adaptasi Indonesia yang sudah ada (boleh diperbaiki): ${context.current}`)
  }
  if (context.duration !== null) {
    lines.push('')
    lines.push(`Durasi frasa: ${context.duration} detik.`)
  }
  if (context.sourceSyllables !== null) {
    lines.push(
      `Estimasi suku kata/mora sumber: ${context.sourceSyllables} (heuristik; melisma dan vokal panjang sah).`,
    )
  }
  if (context.notes.trim() !== '') {
    lines.push('')
    lines.push(`Catatan pengguna: ${context.notes}`)
  }
  lines.push('')
  lines.push('Buat tiga kandidat adaptasi Indonesia sesuai aturan sistem.')

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: lines.join('\n') },
  ]
}

export const AI_SLOTS: AiSlot[] = ['meaning', 'balanced', 'singability']
