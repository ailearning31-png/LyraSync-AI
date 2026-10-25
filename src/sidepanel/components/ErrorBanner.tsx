import { useEffect, useState } from 'react'

export function ErrorBanner() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const onError = (event: ErrorEvent) => setMessage(event.message)
    const onRejection = (event: PromiseRejectionEvent) =>
      setMessage(String(event.reason))
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  if (!message) return null
  return (
    <div className="error-banner" role="alert">
      <span>Terjadi kesalahan: {message}</span>
      <button type="button" onClick={() => setMessage(null)}>
        Tutup
      </button>
    </div>
  )
}
