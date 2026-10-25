import { useCallback, useEffect, useState } from 'react'
import { applyGeneratedCandidates } from '../../shared/ai/apply'
import { generateCandidates } from '../../shared/ai/client'
import { estimateSyllables } from '../../shared/heuristics'
import { loadAiSettings } from '../../shared/ai/settingsStore'
import { AiError } from '../../shared/ai/types'
import { buildExportText, safeFileName } from '../../shared/exportText'
import {
  buildExperimentMarkdown,
  experimentFileName,
} from '../../shared/experimentExport'
import {
  MAX_AUDIO_BYTES,
  deleteAudio,
  getAudio,
  saveAudio,
} from '../../shared/storage/audioRepo'
import { getProject, saveProject } from '../../shared/storage/projectRepo'
import type { Candidate, CandidateScores, Phrase, Project } from '../../shared/types'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { useAutoSave, type SaveStatus } from '../hooks/useAutoSave'
import { AudioAnalysisPanel } from './AudioAnalysisPanel'
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
  const [generatingPhraseId, setGeneratingPhraseId] = useState<string | null>(
    null,
  )
  // Blob audio aktif untuk analisis lokal (tidak pernah dikirim ke mana pun)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioVersion, setAudioVersion] = useState(0)

  const attachAudioBlob = (blob: Blob | null) => {
    setAudioBlob(blob)
    setAudioVersion((version) => version + 1)
  }

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
          attachAudioBlob(record.blob)
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
          candidates: [],
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

  const handleCandidateAdd = (phraseId: string) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId && phrase.candidates.length < 3
          ? {
              ...phrase,
              candidates: [
                ...phrase.candidates,
                {
                  id: crypto.randomUUID(),
                  text: '',
                  syllablesOverride: null,
                  scores: {
                    meaning: null,
                    naturalness: null,
                    rhythm: null,
                    stress: null,
                    singability: null,
                  },
                  notes: '',
                  generatedBy: null,
                },
              ],
            }
          : phrase,
      ),
    }))

  const handleCandidateChange = (
    phraseId: string,
    candId: string,
    patch: Partial<Candidate>,
  ) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId
          ? {
              ...phrase,
              candidates: phrase.candidates.map((candidate) =>
                candidate.id === candId ? { ...candidate, ...patch } : candidate,
              ),
            }
          : phrase,
      ),
    }))

  const handleCandidateScoreChange = (
    phraseId: string,
    candId: string,
    dim: keyof CandidateScores,
    value: number | null,
  ) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId
          ? {
              ...phrase,
              candidates: phrase.candidates.map((candidate) =>
                candidate.id === candId
                  ? { ...candidate, scores: { ...candidate.scores, [dim]: value } }
                  : candidate,
              ),
            }
          : phrase,
      ),
    }))

  const handleCandidateDelete = (phraseId: string, candId: string) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId
          ? {
              ...phrase,
              candidates: phrase.candidates.filter(
                (candidate) => candidate.id !== candId,
              ),
            }
          : phrase,
      ),
    }))

  const handleUseCandidate = (phraseId: string, candId: string) =>
    mutate((current) => ({
      ...current,
      phrases: current.phrases.map((phrase) =>
        phrase.id === phraseId
          ? {
              ...phrase,
              indonesian:
                phrase.candidates.find((candidate) => candidate.id === candId)
                  ?.text ?? phrase.indonesian,
            }
          : phrase,
      ),
    }))

  // Satu percobaan per klik (tanpa retry otomatis). Kegagalan tidak pernah
  // menghapus pekerjaan pengguna — hanya menampilkan pesan.
  const handleGenerateCandidates = async (phraseId: string) => {
    if (project === null || generatingPhraseId !== null) return
    const phrase = project.phrases.find((p) => p.id === phraseId)
    if (phrase === undefined) return
    setActionError(null)
    setNotice(null)
    setGeneratingPhraseId(phraseId)
    try {
      const settings = await loadAiSettings()
      if (settings === null) {
        setActionError(
          'AI belum dikonfigurasi. Buka tab Pengaturan untuk mengisi alamat layanan, kunci API, dan nama model.',
        )
        return
      }
      const duration =
        phrase.start !== null && phrase.end !== null && phrase.end > phrase.start
          ? Math.round((phrase.end - phrase.start) * 10) / 10
          : null
      const sourceSyllables =
        phrase.source.trim() === '' ? null : estimateSyllables(phrase.source).count
      const generated = await generateCandidates({
        settings,
        context: {
          source: phrase.source,
          romanized: phrase.romanized,
          current: phrase.indonesian,
          start: phrase.start,
          end: phrase.end,
          duration,
          sourceSyllables,
          notes: phrase.notes,
        },
      })
      let filledTotal = 0
      mutate((current) => ({
        ...current,
        phrases: current.phrases.map((p) => {
          if (p.id !== phraseId) return p
          const applied = applyGeneratedCandidates(
            p.candidates,
            generated,
            settings.model,
          )
          filledTotal += applied.filled
          return { ...p, candidates: applied.candidates }
        }),
      }))
      if (filledTotal === 0) {
        setNotice(
          'AI menghasilkan kandidat, tetapi semua slot sudah terisi — kosongkan slot yang ingin diganti lalu coba lagi.',
        )
      } else {
        setNotice(
          `${filledTotal} kandidat AI diterima. Periksa, sunting, dan nilai sebelum dipakai — hasil AI bukan jaminan kecocokan melodi.`,
        )
      }
    } catch (error) {
      setActionError(
        error instanceof AiError
          ? error.message
          : `Gagal membuat kandidat: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setGeneratingPhraseId(null)
    }
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
      attachAudioBlob(file)
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
      attachAudioBlob(null)
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

  const handleExperimentDownload = () => {
    if (project === null) return
    try {
      const blob = new Blob([buildExperimentMarkdown(project)], {
        type: 'text/markdown;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = experimentFileName(project.title)
      anchor.click()
      URL.revokeObjectURL(url)
      setNotice('Catatan eksperimen (.md) diunduh')
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

      <AudioAnalysisPanel
        key={`analysis-${audioVersion}`}
        audioBlob={audioBlob}
        onSeek={player.seek}
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
        <button type="button" onClick={handleExperimentDownload}>
          Unduh eksperimen
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
          onCandidateAdd={handleCandidateAdd}
          onCandidateChange={handleCandidateChange}
          onCandidateScoreChange={handleCandidateScoreChange}
          onCandidateDelete={handleCandidateDelete}
          onUseCandidate={handleUseCandidate}
          onGenerateAi={(phraseId) => void handleGenerateCandidates(phraseId)}
          generatingAi={generatingPhraseId === phrase.id}
        />
      ))}

      <button type="button" className="add-phrase" onClick={handleAddPhrase}>
        + Tambah frasa
      </button>
    </>
  )
}
