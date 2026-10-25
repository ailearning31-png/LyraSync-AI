import { useEffect, useState } from 'react'
import {
  clearAiSettings,
  loadAiSettings,
  saveAiSettings,
} from '../../shared/ai/settingsStore'

// Konfigurasi layanan AI milik pengguna. Kunci hanya disimpan lokal
// (chrome.storage.local) dan tidak pernah masuk kode sumber atau repo.
export function SettingsPanel() {
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const saved = await loadAiSettings()
        if (!alive) return
        if (saved !== null) {
          setBaseUrl(saved.baseUrl)
          setApiKey(saved.apiKey)
          setModel(saved.model)
        }
      } catch {
        if (alive) setError('Gagal memuat pengaturan tersimpan.')
      } finally {
        if (alive) setLoaded(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const handleSave = async () => {
    setError(null)
    setNotice(null)
    try {
      await saveAiSettings({ baseUrl, apiKey, model })
      setNotice('Pengaturan tersimpan secara lokal di perangkat ini.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleClear = async () => {
    setError(null)
    setNotice(null)
    try {
      await clearAiSettings()
      setBaseUrl('')
      setApiKey('')
      setModel('')
      setNotice('Konfigurasi AI dihapus dari perangkat ini.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <>
      <h2>Pengaturan</h2>

      <div className="settings-privacy">
        <strong>Privasi:</strong> audio <em>tidak pernah</em> dikirim ke mana pun.
        Ketika Anda menekan "Buat kandidat (AI)", <em>teks lirik</em> dan konteks
        frasa dikirim ke layanan yang Anda konfigurasi di bawah ini. Kunci API
        hanya disimpan lokal di perangkat ini dan tidak pernah masuk kode sumber.
      </div>

      {notice !== null && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>
            Tutup
          </button>
        </div>
      )}
      {error !== null && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            Tutup
          </button>
        </div>
      )}

      {!loaded ? (
        <p className="empty-hint">Memuat…</p>
      ) : (
        <>
          <div className="field">
            <label htmlFor="ai-base-url">Alamat layanan (Base URL)</label>
            <input
              id="ai-base-url"
              type="text"
              value={baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={(event) => setBaseUrl(event.target.value)}
            />
            <p className="field-hint">
              Endpoint kompatibel OpenAI (OpenAI, OpenRouter, Groq, dsb.).
              Untuk LLM lokal seperti Ollama, jalankan dengan
              OLLAMA_ORIGINS=chrome-extension://* agar CORS diizinkan.
            </p>
          </div>

          <div className="field">
            <label htmlFor="ai-api-key">Kunci API</label>
            <input
              id="ai-api-key"
              type="password"
              value={apiKey}
              placeholder="kunci API Anda"
              onChange={(event) => setApiKey(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ai-model">Nama model</label>
            <input
              id="ai-model"
              type="text"
              value={model}
              placeholder="mis. gpt-4o-mini"
              onChange={(event) => setModel(event.target.value)}
            />
          </div>

          <div className="editor-actions">
            <button type="button" onClick={() => void handleSave()}>
              Simpan pengaturan
            </button>
            <button type="button" className="danger" onClick={() => void handleClear()}>
              Hapus konfigurasi
            </button>
          </div>
        </>
      )}
    </>
  )
}
