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
