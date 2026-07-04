import 'dotenv/config'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { getPool, closePool } from '../src/db/pool.js'

const questions = [
  'How to treat bud rot disease?',
  'Best fertilizer for coconut trees?',
  'How to increase coconut yield?',
  'How to prevent caterpillar attacks?',
  'What is the ideal watering schedule?',
  'Signs of stem bleeding disease?',
]

async function main() {
  const pool = getPool()
  const docs = await pool.query('SELECT COUNT(*)::int AS c FROM knowledge_documents')
  const chunks = await pool.query('SELECT COUNT(*)::int AS c FROM knowledge_chunks')
  console.log(`DB: ${docs.rows[0].c} documents, ${chunks.rows[0].c} chunks`)

  const app = createApp()
  const login = await request(app)
    .post('/auth/login')
    .send({ username: 'akeel', password: 'password' })

  if (login.status !== 200) {
    throw new Error(`Login failed: ${login.status}`)
  }

  const token = login.body.token as string

  const created = await request(app)
    .post('/api/chat/conversations')
    .set('Authorization', `Bearer ${token}`)

  if (created.status !== 201) {
    throw new Error(`Create conversation failed: ${created.status}`)
  }

  const conversationId = created.body.id as string
  let passed = 0

  for (const q of questions) {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ conversationId, message: q })

    const ok =
      res.status === 200 &&
      !res.body.content?.toLowerCase().includes('could not find verified guidance') &&
      res.body.content?.includes('Source:')

    console.log(`${ok ? 'PASS' : 'FAIL'} | ${q}`)
    if (!ok) console.log('  ->', res.body.content?.slice(0, 120))
    else passed++
  }

  // Context follow-up in a fresh conversation
  const ctxConv = await request(app)
    .post('/api/chat/conversations')
    .set('Authorization', `Bearer ${token}`)

  const ctxId = ctxConv.body.id as string
  await request(app)
    .post('/api/chat')
    .set('Authorization', `Bearer ${token}`)
    .send({
      conversationId: ctxId,
      message: 'my coconut tree leaves are rotting why is it happening',
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
