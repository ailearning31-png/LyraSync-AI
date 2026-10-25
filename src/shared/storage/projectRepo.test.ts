import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import type { Project } from '../types'
import { isPhraseRecord, isProjectRecord } from '../validation'
import {
  deleteProject,
  getProject,
  listProjects,
  saveProject,
} from './projectRepo'

function makeProject(overrides: Partial<Project> = {}): Project {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: 'Proyek Uji',
    createdAt: now,
    updatedAt: now,
    phrases: [],
    ...overrides,
  }
}

describe('projectRepo (IndexedDB via fake-indexeddb)', () => {
  it('menyimpan, membaca ulang, dan mencantumkan proyek', async () => {
    const project = makeProject({
      phrases: [
        {
          id: 'p1',
          source: 'テスト',
          romanized: 'tesuto',
          indonesian: 'uji coba',
        },
      ],
    })

    await saveProject(project)

    const loaded = await getProject(project.id)
    expect(loaded).not.toBeNull()
    expect(loaded?.title).toBe('Proyek Uji')
    expect(loaded?.phrases).toHaveLength(1)
    expect(loaded?.phrases[0]).toEqual({
      id: 'p1',
      source: 'テスト',
      romanized: 'tesuto',
      indonesian: 'uji coba',
    })

    const all = await listProjects()
    expect(all.some((p) => p.id === project.id)).toBe(true)
  })

  it('memperbarui proyek yang sudah ada dan mengurutkan berdasarkan updatedAt', async () => {
    const older = makeProject({ title: 'Lama' })
    const newer = makeProject({ title: 'Baru' })
    await saveProject({ ...older, updatedAt: 1000 })
    await saveProject({ ...newer, updatedAt: 2000 })

    const edited = { ...older, title: 'Lama (diedit)' }
    const saved = await saveProject(edited)
    expect(saved.title).toBe('Lama (diedit)')
    expect(saved.updatedAt).toBeGreaterThan(1000)

    const all = await listProjects()
    const titles = all.map((p) => p.title)
    expect(titles.indexOf('Lama (diedit)')).toBeGreaterThan(-1)
    expect(all[0].updatedAt).toBeGreaterThanOrEqual(
      all[all.length - 1].updatedAt,
    )
  })

  it('menghapus proyek', async () => {
    const project = makeProject()
    await saveProject(project)
    expect(await getProject(project.id)).not.toBeNull()

    await deleteProject(project.id)
    expect(await getProject(project.id)).toBeNull()
  })

  it('menolak menyimpan proyek tanpa judul', async () => {
    const project = makeProject({ title: '   ' })
    await expect(saveProject(project)).rejects.toThrow(/Judul/)
  })

  it('menolak menyimpan record dengan bentuk tidak valid', async () => {
    const bad = { id: 'x', title: 123 } as unknown as Project
    await expect(saveProject(bad)).rejects.toThrow(/tidak valid/)
  })

  it('melewatkan record rusak saat membaca daftar, tanpa menggagalkan proyek sehat', async () => {
    const healthy = makeProject({ title: 'Sehat' })
    await saveProject(healthy)

    // Tulis record rusak langsung lewat IDB, memodelkan data korup/versi lama.
    // Catatan: record tetap harus punya key 'id' (keyPath store) agar bisa ditulis.
    const { openDatabase, PROJECT_STORE, putRecord } = await import('./db')
    const db = await openDatabase()
    try {
      await putRecord(db, PROJECT_STORE, { id: 'korup', phrases: 'bukan-array' })
      await putRecord(db, PROJECT_STORE, { id: 123, title: { salah: true } })
    } finally {
      db.close()
    }

    const all = await listProjects()
    expect(all.some((p) => p.id === healthy.id)).toBe(true)
    expect(all.some((p) => p.id === 'korup')).toBe(false)
  })

  it('mengembalikan null untuk proyek yang tidak ada atau korup', async () => {
    expect(await getProject('tidak-ada')).toBeNull()

    const { openDatabase, PROJECT_STORE, putRecord } = await import('./db')
    const db = await openDatabase()
    try {
      await putRecord(db, PROJECT_STORE, { id: 'korup-get', title: 42 })
    } finally {
      db.close()
    }
    expect(await getProject('korup-get')).toBeNull()
  })
})

describe('validasi record', () => {
  it('isPhraseRecord menolak bentuk yang salah', () => {
    expect(isPhraseRecord({ id: 'a', source: '', romanized: '', indonesian: '' })).toBe(true)
    expect(isPhraseRecord({ id: 'a', source: 1, romanized: '', indonesian: '' })).toBe(false)
    expect(isPhraseRecord(null)).toBe(false)
    expect(isPhraseRecord('teks')).toBe(false)
  })

  it('isProjectRecord menolak phrases bukan array', () => {
    const bad = { id: 'a', title: 't', createdAt: 1, updatedAt: 2, phrases: null }
    expect(isProjectRecord(bad)).toBe(false)
    expect(isProjectRecord(makeProject())).toBe(true)
  })
})
