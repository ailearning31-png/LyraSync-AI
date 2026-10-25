export type TabId = 'projects' | 'editor' | 'experiments' | 'settings'

export interface TabDef {
  id: TabId
  label: string
}

export const TABS: TabDef[] = [
  { id: 'projects', label: 'Proyek' },
  { id: 'editor', label: 'Editor' },
  { id: 'experiments', label: 'Eksperimen' },
  { id: 'settings', label: 'Pengaturan' },
]
