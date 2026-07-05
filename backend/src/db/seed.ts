import { getPool, closePool } from './pool.js'
import { hashPassword } from '../utils/password.js'
import * as userRepo from '../repositories/user.repository.js'
import * as farmRepo from '../repositories/farm.repository.js'
import * as knowledgeRepo from '../repositories/knowledge.repository.js'
import * as reportRepo from '../repositories/report.repository.js'
import { ingestFromDirectory } from '../services/ragIngest.service.js'
import { createAlertsForVerifiedReport } from '../modules/diseaseMap/diseaseMap.service.js'

const DEFAULT_PASSWORD = 'password'

type DemoReport = {
  finalResult: string
  imageResult: string
  symptomResult: string
  confidence: number
  advice: string
}

async function verifyReport(reportId: string, officerId: string) {
  await getPool().query(
    `UPDATE disease_reports
     SET status = 'verified', reviewed_by = $2, review_comment = $3
     WHERE id = $1`,
    [reportId, officerId, 'Verified during seed for demo heatmap data'],
  )
  await createAlertsForVerifiedReport(reportId)
}

async function seedVerifiedReport(
  farmerId: string,
  farmId: string,
  officerId: string,
  demo: DemoReport,
) {
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
  await verifyReport(report.id, officerId)
  return report.id
}

async function seedMultiRegionHeatmapData(officerId: string) {
  const { rows } = await getPool().query<{ count: string }>(
    `SELECT COUNT(DISTINCT f.location)::text AS count
     FROM disease_reports dr
     JOIN farms f ON f.id = dr.farm_id
     WHERE dr.status = 'verified'`,
  )
  if (Number(rows[0]?.count ?? 0) >= 3) return

  const passwordHash = await hashPassword(DEFAULT_PASSWORD)

  const ensureFarmer = async (
    username: string,
    name: string,
    phone: string,
    farm: {
      name: string
      location: string
      latitude: number
      longitude: number
      acreage: number
      treeCount: number
    },
  ) => {
    let user = await userRepo.findByUsername(username)
    if (!user) {
      user = await userRepo.createUser({
        username,
        passwordHash,
        name,
        phone,
        role: 'farmer',
      })
      console.log(`Created farmer: ${username}`)
    }

    const farms = await farmRepo.findFarmsByUserId(user.id)
    const existing = farms.find((f) => f.location.toLowerCase() === farm.location.toLowerCase())
    if (existing) return { farmerId: user.id, farmId: existing.id }

    const created = await farmRepo.createFarm({
      userId: user.id,
      name: farm.name,
      location: farm.location,
      latitude: farm.latitude,
      longitude: farm.longitude,
      acreage: farm.acreage,
      treeCount: farm.treeCount,
    })
    console.log(`Created ${farm.location} farm for ${username}`)
    return { farmerId: user.id, farmId: created.id }
  }

  const akeel = await ensureFarmer('akeel', 'Akeel Bandara', '0771234567', {
    name: 'Akeel Coconut Estate',
    location: 'Kurunegala',
    latitude: 7.4818,
    longitude: 80.365,
    acreage: 5,
    treeCount: 200,
  })

  const sunil = await ensureFarmer('sunil', 'Sunil Perera', '0772345678', {
    name: 'North Western Grove',
    location: 'Kurunegala',
    latitude: 7.552,
    longitude: 80.448,
    acreage: 4,
    treeCount: 150,
  })

  const piumi = await ensureFarmer('piumi', 'Piumi Fernando', '0773456789', {
    name: 'Southern Coconut Farm',
    location: 'Galle',
    latitude: 6.0535,
    longitude: 80.221,
    acreage: 3,
    treeCount: 120,
  })

  const kamal = await ensureFarmer('kamal', 'Kamal Jayawardena', '0774567890', {
    name: 'Central Highlands Estate',
    location: 'Matale',
    latitude: 7.4675,
    longitude: 80.6234,
    acreage: 6,
    treeCount: 180,
  })

  const demos: Array<{ target: { farmerId: string; farmId: string }; demo: DemoReport }> = [
    {
      target: akeel,
      demo: {
        finalResult: 'Bud Rot Disease',
        imageResult: 'Bud Rot Disease',
        symptomResult: 'Bud Rot Disease',
        confidence: 0.88,
        advice: 'Remove infected crown tissue and apply Bordeaux mixture. Improve crown drainage.',
      },
    },
    {
      target: sunil,
      demo: {
        finalResult: 'Weligama Coconut Leaf Wilt Disease',
        imageResult: 'Weligama Coconut Leaf Wilt Disease',
        symptomResult: 'Weligama Coconut Leaf Wilt Disease',
        confidence: 0.91,
        advice: 'Remove affected fronds and destroy away from the plantation.',
      },
    },
    {
      target: piumi,
      demo: {
        finalResult: 'Stem Bleeding Disease',
        imageResult: 'Stem Bleeding Disease',
        symptomResult: 'Stem Bleeding Disease',
        confidence: 0.85,
        advice: 'Remove affected bark and apply Bordeaux paste. Improve drainage.',
      },
    },
    {
      target: kamal,
      demo: {
        finalResult: 'Coconut Caterpillar Damage',
        imageResult: 'Coconut Caterpillar Damage',
        symptomResult: 'Coconut Caterpillar Damage',
        confidence: 0.76,
        advice: 'Remove and destroy affected fronds. Monitor for caterpillar activity.',
      },
    },
  ]

  let seeded = 0
  for (const { target, demo } of demos) {
    const { rows: existing } = await getPool().query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM disease_reports dr
       WHERE dr.farm_id = $1 AND dr.status = 'verified' AND dr.final_result = $2`,
      [target.farmId, demo.finalResult],
    )
    if (Number(existing[0]?.count ?? 0) > 0) continue

    await seedVerifiedReport(target.farmerId, target.farmId, officerId, demo)
    seeded += 1
  }

  if (seeded > 0) {
    console.log(`Seeded ${seeded} multi-region verified disease reports`)
  }
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
      const galle = farms.find((f) => f.location.toLowerCase().includes('galle'))
      if (galle) galleFarmId = galle.id
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

  if (officerId) {
    await seedMultiRegionHeatmapData(officerId)
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
