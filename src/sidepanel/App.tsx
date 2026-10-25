import { useState } from 'react'
import { ErrorBanner } from './components/ErrorBanner'
import { ProjectEditor } from './components/ProjectEditor'
import { ProjectList } from './components/ProjectList'
import { SettingsPanel } from './components/SettingsPanel'
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
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [version] = useState(getExtensionVersion)

  const openProject = (id: string) => {
    setActiveProjectId(id)
    setActiveTab('editor')
  }

  const closeProject = () => {
    setActiveProjectId(null)
    setActiveTab('projects')
  }

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
        {activeTab === 'projects' && <ProjectList onOpenProject={openProject} />}

        {activeTab === 'editor' &&
          (activeProjectId !== null ? (
            <ProjectEditor projectId={activeProjectId} onClose={closeProject} />
          ) : (
            <p className="empty-hint">
              Buka salah satu proyek dari tab <strong>Proyek</strong> untuk
              mulai mengedit.
            </p>
          ))}

        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      <ErrorBanner />

      <footer className="app-footer">
        v{version} · beta
      </footer>
    </div>
  )
}
