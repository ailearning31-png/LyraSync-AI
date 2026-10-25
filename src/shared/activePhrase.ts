import type { Phrase } from './types'

// Frasa aktif = frasa dengan start <= waktu < end (end boleh null = terbuka).
// Bila beberapa frasa tumpang tindih, frasa dengan start terbesar yang menang.
export function findActivePhraseId(
  phrases: Phrase[],
  time: number,
): string | null {
  let best: { id: string; start: number } | null = null
  for (const phrase of phrases) {
    if (phrase.start === null) continue
    if (time < phrase.start) continue
    if (phrase.end !== null && time >= phrase.end) continue
    if (best === null || phrase.start >= best.start) {
      best = { id: phrase.id, start: phrase.start }
    }
  }
  return best?.id ?? null
}
