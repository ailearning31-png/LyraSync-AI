// Format waktu untuk timestamp frasa dan tampilan pemutar, presisi sepersepuluh detik.
export function formatTimestamp(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return ''
  const tenths = Math.floor(seconds * 10)
  const minutes = Math.floor(tenths / 600)
  const remainder = tenths - minutes * 600
  const secs = Math.floor(remainder / 10)
  const tenthsPart = remainder % 10
  return `${minutes}:${String(secs).padStart(2, '0')}.${tenthsPart}`
}

// Menerima "m:ss.d" (mis. "1:02.5") atau detik polos ("62.5"). Mengembalikan
// null bila tidak bisa diparse: pemanggil UI memutuskan cara memulihkannya.
export function parseTimeInput(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const clock = /^(\d+):([0-5]?\d)(?:[.,](\d{1,3}))?$/.exec(trimmed)
  if (clock !== null) {
    const minutes = Number(clock[1])
    const secs = Number(clock[2])
    const frac = clock[3] !== undefined ? Number(`0.${clock[3]}`) : 0
    const total = minutes * 60 + secs + frac
    return Number.isFinite(total) ? Math.round(total * 1000) / 1000 : null
  }
  const plain = Number(trimmed)
  if (Number.isFinite(plain) && plain >= 0) {
    return Math.round(plain * 1000) / 1000
  }
  return null
}
