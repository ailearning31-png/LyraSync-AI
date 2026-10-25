import { describe, expect, it } from 'vitest'
import { buildExperimentMarkdown, experimentFileName } from './experimentExport'
import type { Candidate, Project } from './types'

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 'c1',
    text: 'bukan cinta biasa',
    syllablesOverride: null,
    scores: { meaning: 3, naturalness: 4, rhythm: 4, stress: 3, singability: 4 },
    notes: '',
    generatedBy: null,
    ...overrides,
  }
}

function makeProject(overrides: Partial<Project> = {}): Project {
  const now = Date.now()
  return {
    id: 'id-1',
    title: 'Lagu Uji',
    createdAt: now,
    updatedAt: now,
    phrases: [],
    audioName: null,
    audioDuration: null,
    ...overrides,
  }
}

describe('buildExperimentMarkdown', () => {
  it('memuat judul, frasa, kandidat, dan label estimasi', () => {
    const project = makeProject({
      audioName: 'uji.wav',
      audioDuration: 212.2,
      phrases: [
        {
          id: 'p1',
          source: 'テスト',
          romanized: 'tesuto',
          indonesian: 'uji coba',
          start: 0.5,
          end: 2,
          notes: '',
          candidates: [makeCandidate()],
        },
      ],
    })
    const md = buildExperimentMarkdown(project)
    expect(md).toContain('# Eksperimen adaptasi: Lagu Uji')
    expect(md).toContain('uji.wav')
    expect(md).toContain('## Frasa 1 (0.5 – 2.0 dtk)')
    expect(md).toContain('- Sumber: テスト')
    expect(md).toContain('### Kandidat A')
    expect(md).toContain('Skor (1–5): Makna 3 · Alami 4 · Ritme 4 · Stres 3 · Nyanyi 4')
    expect(md).toContain('estimasi/hipotesis')
  })

  it('kandidat tanpa skor ditulis dengan tanda -', () => {
    const project = makeProject({
      phrases: [
        {
          id: 'p1',
          source: '',
          romanized: '',
          indonesian: '',
          start: null,
          end: null,
          notes: '',
          candidates: [makeCandidate({ scores: { meaning: null, naturalness: null, rhythm: null, stress: null, singability: null }, syllablesOverride: 5 })],
        },
      ],
    })
    const md = buildExperimentMarkdown(project)
    expect(md).toContain('Makna - · Alami - · Ritme - · Stres - · Nyanyi -')
    expect(md).toContain('(koreksi manual)')
    expect(md).toContain('Adaptasi terpilih: (kosong)')
  })

  it('kandidat buatan AI tercatat sumbernya (traceable)', () => {
    const project = makeProject({
      phrases: [
        {
          id: 'p1',
          source: '',
          romanized: '',
          indonesian: '',
          start: null,
          end: null,
          notes: '',
          candidates: [makeCandidate({ generatedBy: 'model-uji', notes: '[AI model-uji] setia makna' })],
        },
      ],
    })
    const md = buildExperimentMarkdown(project)
    expect(md).toContain('- Dibuat oleh: model-uji (AI)')
    expect(md).toContain('[AI model-uji] setia makna')
  })

  it('proyek tanpa frasa tetap menghasilkan dokumen valid', () => {
    const md = buildExperimentMarkdown(makeProject())
    expect(md).toContain('# Eksperimen adaptasi: Lagu Uji')
    expect(md).toContain('(belum ada frasa)')
  })
})

describe('experimentFileName', () => {
  it('membersihkan karakter berbahaya dan memakai prefiks eksperimen', () => {
    expect(experimentFileName('Lagu: Baru/1?')).toBe('eksperimen-Lagu_Baru_1.md')
    expect(experimentFileName('   ')).toBe('eksperimen-proyek.md'.replace('proyek', 'eksperimen'))
  })
})
