import { getPool, closePool } from './pool.js'
import { hashPassword } from '../utils/password.js'
import * as userRepo from '../repositories/user.repository.js'
import * as farmRepo from '../repositories/farm.repository.js'
import * as knowledgeRepo from '../repositories/knowledge.repository.js'
import * as reportRepo from '../repositories/report.repository.js'
import { ingestFromDirectory } from '../services/ragIngest.service.js'

const DEFAULT_PASSWORD = 'password'

async function seedDemoReports(farmerId: string, farmId: string, officerId: string) {
  const verifiedCount = await reportRepo.countVerifiedReports()
  if (verifiedCount > 0) return

  const demos = [
    {
      finalResult: 'Bud Rot Disease',
      imageResult: 'Bud Rot Disease',
      symptomResult: 'Bud Rot Disease',
      confidence: 0.88,
      advice: 'Remove infected crown tissue and apply Bordeaux mixture. Improve crown drainage.',
    },
    {
      finalResult: 'Weligama Coconut Leaf Wilt Disease',
      imageResult: 'Weligama Coconut Leaf Wilt Disease',
      symptomResult: 'Weligama Coconut Leaf Wilt Disease',
      confidence: 0.91,
      advice: 'Remove affected fronds and destroy away from the plantation.',
    },
    {
      finalResult: 'Stem Bleeding Disease',
      imageResult: 'Stem Bleeding Disease',
      symptomResult: 'Stem Bleeding Disease',
      confidence: 0.85,
      advice: 'Remove affected bark and apply Bordeaux paste. Improve drainage.',
    },
  ]

  for (const demo of demos) {
    const report = await reportRepo.createReport({
      farmId,
      userId: farmerId,
      symptoms: { leafDiscoloration: true, trunkLesions: false },
      imageResult: demo.imageResult,
      symptomResult: demo.symptomResult,
      finalResult: demo.finalResult,
      confidence: demo.confidence,
      advice: demo.advice,
      status: 'verified',
    })

    await getPool().query(
      `UPDATE disease_reports
       SET status = 'verified', reviewed_by = $2, review_comment = $3
       WHERE id = $1`,
      [report.id, officerId, 'Verified during seed for demo heatmap data'],
    )
  }

  console.log(`Seeded ${demos.length} verified disease reports`)
}

async function seedGallePendingReport(farmerId: string, galleFarmId: string) {
  const { rows } = await getPool().query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM disease_reports dr
     JOIN farms f ON f.id = dr.farm_id
     WHERE dr.status = 'pending' AND LOWER(f.location) LIKE '%galle%'`,
  )
  if (Number(rows[0]?.count ?? 0) > 0) return

  await reportRepo.createReport({
    farmId: galleFarmId,
    userId: farmerId,
    symptoms: { damagedLeafSurface: true },
    imageResult: 'Coconut Caterpillar Damage',
    symptomResult: 'Coconut Caterpillar Damage',
    finalResult: 'Coconut Caterpillar Damage',
    confidence: 0.79,
    advice: 'Remove and destroy affected fronds. Monitor for caterpillar activity.',
    status: 'pending',
  })
  console.log('Seeded pending Galle report for officer region filter demo')
}

async function seed() {
  getPool()
  const passwordHash = await hashPassword(DEFAULT_PASSWORD)

  const users = [
    { username: 'akeel', name: 'Akeel Bandara', phone: '0771234567', role: 'farmer' as const },
    {
      username: 'officer1',
      name: 'Officer Silva',
      phone: '0777654321',
      role: 'officer' as const,
      assignedRegion: 'Kurunegala',
    },
    { username: 'admin', name: 'System Admin', phone: null, role: 'admin' as const, email: 'admin@cococare.lk' },
  ]

  let farmerId: string | null = null
  let kurunegalaFarmId: string | null = null
  let galleFarmId: string | null = null
  let officerId: string | null = null

  for (const u of users) {
    let user = await userRepo.findByUsername(u.username)
    if (!user) {
      user = await userRepo.createUser({
        username: u.username,
        passwordHash,
        name: u.name,
        phone: u.phone ?? undefined,
        email: 'email' in u ? u.email : undefined,
        role: u.role,
        assignedRegion: 'assignedRegion' in u ? u.assignedRegion : undefined,
      })
      console.log(`Created user: ${u.username}`)
    } else if (u.role === 'officer' && 'assignedRegion' in u && u.assignedRegion && !user.assigned_region) {
      await userRepo.updateUser(user.id, { assignedRegion: u.assignedRegion })
      user = (await userRepo.findById(user.id))!
      console.log(`Updated officer region: ${u.username} → ${u.assignedRegion}`)
    }

    if (u.role === 'farmer') {
      farmerId = user.id
      const farms = await farmRepo.findFarmsByUserId(user.id)

      const kurunegala = farms.find((f) => f.location.toLowerCase().includes('kurunegala'))
      if (kurunegala) {
        kurunegalaFarmId = kurunegala.id
      } else {
        const farm = await farmRepo.createFarm({
          userId: user.id,
          name: 'Akeel Coconut Estate',
          location: 'Kurunegala',
          latitude: 7.4818,
          longitude: 80.365,
          acreage: 5,
          treeCount: 200,
        })
        kurunegalaFarmId = farm.id
        console.log('Created Kurunegala farm for akeel')
      }

      const galle = farms.find((f) => f.location.toLowerCase().includes('galle'))
      if (galle) {
        galleFarmId = galle.id
      } else {
        const farm = await farmRepo.createFarm({
          userId: user.id,
          name: 'Southern Coconut Grove',
          location: 'Galle',
          latitude: 6.0535,
          longitude: 80.221,
          acreage: 3,
          treeCount: 120,
        })
        galleFarmId = farm.id
        console.log('Created Galle farm for akeel')
      }
    }

    if (u.role === 'officer') {
      officerId = user.id
    }
  }

  const chunkCount = await knowledgeRepo.countChunks()
  if (chunkCount === 0) {
    await ingestFromDirectory(undefined, 'CRI Advisory Circular')
    console.log('Seeded RAG knowledge from data/cri-manuals/cri/')
  }

  if (farmerId && kurunegalaFarmId && officerId) {
    await seedDemoReports(farmerId, kurunegalaFarmId, officerId)
  }

  if (farmerId && galleFarmId) {
    await seedGallePendingReport(farmerId, galleFarmId)
  }

  await closePool()
  console.log(`Seed complete. Default password for all users: "${DEFAULT_PASSWORD}"`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
