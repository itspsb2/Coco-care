import { env } from '../config/env.js'
import { serviceUnavailable } from '../utils/errors.js'

const MAX_CHARS = 2000
const INGEST_DELAY_MS = 150

let lastIngestEmbedAt = 0

function truncateForEmbed(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_CHARS) return trimmed
  return trimmed.slice(0, MAX_CHARS)
}

function modelResource(): string {
  const name = env.geminiEmbeddingModel
  return name.startsWith('models/') ? name : `models/${name}`
}

export function isGeminiEmbeddingReady(): boolean {
  return env.geminiEmbeddingEnabled && env.geminiApiKey.length > 0
}

async function throttleIngest(): Promise<void> {
  const elapsed = Date.now() - lastIngestEmbedAt
  if (lastIngestEmbedAt > 0 && elapsed < INGEST_DELAY_MS) {
    await new Promise((resolve) => setTimeout(resolve, INGEST_DELAY_MS - elapsed))
  }
}

export async function embedText(
  text: string,
  options?: { ingest?: boolean },
): Promise<number[]> {
  if (!isGeminiEmbeddingReady()) {
    throw serviceUnavailable('Knowledge embeddings unavailable: GEMINI_API_KEY not configured')
  }

  if (options?.ingest) {
    await throttleIngest()
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/${modelResource()}:embedContent?key=${encodeURIComponent(env.geminiApiKey)}`

  const body: Record<string, unknown> = {
    model: modelResource(),
    content: { parts: [{ text: truncateForEmbed(text) }] },
  }

  if (env.geminiEmbeddingDimensions > 0) {
    body.outputDimensionality = env.geminiEmbeddingDimensions
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw serviceUnavailable(
      `Knowledge embeddings unavailable: ${err instanceof Error ? err.message : 'network error'}`,
    )
  }

  if (options?.ingest) {
    lastIngestEmbedAt = Date.now()
  }

  if (res.status === 429) {
    throw serviceUnavailable('Knowledge embeddings rate limited. Try again later.')
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw serviceUnavailable(
      `Knowledge embeddings failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    )
  }

  const data = (await res.json()) as { embedding?: { values?: number[] } }
  const values = data.embedding?.values
  if (!values?.length) {
    throw serviceUnavailable('Knowledge embeddings returned empty vector')
  }

  return values
}

export async function warmupGeminiEmbedding(): Promise<void> {
  if (!env.geminiEmbeddingEnabled) return
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required when GEMINI_EMBEDDING_ENABLED=true')
  }
  console.log(`Warming up Gemini embeddings: ${env.geminiEmbeddingModel}...`)
  await embedText('coconut farming knowledge warmup')
  console.log(`Gemini embeddings ready: ${env.geminiEmbeddingModel}`)
}
