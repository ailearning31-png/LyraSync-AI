import { useEffect, useState } from 'react'
import {
  deleteProject,
  listProjects,
  saveProject,
} from '../../shared/storage/projectRepo'
import type { Project } from '../../shared/types'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function ProjectList({
  onOpenProject,
}: {
  onOpenProject: (id: string) => void
}) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Pola IIFE dengan guard `cancelled` agar setState hanya dipanggil secara
  // asinkron setelah await (aturan react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const result = await listProjects()
        if (!cancelled) {
          setProjects(result)
          setLoadError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            `Gagal memuat daftar proyek: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = () => {
    setProjects(null)
    setReloadKey((key) => key + 1)
  }

  const handleCreate = async () => {
    const title = newTitle.trim()
    if (title === '' || busy) return
    setBusy(true)
    setActionError(null)
    const now = Date.now()
    try {
      await saveProject({
        id: crypto.randomUUID(),
        title,
        createdAt: now,
        updatedAt: now,
        phrases: [],
        audioName: null,
        audioDuration: null,
      })
      setNewTitle('')
      reload()
    } catch (error) {
      setActionError(
        `Gagal membuat proyek: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setActionError(null)
    try {
      await deleteProject(id)
      setConfirmDeleteId(null)
      reload()
    } catch (error) {
      setActionError(
        `Gagal menghapus proyek: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return (
    <>
      <h2>Proyek</h2>

      <form
        className="create-form"
        onSubmit={(event) => {
          event.preventDefault()
          void handleCreate()
        }}
      >
        <label htmlFor="new-project-title">Judul proyek baru</label>
        <div className="row">
          <input
            id="new-project-title"
            type="text"
            value={newTitle}
            placeholder="Mis. The Sun - cover Indonesia"
            onChange={(event) => setNewTitle(event.target.value)}
          />
          <button type="submit" disabled={newTitle.trim() === '' || busy}>
            Buat proyek
          </button>
        </div>
      </form>

      {loadError !== null && (
        <div className="error-banner" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={reload}>
            Coba lagi
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

      {projects === null && <p className="empty-hint">Memuat…</p>}

      {projects !== null && projects.length === 0 && (
        <p className="empty-hint">
          Belum ada proyek. Buat proyek pertama Anda dengan form di atas.
        </p>
      )}

      <ul className="project-list">
        {projects?.map((project) => (
          <li key={project.id} className="project-item">
            <div className="project-info">
              <span className="project-title">{project.title}</span>
              <span className="project-meta">
                {project.phrases.length} frasa · diubah{' '}
                {formatDate(project.updatedAt)}
              </span>
            </div>
            <div className="project-actions">
              <button type="button" onClick={() => onOpenProject(project.id)}>
                Buka
              </button>
              {confirmDeleteId === project.id ? (
                <>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void handleDelete(project.id)}
                  >
                    Yakin? Hapus
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(null)}>
                    Batal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="danger"
                  onClick={() => setConfirmDeleteId(project.id)}
                >
                  Hapus
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
