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

describe('Disease map API', () => {
  const testFn = dbReady ? it : it.skip

  testFn('GET /api/disease-map/heatmap returns visible outbreak points', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string

    const res = await request(app)
      .get('/api/disease-map/heatmap')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    if (res.body.length > 0) {
      expect(res.body[0]).toMatchObject({
        lat: expect.any(Number),
        lng: expect.any(Number),
        weight: expect.any(Number),
        diseaseType: expect.any(String),
        verificationStatus: expect.stringMatching(/^(verified|ai_suspected)$/),
      })
    }
  })

  testFn('GET /api/disease-map/stats returns summary shape', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'officer1', password: 'officer123' })

    const token = login.body.token as string

    const res = await request(app)
      .get('/api/disease-map/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      byDisease: expect.any(Array),
      byWeek: expect.any(Array),
      highRiskCount: expect.any(Number),
    })
  })

  testFn('GET /api/disease-map/heatmap filters by district', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string

    const allRes = await request(app)
      .get('/api/disease-map/heatmap')
      .set('Authorization', `Bearer ${token}`)

    const filteredRes = await request(app)
      .get('/api/disease-map/heatmap')
      .query({ district: 'Kurunegala' })
      .set('Authorization', `Bearer ${token}`)

    expect(filteredRes.status).toBe(200)
    expect(Array.isArray(filteredRes.body)).toBe(true)
    if (allRes.body.length > 0 && filteredRes.body.length > 0) {
      expect(filteredRes.body.length).toBeLessThanOrEqual(allRes.body.length)
      for (const point of filteredRes.body) {
        expect(point).toMatchObject({
          lat: expect.any(Number),
          lng: expect.any(Number),
          diseaseType: expect.any(String),
        })
      }
    }
  })

  testFn('GET /api/disease-map/stats respects district filter', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'officer1', password: 'officer123' })

    const token = login.body.token as string

    const allStats = await request(app)
      .get('/api/disease-map/stats')
      .set('Authorization', `Bearer ${token}`)

    const filteredStats = await request(app)
      .get('/api/disease-map/stats')
      .query({ district: 'Galle' })
      .set('Authorization', `Bearer ${token}`)

    expect(filteredStats.status).toBe(200)
    expect(filteredStats.body).toMatchObject({
      byDisease: expect.any(Array),
      byWeek: expect.any(Array),
      highRiskCount: expect.any(Number),
    })

    const allCount = allStats.body.byDisease.reduce(
      (sum: number, row: { count: number }) => sum + row.count,
      0,
    )
    const filteredCount = filteredStats.body.byDisease.reduce(
      (sum: number, row: { count: number }) => sum + row.count,
      0,
    )
    expect(filteredCount).toBeLessThanOrEqual(allCount)
  })

  testFn('GET /api/disease-map/heatmap filters by date range', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string

    const res = await request(app)
      .get('/api/disease-map/heatmap')
      .query({ from: '2099-01-01T00:00:00.000Z', to: '2099-12-31T23:59:59.999Z' })
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(0)
  })

  testFn('GET /api/disease-map/heatmap applies strict AI-suspected threshold', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string
    const suffix = Date.now()
    const farmer = await getPool().query<{ id: string }>(
      `SELECT id FROM farmers WHERE username = 'akeel' LIMIT 1`,
    )
    const farm = await getPool().query<{ id: string }>(
      `SELECT id FROM farms WHERE user_id = $1 LIMIT 1`,
      [farmer.rows[0].id],
    )

    const insertReport = async (
      disease: string,
      confidence: number,
      status: 'pending' | 'rejected',
    ) => {
      await getPool().query(
        `INSERT INTO disease_reports (
           farm_id, user_id, symptoms, image_result, symptom_result,
           final_result, confidence, advice, status
         ) VALUES ($1, $2, '{}'::jsonb, 'Test', 'Test', $3, $4, 'Test advice', $5)`,
        [farm.rows[0].id, farmer.rows[0].id, disease, confidence, status],
      )
    }

    const highDisease = `AI Threshold High ${suffix}`
    const boundaryDisease = `AI Threshold Boundary ${suffix}`
    const rejectedDisease = `AI Threshold Rejected ${suffix}`
    await insertReport(highDisease, 0.91, 'pending')
    await insertReport(boundaryDisease, 0.9, 'pending')
    await insertReport(rejectedDisease, 0.99, 'rejected')

    const high = await request(app)
      .get('/api/disease-map/heatmap')
      .query({ diseaseType: highDisease })
      .set('Authorization', `Bearer ${token}`)

    expect(high.status).toBe(200)
    expect(high.body).toHaveLength(1)
    expect(high.body[0]).toMatchObject({
      diseaseType: highDisease,
      verificationStatus: 'ai_suspected',
    })

    const boundary = await request(app)
      .get('/api/disease-map/heatmap')
      .query({ diseaseType: boundaryDisease })
      .set('Authorization', `Bearer ${token}`)
    expect(boundary.status).toBe(200)
    expect(boundary.body).toHaveLength(0)

    const rejected = await request(app)
      .get('/api/disease-map/heatmap')
      .query({ diseaseType: rejectedDisease })
      .set('Authorization', `Bearer ${token}`)
    expect(rejected.status).toBe(200)
    expect(rejected.body).toHaveLength(0)
  })

  testFn('GET /api/disease-map/alerts returns farmer alerts list', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })

    const token = login.body.token as string

    const res = await request(app)
      .get('/api/disease-map/alerts')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  testFn('high-confidence pending report creates AI alert and verification upgrades it', async () => {
    const suffix = Date.now()
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' })
    const adminToken = adminLogin.body.token as string

    const farmerRes = await request(app)
      .post('/auth/register')
      .send({
        role: 'farmer',
        username: `farmer_near_${suffix}`,
        password: 'password',
        phone: '0779999999',
        name: 'Nearby Farmer',
        farms: [
          {
            name: 'Nearby Estate',
            location: 'Kurunegala',
            latitude: 7.49,
            longitude: 80.37,
            acreage: 2,
            treeCount: 50,
          },
        ],
      })
    expect(farmerRes.status).toBe(200)
    const nearbyFarmerToken = farmerRes.body.token as string

    const akeelLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'akeel', password: 'password' })
    const akeelToken = akeelLogin.body.token as string

    const profile = await request(app)
      .get('/farmers/profile')
      .set('Authorization', `Bearer ${akeelToken}`)
    const kurunegalaFarm = profile.body.farms.find((f: { location: string }) =>
      String(f.location).toLowerCase().includes('kurunegala'),
    )
    expect(kurunegalaFarm).toBeDefined()

    const diagnosis = await request(app)
      .post('/api/diagnosis')
      .set('Authorization', `Bearer ${akeelToken}`)
      .send({
        farmId: kurunegalaFarm.id,
        category: 'bud',
        symptoms: {
          'Rotting crown region': true,
          'Foul smell': true,
          'Young leaf decay': true,
        },
        notes: 'Test outbreak for alert flow',
      })
    expect(diagnosis.status).toBe(200)
    expect(diagnosis.body.status).toBe('pending')
    const reportId = diagnosis.body.id as string

    const suspectedAlertsRes = await request(app)
      .get('/api/disease-map/alerts')
      .set('Authorization', `Bearer ${nearbyFarmerToken}`)

    expect(suspectedAlertsRes.status).toBe(200)
    const suspected = suspectedAlertsRes.body.filter(
      (a: { reportId: string }) => a.reportId === reportId,
    )
    expect(suspected).toHaveLength(1)
    expect(suspected[0].alertType).toBe('ai_suspected')
    expect(suspected[0].message).toMatch(/not been officer verified yet/i)

    const heatmapBeforeReview = await request(app)
      .get('/api/disease-map/heatmap')
      .set('Authorization', `Bearer ${nearbyFarmerToken}`)

    expect(heatmapBeforeReview.status).toBe(200)
    const suspectedPoint = heatmapBeforeReview.body.find(
      (p: { diseaseType: string; verificationStatus: string }) =>
        p.diseaseType === diagnosis.body.finalResult &&
        p.verificationStatus === 'ai_suspected',
    )
    expect(suspectedPoint).toBeDefined()

    const officerLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'officer1', password: 'officer123' })
    const officerToken = officerLogin.body.token as string

    const review = await request(app)
      .post(`/officer/reports/${reportId}/review`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ action: 'verify', comment: 'Verified for disease map test' })
    expect(review.status).toBe(200)

    const alertsRes = await request(app)
      .get('/api/disease-map/alerts')
      .set('Authorization', `Bearer ${nearbyFarmerToken}`)

    expect(alertsRes.status).toBe(200)
    const matchingAlerts = alertsRes.body.filter(
      (a: { reportId: string }) => a.reportId === reportId,
    )
    expect(matchingAlerts).toHaveLength(1)
    const matching = matchingAlerts[0]
    expect(matching.read).toBe(false)
    expect(matching.alertType).toBe('verified')
    expect(matching.message).toMatch(/^Verified outbreak/i)

    const markRead = await request(app)
      .patch(`/api/disease-map/alerts/${matching.id}/read`)
      .set('Authorization', `Bearer ${nearbyFarmerToken}`)

    expect(markRead.status).toBe(200)
    expect(markRead.body.read).toBe(true)
  })
})
