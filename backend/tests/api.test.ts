import request from 'supertest'
import { createApp } from '../src/app.js'
import { getPool, closePool } from '../src/db/pool.js'

const app = createApp()
let dbReady = false

beforeAll(async () => {
  if (!process.env.DATABASE_URL) return
  try {
    await getPool().query('SELECT 1')
    dbReady = true
  } catch {
    dbReady = false
  }
})

afterAll(async () => {
  if (dbReady) await closePool()
})

describe('API health', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('Auth API', () => {
  const testFn = dbReady ? it : it.skip

  testFn('POST /auth/login with seeded user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.role).toBe('farmer')
  })

  testFn('POST /auth/login rejects bad password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'wrong' })

    expect(res.status).toBe(401)
  })
})

describe('Chat RAG API', () => {
  const testFn = dbReady ? it : it.skip

  testFn('POST /api/chat returns grounded bud rot guidance', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string

    const created = await request(app)
      .post('/api/chat/conversations')
      .set('Authorization', `Bearer ${token}`)

    expect(created.status).toBe(201)
    const conversationId = created.body.id as string

    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ conversationId, message: 'How to treat bud rot disease?' })

    expect(res.status).toBe(200)
    expect(res.body.content).toBeDefined()
    expect(res.body.content.toLowerCase()).not.toContain('could not find verified guidance')
    expect(res.body.content).toMatch(/bud|bordeaux|fung|rot|source:/i)
  })

  testFn('follow-up message uses conversation context', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string

    const created = await request(app)
      .post('/api/chat/conversations')
      .set('Authorization', `Bearer ${token}`)

    const conversationId = created.body.id as string

    await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversationId,
        message: 'my coconut tree leaves are rotting why is it happening',
      })

    const followUp = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ conversationId, message: 'how do I treat it?' })

    expect(followUp.status).toBe(200)
    expect(followUp.body.content).toMatch(/Source:/i)
    expect(followUp.body.content.toLowerCase()).not.toContain('could not find verified guidance')
  })
})
