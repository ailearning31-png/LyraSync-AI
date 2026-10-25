import { useState } from 'react'
import { ErrorBanner } from './components/ErrorBanner'
import { TABS, type TabId } from './tabs'

function getExtensionVersion(): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      return chrome.runtime.getManifest().version
    }
  } catch {
    // Di luar ekstensi (mode dev browser biasa), tampilkan label dev
  }
  return 'dev'
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('projects')
  const [version] = useState(getExtensionVersion)

  const active = TABS.find((t) => t.id === activeTab)

  return (
    <div className="app">
      <header className="app-header">
        <h1>LyraSync AI</h1>
        <p className="tagline">Fit the Lyrics. Feel the Melody.</p>
      </header>

      <nav className="tabs" role="tablist" aria-label="Navigasi utama">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === activeTab}
            className={t.id === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content" role="tabpanel">
        <h2>{active?.label}</h2>
        <p>{active?.placeholder}</p>
      </main>

      <ErrorBanner />

      <footer className="app-footer">
        v{version} · Fase 1 — kerangka ekstensi
      </footer>
    </div>
  )
}
