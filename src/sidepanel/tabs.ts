export type TabId = 'projects' | 'editor' | 'experiments'

export interface TabDef {
  id: TabId
  label: string
  placeholder: string
}

export const TABS: TabDef[] = [
  {
    id: 'projects',
    label: 'Proyek',
    placeholder:
      'Manajemen proyek lagu (buat, buka, simpan) akan hadir di Fase 2 dengan penyimpanan lokal.',
  },
  {
    id: 'editor',
    label: 'Editor',
    placeholder:
      'Editor lirik per frasa dengan timestamp manual akan hadir di Fase 2–3.',
  },
  {
    id: 'experiments',
    label: 'Eksperimen',
    placeholder:
      'Pembanding kandidat dan catatan eksperimen adaptasi akan hadir di Fase 4.',
  },
]
