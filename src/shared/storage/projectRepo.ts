import { isProjectRecord } from '../validation'
import type { Project } from '../types'
import {
  PROJECT_STORE,
  deleteRecord,
  getAllRecords,
  getRecord,
  openDatabase,
  putRecord,
} from './db'

// Record lama (sebelum kolom timing/audio ada) diisi defaultnya agar UI
// selalu bekerja dengan bentuk Project yang lengkap.
function normalizeProject(record: Project): Project {
  return {
    ...record,
    audioName: record.audioName ?? null,
    audioDuration: record.audioDuration ?? null,
    phrases: record.phrases.map((phrase) => ({
      ...phrase,
      start: phrase.start ?? null,
      end: phrase.end ?? null,
      notes: phrase.notes ?? '',
      candidates: (phrase.candidates ?? []).map((candidate) => ({
        ...candidate,
        syllablesOverride: candidate.syllablesOverride ?? null,
        notes: candidate.notes ?? '',
        scores: {
          meaning: candidate.scores?.meaning ?? null,
          naturalness: candidate.scores?.naturalness ?? null,
          rhythm: candidate.scores?.rhythm ?? null,
          stress: candidate.scores?.stress ?? null,
          singability: candidate.scores?.singability ?? null,
        },
      })),
    })),
  }
}

export async function listProjects(): Promise<Project[]> {
  const db = await openDatabase()
  try {
    const records = await getAllRecords<unknown>(db, PROJECT_STORE)
    return records
      .filter((record): record is Project => {
        if (isProjectRecord(record)) return true
        // Data rusak dilewati (bukan menggagalkan seluruh daftar) agar
        // pengguna tetap bisa mengakses proyek yang sehat.
        console.warn('Melewatkan record proyek yang tidak valid:', record)
        return false
      })
      .map(normalizeProject)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  } finally {
    db.close()
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const db = await openDatabase()
  try {
    const record = await getRecord<unknown>(db, PROJECT_STORE, id)
    return record !== undefined && isProjectRecord(record)
      ? normalizeProject(record)
      : null
  } finally {
    db.close()
  }
}

export async function saveProject(project: Project): Promise<Project> {
  if (!isProjectRecord(project)) {
    throw new Error('Data proyek tidak valid — tidak disimpan')
  }
  if (project.title.trim() === '') {
    throw new Error('Judul proyek tidak boleh kosong')
  }
  const withTimestamp: Project = { ...project, updatedAt: Date.now() }
  const db = await openDatabase()
  try {
    await putRecord(db, PROJECT_STORE, withTimestamp)
  } finally {
    db.close()
  }
  return withTimestamp
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDatabase()
  try {
    await deleteRecord(db, PROJECT_STORE, id)
  } finally {
    db.close()
  }
}
