import { describe, expect, it, vi } from 'vitest'
import { generateCandidates, parseAiResponse } from './client'
import { AiError, type PhraseContext } from './types'

const settings = { baseUrl: 'https://ai.example.com/v1/', apiKey: 'secret-key-uji', model: 'model-uji' }
const context: PhraseContext = {
  source: 'テスト',
  romanized: 'tesuto',
  current: '',
  start: null,
  end: null,
  duration: 2,
  sourceSyllables: 3,
  notes: '',
}

const validPayload = {
  candidates: [
    { slot: 'meaning', text: 'uji makna', rationale: 'setia makna' },
    { slot: 'balanced', text: 'uji seimbang', rationale: 'seimbang' },
    { slot: 'singability', text: 'uji nyanyi', rationale: 'mudah dinyanyikan' },
  ],
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('generateCandidates', () => {
  it('mengirim request OpenAI-compatible dan memetakan tiga kandidat', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ choices: [{ message: { content: JSON.stringify(validPayload) } }] }),
    )
    const result = await generateCandidates({ settings, context, fetchFn })

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ slot: 'meaning', text: 'uji makna', rationale: 'setia makna' })

    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://ai.example.com/v1/chat/completions') // trailing slash dibersihkan
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret-key-uji')
    const body = JSON.parse(String(init.body))
    expect(body.model).toBe('model-uji')
    expect(body.messages).toHaveLength(2)
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('menerima keluaran berpaginasi code fence', async () => {
    const fenced = '```json\n' + JSON.stringify(validPayload) + '\n```'
    const fetchFn = async () =>
      jsonResponse({ choices: [{ message: { content: fenced } }] })
    const result = await generateCandidates({ settings, context, fetchFn })
    expect(result).toHaveLength(3)
  })

  it('menolak konfigurasi tidak lengkap (tanpa baseUrl/model) tanpa memanggil jaringan', async () => {
    const fetchFn = vi.fn()
    await expect(
      generateCandidates({ settings: { baseUrl: '', apiKey: '', model: '' }, context, fetchFn }),
    ).rejects.toThrow(/belum dikonfigurasi/)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('mode lokal: kunci kosong sah: request terkirim TANPA header Authorization', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ choices: [{ message: { content: JSON.stringify(validPayload) } }] }),
    )
    const localSettings = {
      baseUrl: 'http://localhost:11434/v1',
      apiKey: '',
      model: 'llama3.1:8b',
    }
    const result = await generateCandidates({ settings: localSettings, context, fetchFn })

    expect(result).toHaveLength(3)
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('http://localhost:11434/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
    expect(JSON.parse(String(init.body)).model).toBe('llama3.1:8b')
  })

  it('pesan error untuk 401/429/5xx dan jaringan tidak pernah membocorkan kunci', async () => {
    const cases: [Response | Error, RegExp][] = [
      [jsonResponse({}, 401), /401|kunci/i],
      [jsonResponse({}, 429), /429|batas/i],
      [jsonResponse({}, 503), /503|bermasalah/i],
      [new TypeError('Failed to fetch'), /jaringan/i],
    ]
    for (const [stub, pattern] of cases) {
      const fetchFn = async () => {
        if (stub instanceof Error) throw stub
        return stub
      }
      const error = await generateCandidates({ settings, context, fetchFn }).catch(
        (e: unknown) => e,
      )
      expect(error).toBeInstanceOf(AiError)
      expect((error as Error).message).toMatch(pattern)
      expect((error as Error).message).not.toContain('secret-key-uji')
    }
  })

  it('timeout menghasilkan pesan waktu tunggu, bukan error mentah', async () => {
    const fetchFn = (_input: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      })
    await expect(
      generateCandidates({ settings, context, fetchFn, timeoutMs: 50 }),
    ).rejects.toThrow(/Waktu tunggu habis/)
  })

  it('keluaran tidak valid ditolak dengan pesan jelas', async () => {
    const badPayloads = [
      { choices: [{ message: { content: 'bukan json {{' } }] },
      { choices: [{ message: { content: JSON.stringify({ candidates: [] }) } }] },
      { choices: [{ message: { content: JSON.stringify({ candidates: [{ slot: 'aneh', text: 'x' }] }) } }] },
      { choices: [{}] },
    ]
    for (const payload of badPayloads) {
      const fetchFn = async () => jsonResponse(payload)
      await expect(generateCandidates({ settings, context, fetchFn })).rejects.toBeInstanceOf(AiError)
    }
  })
})

describe('parseAiResponse', () => {
  it('membuang code fence dan memvalidasi bentuk', () => {
    expect(parseAiResponse('```json\n' + JSON.stringify(validPayload) + '\n```')).toHaveLength(3)
    expect(() => parseAiResponse('{"candidates": []}')).toThrow(/tidak mengembalikan kandidat/)
    expect(() => parseAiResponse('{"candidates": [{"slot": "meaning"}]}')).toThrow(/tidak sesuai/)
  })
})
