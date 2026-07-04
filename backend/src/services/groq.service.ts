import { env } from '../config/env.js'
import { serviceUnavailable } from '../utils/errors.js'

const MAX_CONTEXT_CHARS = 8_000
const MIN_CHUNKS = 3
const MAX_CHUNK_CHARS = 2_400

const SYSTEM_PROMPT = `You are Coco Care AI, an agricultural assistant for coconut farmers in Sri Lanka.
Answer ONLY from the provided knowledge excerpts. Never invent facts, dosages, or product names.

### ANSWER STYLE (clear and concise)
1. Start with ONE short direct sentence that answers the question.
2. Then add at most 3–5 short bullet points with the essential facts.
3. Quote exact quantities, dosages, distances, and product names from tables — include units (kg, g, ml, cm, ft).
4. No filler, no introductions, no phrases like "Based on the text", "According to the CRI", or "As an AI".
5. Never output placeholder or meta text (e.g. "Direct Answer", "CHUNK_START", "see details below").
6. Always answer in English.

### FERTILIZER QUESTIONS
- When the question asks for amounts, copy the exact row from the matching table for the age and manure type mentioned.
- If age or manure type is missing, either ask ONE short clarification question OR answer using the cow-dung package and explicitly state that assumption. Never mix rows from different manure tables.

### SAFETY
For pesticides, toxic chemicals, trunk injection, or disease control: include a one-line safety warning and advise contacting the regional Coconut Development Officer (CDO).

### WHEN CONTEXT IS INSUFFICIENT
Reply exactly: "The knowledge base does not include this information."

Do not append a line starting with "Source:" — the application adds that separately.`

export interface GroqChunkInput {
  content: string
  sourceTitle?: string
  score: number
  documentId?: string
  category?: string
  slug?: string
}

function truncateChunk(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content
  const window = content.slice(0, maxChars)
  const breakAt = Math.max(window.lastIndexOf('. '), window.lastIndexOf('\n'))
  const cut = breakAt > maxChars * 0.5 ? breakAt + 1 : maxChars
  return `${content.slice(0, cut).trim()}…`
}

export function buildGroundedUserPrompt(input: {
  question: string
  conversationSnippet?: string
  chunks: GroqChunkInput[]
}): string {
  const parts: string[] = []
  parts.push(`Current question:\n${input.question.trim()}`)

  if (input.conversationSnippet?.trim()) {
    parts.push(`\nRecent conversation:\n${input.conversationSnippet.trim()}`)
  }

  parts.push('\nKnowledge excerpts (use only these):')

  // Always include at least MIN_CHUNKS (truncate each if needed)
  const selected = input.chunks.slice(0, Math.max(MIN_CHUNKS, input.chunks.length))
  let used = 0
  let included = 0

  for (let i = 0; i < selected.length; i++) {
    const chunk = selected[i]
    const perChunkBudget =
      included < MIN_CHUNKS
        ? Math.min(MAX_CHUNK_CHARS, Math.floor((MAX_CONTEXT_CHARS - used) / (MIN_CHUNKS - included)))
        : MAX_CONTEXT_CHARS - used

    if (perChunkBudget < 80 && included >= MIN_CHUNKS) break

    const body = truncateChunk(chunk.content.trim(), Math.max(80, perChunkBudget - 40))
    const block = `[${i + 1}] Title: ${chunk.sourceTitle ?? 'Unknown'}\n${body}`
    if (used + block.length > MAX_CONTEXT_CHARS && included >= MIN_CHUNKS) break
    parts.push(block)
    used += block.length
    included++
  }

  return parts.join('\n\n')
}

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

export async function generateGroundedAnswer(input: {
  question: string
  conversationSnippet?: string
  chunks: GroqChunkInput[]
}): Promise<string> {
  if (!env.groqApiKey) {
    throw serviceUnavailable('Groq API key is not configured')
  }
  if (!input.chunks.length) {
    throw serviceUnavailable('No knowledge chunks provided for Groq')
  }

  const userContent = buildGroundedUserPrompt(input)

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.groqModel,
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
  })

  const data = (await res.json()) as GroqChatResponse

  if (!res.ok) {
    const msg = data.error?.message ?? `Groq HTTP ${res.status}`
    throw serviceUnavailable(`Groq generation failed: ${msg}`)
  }

  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw serviceUnavailable('Groq returned an empty answer')
  }

  // Strip a trailing Source: line if the model adds one (app appends its own)
  return text.replace(/\n\nSource:\s*.+$/i, '').trim()
}

export function isGroqConfigured(): boolean {
  return Boolean(env.groqApiKey && env.groqEnabled)
}
