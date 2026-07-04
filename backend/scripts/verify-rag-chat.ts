import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { getPool, closePool } from '../src/db/pool.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Shared list also used by the chatbot UI chips (keep in sync with front_end). */
async function loadQuestions(): Promise<string[]> {
  const path = join(__dirname, '..', 'data', 'rag-suggested-questions.json')
  const raw = await readFile(path, 'utf-8')
  return JSON.parse(raw) as string[]
}

const EXTRA_TABLE_QUESTIONS = [
  'MOP amount for adult tree with cow dung?',
  'How much cow dung for a 2-year coconut seedling?',
]

function bodyWithoutSource(content: string): string {
  return content.includes('\n\nSource:')
    ? content.slice(0, content.lastIndexOf('\n\nSource:')).trim()
    : content.trim()
}

async function main() {
  const pool = getPool()
  const docs = await pool.query('SELECT COUNT(*)::int AS c FROM knowledge_documents')
  const chunks = await pool.query('SELECT COUNT(*)::int AS c FROM knowledge_chunks')
  console.log(`DB: ${docs.rows[0].c} documents, ${chunks.rows[0].c} chunks`)

  const questions = [...(await loadQuestions()), ...EXTRA_TABLE_QUESTIONS]

  const app = createApp()
  const login = await request(app)
    .post('/auth/login')
    .send({ username: 'akeel', password: 'password' })

  if (login.status !== 200) {
    throw new Error(`Login failed: ${login.status}`)
  }

  const token = login.body.token as string

  let passed = 0

  for (const q of questions) {
    // Fresh conversation per question so prior turns do not pollute retrieval checks
    const created = await request(app)
      .post('/api/chat/conversations')
      .set('Authorization', `Bearer ${token}`)

    if (created.status !== 201) {
      throw new Error(`Create conversation failed: ${created.status}`)
    }

    const conversationId = created.body.id as string
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ conversationId, message: q })

    const content = (res.body.content as string | undefined) ?? ''
    const lower = content.toLowerCase()
    const body = bodyWithoutSource(content)
    const lastWord = body.split(/\s+/).pop()?.toLowerCase() ?? ''

    const hasPlaceholder =
      lower.includes('chunk_start') ||
      lower.includes('chunk_end') ||
      /\bdirect answer\b/.test(lower) ||
      lower.includes('see details below')

    // Mid-sentence cutoff: ends with a dangling function word
    const looksCutOff = ['the', 'a', 'an', 'to', 'of', 'and', 'or', 'with', 'for'].includes(
      lastWord.replace(/[^a-z]/g, ''),
    )

    const pass =
      res.status === 200 &&
      !lower.includes('could not find verified guidance') &&
      !hasPlaceholder &&
      !looksCutOff &&
      content.includes('Source:') &&
      body.length > 20

    console.log(`${pass ? 'PASS' : 'FAIL'} | ${q}`)
    if (!pass) console.log('  ->', content.slice(0, 220))
    else passed++

    // Brief pause to stay under Groq TPM limits during batch verification
    await new Promise((r) => setTimeout(r, 2500))
  }

  // Context follow-up in a fresh conversation (bud rot)
  const ctxConv = await request(app)
    .post('/api/chat/conversations')
    .set('Authorization', `Bearer ${token}`)

  const ctxId = ctxConv.body.id as string
  await request(app)
    .post('/api/chat')
    .set('Authorization', `Bearer ${token}`)
    .send({
      conversationId: ctxId,
      message: 'my coconut tree spear leaf is withering and smells foul',
    })

  const followUp = await request(app)
    .post('/api/chat')
    .set('Authorization', `Bearer ${token}`)
    .send({ conversationId: ctxId, message: 'how do I treat it?' })

  const ctxOk =
    followUp.status === 200 &&
    followUp.body.content?.includes('Source:') &&
    !followUp.body.content?.toLowerCase().includes('could not find verified guidance')

  console.log(`${ctxOk ? 'PASS' : 'FAIL'} | follow-up with conversation context`)
  if (!ctxOk) console.log('  ->', followUp.body.content?.slice(0, 160))

  await closePool()
  console.log(`\n${passed}/${questions.length} questions grounded; context=${ctxOk}`)
  if (passed !== questions.length || !ctxOk) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
