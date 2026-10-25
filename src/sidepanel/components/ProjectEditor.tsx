import { useCallback, useEffect, useState } from 'react'
import { buildExportText, safeFileName } from '../../shared/exportText'
import {
  MAX_AUDIO_BYTES,
  deleteAudio,
  getAudio,
  saveAudio,
} from '../../shared/storage/audioRepo'
import { getProject, saveProject } from '../../shared/storage/projectRepo'
import type { Phrase, Project } from '../../shared/types'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useAutoSave, type SaveStatus } from '../hooks/useAutoSave'
import { AudioControls } from './AudioControls'
import { Overlay } from './Overlay'
import { PhraseCard } from './PhraseCard'

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Menyimpan…',
  saved: 'Tersimpan',
  error: 'Gagal menyimpan — perubahan masih ada di layar. Coba Simpan atau edit lagi.',
}

export function ProjectEditor({
  projectId,
  onClose,
}: {
  projectId: string
  onClose: () => void
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmDeletePhraseId, setConfirmDeletePhraseId] = useState<
    string | null
  >(null)

  const mutate = useCallback(
    (transform: (current: Project) => Project) => {
      setProject((current) => (current === null ? current : transform(current)))
    },
    [],
  )

  // Durasi yang terbaca dari metadata audio ikut disimpan ke proyek
  // (dipanggil dari event handler elemen audio, bukan dari effect).
  const player = useAudioPlayer((duration) => {
    mutate((current) =>
      Math.abs((current.audioDuration ?? -1) - duration) > 0.05
        ? { ...current, audioDuration: duration }
        : current,
    )
  })
  const { loadBlob } = player

  const saveStatus = useAutoSave(project, project !== null)

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const loaded = await getProject(projectId)
        if (!alive) return
        if (loaded === null) {
          setNotFound(true)
        } else {
          setProject(loaded)
        }
      } catch (error) {
        if (alive) {
          setLoadError(
            `Gagal memuat proyek: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [projectId])

  // Muat audio yang tersimpan lokal untuk proyek ini (jika ada).
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const record = await getAudio(projectId)
        if (!cancelled && record !== null) {
          loadBlob(record.blob, record.name)
        }
      } catch {
        // Gagal memuat audio tidak boleh menggagalkan editor; tombol impor tetap tersedia.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [projectId, loadBlob])

  const handleTitleChange = (title: string) =>
    mutate((current) => ({ ...current, title }))

  const handlePhraseChange = (
    phraseId: string,
    field: keyof Omit<Phrase, 'id'>,
    value: string,
  ) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId ? { ...phrase, [field]: value } : phrase,
      ),
    }))

  const handleTimeCommit = (
    phraseId: string,
    field: 'start' | 'end',
    value: number | null,
  ) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId && phrase[field] !== value
          ? { ...phrase, [field]: value }
          : phrase,
      ),
    }))

  const handleSetFromPlayer = (phraseId: string, field: 'start' | 'end') =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId
          ? { ...phrase, [field]: Math.round(player.currentTime * 1000) / 1000 }
          : phrase,
      ),
    }))

  const handleAddPhrase = () =>
    mutate((current) => ({
      ...current,
      phrases: [
        ...current.phrases,
        {
          id: crypto.randomUUID(),
          source: '',
          romanized: '',
          indonesian: '',
          start: null,
          end: null,
          notes: '',
        },
      ],
    }))

  const handleDeletePhrase = (phraseId: string) => {
    setConfirmDeletePhraseId(null)
    mutate((current) => ({
      ...current,
      phrases: current.phrases.filter((phrase) => phrase.id !== phraseId),
    }))
  }

  const handleImportFile = async (file: File) => {
    if (file.size > MAX_AUDIO_BYTES) {
      setActionError(
        `File audio terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas penyimpanan lokal: 100 MB.`,
      )
      return
    }
    setActionError(null)
    try {
      await saveAudio(projectId, file, file.name, file.type)
      player.loadBlob(file, file.name)
      mutate((current) => ({ ...current, audioName: file.name }))
      setNotice('Audio tersimpan secara lokal (tidak diunggah ke mana pun)')
    } catch (error) {
      setActionError(
        `Gagal menyimpan audio — penyimpanan mungkin penuh atau file terlalu besar: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  const handleRemoveAudio = async () => {
    setActionError(null)
    try {
      await deleteAudio(projectId)
      player.reset()
      mutate((current) => ({
        ...current,
        audioName: null,
        audioDuration: null,
      }))
      setNotice('Audio dihapus dari penyimpanan lokal')
    } catch (error) {
      setActionError(
        `Gagal menghapus audio: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  const handleCopy = async () => {
    if (project === null) return
    try {
      await navigator.clipboard.writeText(buildExportText(project))
      setNotice('Lirik tersalin ke clipboard')
    } catch {
      setActionError(
        'Clipboard tidak tersedia di lingkungan ini. Gunakan Unduh JSON sebagai gantinya.',
      )
    }
  }

  const handleDownload = () => {
    if (project === null) return
    try {
      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = safeFileName(project.title)
      anchor.click()
      URL.revokeObjectURL(url)
      setNotice('File JSON diunduh')
    } catch (error) {
      setActionError(
        `Gagal mengunduh: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  const handleManualSave = async () => {
    if (project === null) return
    try {
      setProject(await saveProject(project))
      setNotice('Proyek disimpan')
    } catch (error) {
      setActionError(
        `Gagal menyimpan: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  if (notFound) {
    return (
      <>
        <h2>Editor</h2>
        <p className="empty-hint">
          Proyek tidak ditemukan (mungkin sudah dihapus).{' '}
          <button type="button" onClick={onClose}>
            Kembali ke daftar proyek
          </button>
        </p>
      </>
    )
  }

  if (loadError !== null) {
    return (
      <>
        <h2>Editor</h2>
        <div className="error-banner" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={onClose}>
            Kembali
          </button>
        </div>
      </>
    )
  }

  if (project === null) {
    return (
      <>
        <h2>Editor</h2>
        <p className="empty-hint">Memuat…</p>
      </>
    )
  }

  return (
    <>
      <div className="editor-toolbar">
        <button type="button" onClick={onClose}>
          ← Daftar proyek
        </button>
        <span className={`save-status save-${saveStatus}`}>
          {STATUS_TEXT[saveStatus]}
        </span>
      </div>

      <h2>Editor</h2>

      {notice !== null && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>
            Tutup
          </button>
        </div>
      )}
      {actionError !== null && (
        <div className="error-banner" role="alert">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)}>
            Tutup
          </button>
        </div>
      )}

      <AudioControls
        player={player}
        hasStoredAudio={project.audioName !== null}
        onImportFile={(file) => void handleImportFile(file)}
        onRemoveAudio={() => void handleRemoveAudio()}
      />

      <Overlay
        phrases={project.phrases}
        currentTime={player.currentTime}
        canSeek={player.name !== null}
        onSeek={player.seek}
      />

      <div className="field">
        <label htmlFor="project-title">Judul proyek</label>
        <input
          id="project-title"
          type="text"
          value={project.title}
          onChange={(event) => handleTitleChange(event.target.value)}
        />
      </div>

      <div className="editor-actions">
        <button type="button" onClick={() => void handleCopy()}>
          Salin lirik
        </button>
        <button type="button" onClick={handleDownload}>
          Unduh JSON
        </button>
        <button type="button" onClick={() => void handleManualSave()}>
          Simpan sekarang
        </button>
      </div>

      {project.phrases.length === 0 && (
        <p className="empty-hint">
          Belum ada frasa. Tambahkan frasa pertama untuk mulai menulis.
        </p>
      )}

      {project.phrases.map((phrase, index) => (
        <PhraseCard
          key={phrase.id}
          index={index}
          phrase={phrase}
          playerReady={player.name !== null}
          confirmDelete={confirmDeletePhraseId === phrase.id}
          onChange={handlePhraseChange}
          onTimeCommit={handleTimeCommit}
          onSetFromPlayer={handleSetFromPlayer}
          onRequestDelete={setConfirmDeletePhraseId}
          onCancelDelete={() => setConfirmDeletePhraseId(null)}
          onConfirmDelete={handleDeletePhrase}
        />
      ))}

      <button type="button" className="add-phrase" onClick={handleAddPhrase}>
        + Tambah frasa
      </button>
    </>
  )
}
