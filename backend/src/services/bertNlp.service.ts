import { env } from '../config/env.js'
import { serviceUnavailable } from '../utils/errors.js'

type FeaturePipeline = {
  (text: string, options: { pooling: string; normalize: boolean }): Promise<{ data: Float32Array }>
}

const MAX_CHARS = 2000

let pipeline: FeaturePipeline | null = null
let loadError: Error | null = null
let warmingUp: Promise<void> | null = null

function truncateForModel(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_CHARS) return trimmed
  return trimmed.slice(0, MAX_CHARS)
}

async function loadPipeline(): Promise<FeaturePipeline> {
  if (pipeline) return pipeline
  if (loadError) throw loadError

  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers')
    pipeline = (await createPipeline(
      'feature-extraction',
      env.bertModelName,
    )) as FeaturePipeline
    return pipeline
  } catch (err) {
    loadError = err as Error
    throw loadError
  }
}

export function isBertReady(): boolean {
  return pipeline !== null
}

export async function warmupBert(): Promise<void> {
  if (pipeline) return
  if (warmingUp) return warmingUp

  warmingUp = (async () => {
    console.log(`Loading BERT model: ${env.bertModelName}...`)
    const pipe = await loadPipeline()
    await pipe('coconut farming knowledge warmup', { pooling: 'mean', normalize: true })
    console.log(`BERT ready: ${env.bertModelName}`)
  })()

  try {
    await warmingUp
  } finally {
    warmingUp = null
  }
}

/** Embed text with BERT only. Throws if the model is not available. */
export async function encodeQueryStrict(text: string): Promise<number[]> {
  if (!pipeline && env.bertRequired) {
    try {
      await warmupBert()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'BERT model failed to load'
      throw serviceUnavailable(`Knowledge embeddings unavailable: ${message}`)
    }
  }

  const pipe = pipeline ?? (await loadPipeline().catch((err) => {
    throw serviceUnavailable(
      `Knowledge embeddings unavailable: ${err instanceof Error ? err.message : 'BERT load failed'}`,
    )
  }))

  const output = await pipe(truncateForModel(text), { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

/** @deprecated Prefer encodeQueryStrict for ingest and chat. */
export async function encodeQuery(text: string): Promise<number[]> {
  return encodeQueryStrict(text)
}

export function extractAnswer(
  query: string,
  chunks: Array<{ content: string; sourceTitle?: string; score: number }>,
): string {
  if (chunks.length === 0) {
    return 'I could not find verified guidance. Please contact your agriculture officer.'
  }

  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  const picked = new Set<string>()
  const parts: string[] = []

  // Prefer higher-scoring chunks (already BERT-ranked); use English term overlap within each chunk.
  for (const chunk of chunks.slice(0, 3)) {
    const sentences = chunk.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20)
    const ranked = sentences
      .map((sentence) => {
        const lower = sentence.toLowerCase()
        const score = queryWords.filter((w) => lower.includes(w)).length
        return { sentence: sentence.trim(), score }
      })
      .sort((a, b) => b.score - a.score)

    const take = ranked.some((r) => r.score > 0)
      ? ranked.filter((r) => r.score > 0).slice(0, 2)
      : ranked.slice(0, 1)

    for (const { sentence } of take) {
      if (!picked.has(sentence)) {
        picked.add(sentence)
        parts.push(sentence)
      }
    }
  }

  if (parts.length === 0) {
    parts.push(chunks[0].content.slice(0, 400).trim())
  }

  let body = parts.join(' ')
  if (body.length > 500) {
    body = body.slice(0, 497).trimEnd() + '...'
  }

  const source = chunks[0].sourceTitle ? `\n\nSource: ${chunks[0].sourceTitle}` : ''
  return `${body}${source}`
}
