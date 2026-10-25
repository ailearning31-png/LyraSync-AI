import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import {
  deleteAudio,
  getAudio,
  saveAudio,
} from './audioRepo'

describe('audioRepo (IndexedDB via fake-indexeddb)', () => {
  it('menyimpan, membaca ulang, dan menghapus audio sebagai bytes lokal', async () => {
    const bytes = new Uint8Array([1, 2, 3, 250])
    const blob = new Blob([bytes], { type: 'audio/wav' })

    await saveAudio('proj-audio-1', blob, 'uji.wav', 'audio/wav')

    const record = await getAudio('proj-audio-1')
    expect(record).not.toBeNull()
    expect(record?.name).toBe('uji.wav')
    expect(record?.type).toBe('audio/wav')
    const roundtrip = new Uint8Array(await (record?.blob as Blob).arrayBuffer())
    expect(Array.from(roundtrip)).toEqual([1, 2, 3, 250])

    await deleteAudio('proj-audio-1')
    expect(await getAudio('proj-audio-1')).toBeNull()
  })

  it('mengembalikan null untuk audio yang tidak ada', async () => {
    expect(await getAudio('tidak-ada')).toBeNull()
  })
})
