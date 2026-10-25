import { describe, expect, it } from 'vitest'
import manifest from '../../public/manifest.json'

describe('manifest MV3', () => {
  it('memiliki struktur minimum Manifest V3 yang valid', () => {
    expect(manifest.manifest_version).toBe(3)
    expect(manifest.name).toBe('LyraSync AI')
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(manifest.side_panel?.default_path).toBe('sidepanel.html')
    expect(manifest.background?.service_worker).toBe('background.js')
    expect(manifest.background?.type).toBe('module')
    expect(manifest.permissions).toContain('sidePanel')
    expect(manifest.permissions).toContain('storage')
    expect(manifest.action?.default_title).toBeTruthy()
  })

  it('hanya meminta izin yang benar-benar diperlukan', () => {
    const allowed = new Set(['sidePanel', 'storage'])
    expect(manifest.permissions.every((p) => allowed.has(p))).toBe(true)
  })

  it('tidak berisi kredensial atau nilai rahasia', () => {
    const text = JSON.stringify(manifest).toLowerCase()
    expect(text).not.toMatch(/api[_-]?key|token|secret|password/)
  })
})
