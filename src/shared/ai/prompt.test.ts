import { describe, expect, it } from 'vitest'
import type { AiSlot, PhraseContext } from './types'
import { buildMessages } from './prompt'

describe('buildMessages', () => {
  const base: PhraseContext = {
    source: 'テスト',
    romanized: 'tesuto',
    current: '',
    start: 0.5,
    end: 2,
    duration: 1.5,
    sourceSyllables: 3,
    notes: 'vokal panjang di akhir',
  }

  it('memuat system prompt dengan aturan dan format JSON', () => {
    const [system] = buildMessages(base)
    expect(system.role).toBe('system')
    expect(system.content).toContain('bahasa Indonesia')
    expect(system.content).toContain('"slot":"meaning"')
  })

  it('memuat teks sumber, durasi, estimasi suku kata, dan catatan', () => {
    const [, user] = buildMessages(base)
    expect(user.role).toBe('user')
    expect(user.content).toContain('テスト')
    expect(user.content).toContain('tesuto')
    expect(user.content).toContain('1.5 detik')
    expect(user.content).toContain('3 (heuristik')
    expect(user.content).toContain('vokal panjang di akhir')
  })

  it('mengabaikan bagian yang kosong', () => {
    const [, user] = buildMessages({ ...base, romanized: '', current: '', notes: '', duration: null, sourceSyllables: null })
    expect(user.content).not.toContain('Romanisasi/pelafalan')
    expect(user.content).not.toContain('Durasi frasa')
    expect(user.content).not.toContain('Estimasi suku kata')
    expect(user.content).not.toContain('Catatan pengguna')
  })

  it('slot yang valid tercantum lengkap', () => {
    const [system] = buildMessages(base)
    for (const slot of ['meaning', 'balanced', 'singability'] as AiSlot[]) {
      expect(system.content).toContain(`"${slot}"`)
    }
  })
})
