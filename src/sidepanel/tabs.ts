export type TabId = 'projects' | 'editor' | 'settings'

export interface TabDef {
  id: TabId
  label: string
}

export const TABS: TabDef[] = [
  { id: 'projects', label: 'Proyek' },
  { id: 'editor', label: 'Editor' },
  { id: 'settings', label: 'Pengaturan' },
]
