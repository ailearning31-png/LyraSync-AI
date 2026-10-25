import { useCallback, useEffect, useState } from 'react'
import { buildExportText, safeFileName } from '../../shared/exportText'
import { getProject, saveProject } from '../../shared/storage/projectRepo'
import type { Phrase, Project } from '../../shared/types'
import { useAutoSave, type SaveStatus } from '../hooks/useAutoSave'
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

  const mutate = useCallback(
    (transform: (current: Project) => Project) => {
      setProject((current) => (current === null ? current : transform(current)))
    },
    [],
  )

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
          confirmDelete={confirmDeletePhraseId === phrase.id}
          onChange={handlePhraseChange}
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
