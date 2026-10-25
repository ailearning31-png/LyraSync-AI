import { useCallback, useEffect, useRef, useState } from 'react'
import { saveProject } from '../../shared/storage/projectRepo'
import type { Project } from '../../shared/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// Autosave dengan debounce 400ms. Saat komponen bongkar (pindah tab) atau
// halaman disembunyikan (panel ditutup), perubahan yang belum tersimpan
// langsung di-flush agar pekerjaan pengguna tidak hilang.
export function useAutoSave(
  project: Project | null,
  enabled: boolean,
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const latest = useRef(project)
  const skipFirstRun = useRef(true)
  const dirty = useRef(false)

  // Cermin nilai terbaru untuk dibaca dari timer/event handler di luar render
  useEffect(() => {
    latest.current = project
  }, [project])

  const save = useCallback(async () => {
    const target = latest.current
    if (!target) return
    setStatus('saving')
    try {
      await saveProject(target)
      dirty.current = false
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!enabled || !project) return
    if (skipFirstRun.current) {
      skipFirstRun.current = false
      return
    }
    dirty.current = true
    const timer = setTimeout(() => {
      void save()
    }, 400)
    return () => clearTimeout(timer)
  }, [project, enabled, save])

  useEffect(() => {
    if (!enabled) return
    const flush = () => {
      if (dirty.current) void save()
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [enabled, save])

  return status
}
