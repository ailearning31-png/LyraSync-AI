export interface Phrase {
  id: string
  source: string
  romanized: string
  indonesian: string
  /** Waktu mulai frasa dalam detik; null = belum diatur (manual saja). */
  start: number | null
  /** Waktu akhir frasa dalam detik; null = belum diatur. */
  end: number | null
  /** Catatan bebas pengguna: jeda, nada panjang, bagian sulit. */
  notes: string
  /** Maksimal 3 kandidat adaptasi (slot A/B/C); indonesian = teks yang diterima. */
  candidates: Candidate[]
}

/** Skor manual 1–5 per dimensi; null = belum dinilai. */
export interface CandidateScores {
  meaning: number | null
  naturalness: number | null
  rhythm: number | null
  stress: number | null
  singability: number | null
}

export interface Candidate {
  id: string
  text: string
  /** Koreksi manual jumlah suku kata; null = pakai estimasi otomatis. */
  syllablesOverride: number | null
  scores: CandidateScores
  notes: string
}

export interface Project {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  phrases: Phrase[]
  /** Nama file audio referensi; blob audio disimpan terpisah di store 'audio'. */
  audioName: string | null
  /** Durasi audio dalam detik (dibaca dari metadata saat diputar). */
  audioDuration: number | null
}
