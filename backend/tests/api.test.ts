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
      .send({ username: 'officer1', password: 'officer123' })

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
    if (res.body.length > 0) {
      expect(res.body[0]).toMatchObject({
        farmer: {
          name: expect.any(String),
          username: expect.any(String),
        },
        farm: {
          name: expect.any(String),
          location: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          acreage: expect.any(Number),
          treeCount: expect.any(Number),
        },
      })
      expect('phone' in res.body[0].farmer).toBe(true)
      expect('email' in res.body[0].farmer).toBe(true)
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
      .send({ username: 'officer1', password: 'officer123' })

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
      .send({ username: 'officer1', password: 'officer123' })

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
    expect(res.body[0]).toMatchObject({
      farmer: {
        name: expect.any(String),
        username: expect.any(String),
      },
      farm: {
        name: expect.any(String),
        location: expect.any(String),
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        acreage: expect.any(Number),
        treeCount: expect.any(Number),
      },
    })
    const regions = res.body.map((r: { region: string }) => String(r.region).toLowerCase())
    expect(regions.some((r: string) => r.includes('kurunegala'))).toBe(true)
  })
})

describe('Farmer profile and farm management', () => {
  async function login(username: string, password: string) {
    const res = await request(app).post('/auth/login').send({ username, password })
    expect(res.status).toBe(200)
    return {
      token: res.body.token as string,
      user: res.body.user as { id: string; username: string },
    }
  }

  async function createFarmer(suffix: string, password = 'password123') {
    const admin = await login('admin', 'password')
    const username = `farmer_${suffix}`
    const created = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        username,
        password,
        name: `Farmer ${suffix}`,
        email: `${username}@example.com`,
        phone: '0771112222',
        role: 'farmer',
      })

    expect(created.status).toBe(201)
    const farmer = await login(username, password)
    return { ...farmer, password }
  }

  async function createFarm(token: string, suffix: string) {
    const res = await request(app)
      .post('/farms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Farm ${suffix}`,
        location: 'Kurunegala',
        latitude: 7.4818,
        longitude: 80.365,
        acreage: 3.5,
        treeCount: 120,
      })

    expect(res.status).toBe(200)
    return res.body as { id: string }
  }

  it('allows a farmer to update basic profile fields only', async () => {
    if (!dbReady) return
    const suffix = `profile_${Date.now()}`
    const farmer = await createFarmer(suffix)

    const update = await request(app)
      .patch('/farmers/profile')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send({
        name: 'Updated Farmer',
        email: 'updated.farmer@example.com',
        phone: '0779998888',
        username: 'ignored_username',
        role: 'admin',
      })

    expect(update.status).toBe(200)
    expect(update.body.name).toBe('Updated Farmer')
    expect(update.body.email).toBe('updated.farmer@example.com')
    expect(update.body.phone).toBe('0779998888')
    expect(update.body.username).toBe(farmer.user.username)
    expect(update.body.role).toBe('farmer')

    const profile = await request(app)
      .get('/farmers/profile')
      .set('Authorization', `Bearer ${farmer.token}`)

    expect(profile.status).toBe(200)
    expect(profile.body.user.name).toBe('Updated Farmer')
  })

  it('changes farmer password only with the correct current password', async () => {
    if (!dbReady) return
    const suffix = `password_${Date.now()}`
    const farmer = await createFarmer(suffix, 'oldpassword')

    const wrong = await request(app)
      .patch('/farmers/password')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword' })

    expect(wrong.status).toBe(400)

    const changed = await request(app)
      .patch('/farmers/password')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send({ currentPassword: 'oldpassword', newPassword: 'newpassword' })

    expect(changed.status).toBe(200)
    expect(changed.body.ok).toBe(true)

    const oldLogin = await request(app)
      .post('/auth/login')
      .send({ username: farmer.user.username, password: 'oldpassword' })
    expect(oldLogin.status).toBe(401)

    const newLogin = await request(app)
      .post('/auth/login')
      .send({ username: farmer.user.username, password: 'newpassword' })
    expect(newLogin.status).toBe(200)
  })

  it('changes password through the shared auth password route', async () => {
    if (!dbReady) return
    const suffix = `auth_password_${Date.now()}`
    const farmer = await createFarmer(suffix, 'oldpassword')

    const changed = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send({ currentPassword: 'oldpassword', newPassword: 'newpassword' })

    expect(changed.status).toBe(200)
    expect(changed.body.ok).toBe(true)

    const newLogin = await request(app)
      .post('/auth/login')
      .send({ username: farmer.user.username, password: 'newpassword' })
    expect(newLogin.status).toBe(200)
  })

  it('allows a farmer to edit only their own farm', async () => {
    if (!dbReady) return
    const suffix = `farm_edit_${Date.now()}`
    const farmer = await createFarmer(`${suffix}_owner`)
    const otherFarmer = await createFarmer(`${suffix}_other`)
    const farm = await createFarm(farmer.token, suffix)

    const updated = await request(app)
      .patch(`/farms/${farm.id}`)
      .set('Authorization', `Bearer ${farmer.token}`)
      .send({
        name: 'Updated Estate',
        location: 'Matale',
        latitude: 7.4675,
        longitude: 80.6234,
        acreage: 6.25,
        treeCount: 210,
      })

    expect(updated.status).toBe(200)
    expect(updated.body.name).toBe('Updated Estate')
    expect(updated.body.location).toBe('Matale')
    expect(updated.body.acreage).toBe(6.25)
    expect(updated.body.treeCount).toBe(210)

    const forbidden = await request(app)
      .patch(`/farms/${farm.id}`)
      .set('Authorization', `Bearer ${otherFarmer.token}`)
      .send({
        name: 'Hijacked Estate',
        location: 'Galle',
        latitude: 6.0535,
        longitude: 80.221,
        acreage: 2,
        treeCount: 50,
      })

    expect(forbidden.status).toBe(404)
  })

  it('deletes a farmer-owned farm with no report or alert history', async () => {
    if (!dbReady) return
    const suffix = `farm_delete_${Date.now()}`
    const farmer = await createFarmer(suffix)
    const farm = await createFarm(farmer.token, suffix)

    const deleted = await request(app)
      .delete(`/farms/${farm.id}`)
      .set('Authorization', `Bearer ${farmer.token}`)

    expect(deleted.status).toBe(200)
    expect(deleted.body.ok).toBe(true)

    const profile = await request(app)
      .get('/farmers/profile')
      .set('Authorization', `Bearer ${farmer.token}`)

    expect(profile.status).toBe(200)
    expect(profile.body.farms.some((f: { id: string }) => f.id === farm.id)).toBe(false)
  })

  it('blocks deleting a farm with report history', async () => {
    if (!dbReady) return
    const suffix = `farm_block_${Date.now()}`
    const farmer = await createFarmer(suffix)
    const farm = await createFarm(farmer.token, suffix)

    await getPool().query(
      `INSERT INTO disease_reports
       (farm_id, user_id, symptoms, image_result, symptom_result, final_result, confidence, advice, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [
        farm.id,
        farmer.user.id,
        JSON.stringify({ leafDiscoloration: true }),
        'Leaf Blight',
        'Leaf Blight',
        'Leaf Blight',
        0.7,
        'Monitor the farm and contact an officer if symptoms spread.',
      ],
    )

    const deleted = await request(app)
      .delete(`/farms/${farm.id}`)
      .set('Authorization', `Bearer ${farmer.token}`)

    expect(deleted.status).toBe(409)
    expect(deleted.body.message).toMatch(/cannot be deleted/i)
  })
})
