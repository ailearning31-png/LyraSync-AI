import { buildMessages, AI_SLOTS } from './prompt'
import { AiError, type AiSettings, type GeneratedCandidate, type PhraseContext } from './types'

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>

// 120 detik: server LLM lokal (Ollama di CPU) bisa lambat menghasilkan tiga
// kandidat; batas ketat 30 dtk sering memutus respons yang masih sah.
export const DEFAULT_TIMEOUT_MS = 120_000

function assertSettings(settings: AiSettings): void {
  const baseUrl = settings.baseUrl.trim()
  const model = settings.model.trim()
  // apiKey OPSIONAL: server lokal (mis. Ollama) tidak memerlukan kunci.
  if (baseUrl === '' || model === '' || !/^https?:\/\//i.test(baseUrl)) {
    throw new AiError(
      'AI belum dikonfigurasi dengan lengkap. Buka tab Pengaturan: isi alamat layanan (http/https) dan nama model. Kunci API opsional: kosongkan untuk server lokal seperti Ollama.',
    )
  }
}

function stripCodeFence(content: string): string {
  const trimmed = content.trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed)
  return fenced !== null ? fenced[1] : trimmed
}

/** Parse & validasi keluaran model: output tidak valid ditolak, bukan disimpan. */
export function parseAiResponse(content: string): GeneratedCandidate[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripCodeFence(content))
  } catch {
    throw new AiError('Layanan AI membalas dengan format yang tidak bisa dibaca (bukan JSON).')
  }
  const root = parsed as { candidates?: unknown }
  if (
    typeof root !== 'object' ||
    root === null ||
    !Array.isArray(root.candidates) ||
    root.candidates.length === 0
  ) {
    throw new AiError('Layanan AI tidak mengembalikan kandidat yang valid.')
  }
  const result: GeneratedCandidate[] = []
  for (const item of root.candidates) {
    const candidate = item as { slot?: unknown; text?: unknown; rationale?: unknown }
    if (
      typeof candidate.slot !== 'string' ||
      !AI_SLOTS.includes(candidate.slot as never) ||
      typeof candidate.text !== 'string' ||
      candidate.text.trim() === ''
    ) {
      throw new AiError('Layanan AI mengembalikan kandidat dengan bentuk yang tidak sesuai.')
    }
    result.push({
      slot: candidate.slot as GeneratedCandidate['slot'],
      text: candidate.text.trim(),
      rationale:
        typeof candidate.rationale === 'string' ? candidate.rationale.trim() : '',
    })
  }
  return result
}

/**
 * Satu percobaan per panggilan: TIDAK ada retry otomatis (mencegah permintaan
 * berlebihan); pengguna yang memutuskan menekan ulang. Timeout memakai AbortController.
 * Pesan error tidak pernah menyertakan kunci API.
 */
export async function generateCandidates(options: {
  settings: AiSettings
  context: PhraseContext
  fetchFn?: FetchFn
  timeoutMs?: number
}): Promise<GeneratedCandidate[]> {
  const { settings, context } = options
  const fetchFn = options.fetchFn ?? ((input: string, init?: RequestInit) => fetch(input, init))
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  assertSettings(settings)
  const baseUrl = settings.baseUrl.trim().replace(/\/+$/, '')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let response: Response
    try {
      // Header Authorization hanya dikirim bila kunci diisi: server lokal
      // (Ollama) tidak memerlukannya dan tidak boleh menerima header kosong.
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const apiKey = settings.apiKey.trim()
      if (apiKey !== '') headers.Authorization = `Bearer ${apiKey}`
      response = await fetchFn(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: settings.model.trim(),
          messages: buildMessages(context),
          temperature: 0.7,
        }),
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted) {
        throw new AiError(
          `Waktu tunggu habis (${Math.round(timeoutMs / 1000)} detik): layanan AI tidak merespons.`,
        )
      }
      throw new AiError(
        `Gagal menghubungi layanan AI (jaringan/CORS): ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AiError('Kunci API ditolak oleh layanan (401/403). Periksa kunci di tab Pengaturan.')
      }
      if (response.status === 429) {
        throw new AiError('Batas penggunaan layanan AI tercapai (429). Tunggu sebentar lalu coba lagi.')
      }
      if (response.status >= 500) {
        throw new AiError(`Layanan AI sedang bermasalah (${response.status}). Coba lagi nanti.`)
      }
      throw new AiError(`Layanan AI menolak permintaan (status ${response.status}).`)
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      throw new AiError('Layanan AI membalas tanpa isi teks yang bisa dibaca.')
    }
    return parseAiResponse(content)
  } finally {
    clearTimeout(timer)
  }
}
