import { describe, expect, it } from 'vitest'
import type { Project } from './types'
import { buildExportText, safeFileName } from './exportText'

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

describe('buildExportText', () => {
  it('membuat seksi hanya untuk bahasa yang punya teks', () => {
    const project = makeProject({
      phrases: [
        {
          id: 'p1',
          source: 'テスト',
          romanized: '',
          indonesian: 'uji coba',
          start: null,
          end: null,
          notes: '',
          candidates: [],
        },
      ],
    })
    const text = buildExportText(project)
    expect(text).toContain('# Lagu Uji')
    expect(text).toContain('## Sumber')
    expect(text).toContain('テスト')
    expect(text).toContain('## Bahasa Indonesia')
    expect(text).toContain('uji coba')
    expect(text).not.toContain('## Romanisasi')
  })

  it('menyimpan urutan frasa pada tiap seksi', () => {
    const project = makeProject({
      phrases: [
        { id: 'a', source: 'satu', romanized: '', indonesian: '', start: null, end: null, notes: '', candidates: [] },
        { id: 'b', source: 'dua', romanized: '', indonesian: '', start: null, end: null, notes: '', candidates: [] },
      ],
    })
    const text = buildExportText(project)
    expect(text.indexOf('satu')).toBeLessThan(text.indexOf('dua'))
  })

  it('proyek kosong menghasilkan penanda belum ada teks', () => {
    expect(buildExportText(makeProject())).toContain('(belum ada teks)')
  })

  it('mendukung karakter Unicode Indonesia dan Jepang', () => {
    const project = makeProject({
      phrases: [{ id: 'a', source: '太陽', romanized: 'taiyō', indonesian: 'mentari terbit', start: null, end: null, notes: '', candidates: [] }],
    })
    const text = buildExportText(project)
    expect(text).toContain('太陽')
    expect(text).toContain('mentari terbit')
  })
})

describe('safeFileName', () => {
  it('membersihkan karakter berbahaya untuk nama file', () => {
    expect(safeFileName('Lagu: Baru/1?')).toBe('Lagu_Baru_1.json')
    expect(safeFileName('///')).toBe('proyek.json')
  })

  it('judul kosong memakai nama default', () => {
    expect(safeFileName('   ')).toBe('proyek.json')
  })
})
