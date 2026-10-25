import { AUDIO_STORE, deleteRecord, getRecord, openDatabase, putRecord } from './db'

/** Batas ukuran audio yang boleh disimpan lokal (100 MB). */
export const MAX_AUDIO_BYTES = 100 * 1024 * 1024

export interface AudioRecord {
  projectId: string
  blob: Blob
  name: string
  type: string
}

interface StoredAudio {
  projectId: string
  data: ArrayBuffer
  name: string
  type: string
}

// Audio disimpan sebagai ArrayBuffer (bukan Blob langsung) agar kompatibel
// dengan structured clone di semua implementasi IndexedDB; blob dibangun
// ulang saat dibaca. Tidak ada yang keluar dari perangkat pengguna.
export async function saveAudio(
  projectId: string,
  blob: Blob,
  name: string,
  type: string,
): Promise<void> {
  const data = await blob.arrayBuffer()
  const record: StoredAudio = { projectId, data, name, type }
  const db = await openDatabase()
  try {
    await putRecord(db, AUDIO_STORE, record)
  } finally {
    db.close()
  }
}

export async function getAudio(projectId: string): Promise<AudioRecord | null> {
  const db = await openDatabase()
  try {
    const stored = await getRecord<StoredAudio>(db, AUDIO_STORE, projectId)
    if (
      stored === undefined ||
      !(stored.data instanceof ArrayBuffer) ||
      typeof stored.name !== 'string'
    ) {
      return null
    }
    return {
      projectId,
      blob: new Blob([stored.data], { type: stored.type || 'audio' }),
      name: stored.name,
      type: stored.type,
    }
  } finally {
    db.close()
  }
}

export async function deleteAudio(projectId: string): Promise<void> {
  const db = await openDatabase()
  try {
    await deleteRecord(db, AUDIO_STORE, projectId)
  } finally {
    db.close()
  }
}
