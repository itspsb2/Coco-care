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

describe('Officer region filtering', () => {
  const testFn = dbReady ? it : it.skip

  testFn('GET /officer/reports/pending returns only reports in assigned region', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'officer1', password: 'password' })

    expect(login.status).toBe(200)
    const token = login.body.token as string
    expect(login.body.user.assignedRegion).toMatch(/kurunegala/i)

    const res = await request(app)
      .get('/officer/reports/pending')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    for (const report of res.body) {
      expect(String(report.region).toLowerCase()).toContain('kurunegala')
    }
  })

  testFn('POST /officer/reports/:id/review rejects out-of-region report', async () => {
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' })

    const adminToken = adminLogin.body.token as string

    const pending = await request(app)
      .get('/admin/reports')
      .query({ status: 'pending', region: 'Galle' })
      .set('Authorization', `Bearer ${adminToken}`)

    expect(pending.status).toBe(200)
    const galleReport = pending.body.find((r: { region: string }) =>
      String(r.region).toLowerCase().includes('galle'),
    )
    expect(galleReport).toBeDefined()

    const officerLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'officer1', password: 'password' })

    const officerToken = officerLogin.body.token as string

    const review = await request(app)
      .post(`/officer/reports/${galleReport.id}/review`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ action: 'verify', comment: 'Should fail' })

    expect(review.status).toBe(403)
  })

  testFn('officer without assigned region gets empty pending list', async () => {
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' })

    const adminToken = adminLogin.body.token as string
    const suffix = Date.now()

    const created = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: `officer_noreg_${suffix}`,
        password: 'password',
        name: 'Officer No Region',
        role: 'officer',
      })

    expect(created.status).toBe(201)

    const login = await request(app)
      .post('/auth/login')
      .send({ username: `officer_noreg_${suffix}`, password: 'password' })

    const token = login.body.token as string

    const res = await request(app)
      .get('/officer/reports/pending')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  testFn('GET /officer/reports/verified returns confirmed reports from all regions', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'officer1', password: 'password' })

    const token = login.body.token as string

    const res = await request(app)
      .get('/officer/reports/verified')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    for (const report of res.body) {
      expect(report.status).toBe('verified')
    }
    const regions = res.body.map((r: { region: string }) => String(r.region).toLowerCase())
    expect(regions.some((r: string) => r.includes('kurunegala'))).toBe(true)
  })
})
