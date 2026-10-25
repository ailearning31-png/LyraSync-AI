export interface Phrase {
  id: string
  source: string
  romanized: string
  indonesian: string
}

export interface Project {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  phrases: Phrase[]
}
