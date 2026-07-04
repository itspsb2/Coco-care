import type { UserRole } from '../../types/index.js'
import * as userRepo from '../../repositories/user.repository.js'
import { toPublicUser } from '../../repositories/user.repository.js'
import * as reportRepo from '../../repositories/report.repository.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import * as knowledgeRepo from '../../repositories/knowledge.repository.js'
import * as notificationRepo from '../../repositories/notification.repository.js'
import * as reportsService from '../reports/reports.service.js'
import { hashPassword } from '../../utils/password.js'
import { badRequest, notFound, forbidden } from '../../utils/errors.js'
import { getPool } from '../../db/pool.js'
import { isBertReady } from '../../services/bertNlp.service.js'
import { isGroqConfigured } from '../../services/groq.service.js'

export async function getUsers(filters?: { role?: string; q?: string }) {
  const role =
    filters?.role === 'farmer' || filters?.role === 'officer' || filters?.role === 'admin'
      ? (filters.role as UserRole)
      : undefined
  const users = await userRepo.listAllUsers({ role, q: filters?.q })
  return users.map(toPublicUser)
}

export async function createUser(input: {
  username: string
  password: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  officerId?: string
  assignedRegion?: string
}) {
  const existing = await userRepo.findByUsername(input.username)
  if (existing) throw badRequest('Username already exists')

  const passwordHash = await hashPassword(input.password)
  const user = await userRepo.createUser({
    username: input.username,
    passwordHash,
    name: input.name,
    email: input.email || undefined,
    phone: input.phone,
    role: input.role,
    officerId: input.officerId,
    assignedRegion: input.assignedRegion,
  })
  return toPublicUser(user)
}

export async function updateUser(
  id: string,
  input: {
    name?: string
    email?: string | null
    phone?: string | null
    role?: UserRole
    officerId?: string | null
    assignedRegion?: string | null
  },
) {
  const email = input.email === '' ? null : input.email
  const user = await userRepo.updateUser(id, { ...input, email })
  if (!user) throw notFound('User not found')
  return toPublicUser(user)
}

export async function resetPassword(id: string, password: string) {
  const existing = await userRepo.findById(id)
  if (!existing) throw notFound('User not found')
  const passwordHash = await hashPassword(password)
  await userRepo.setPassword(id, passwordHash)
  return { ok: true }
}

export async function setUserActive(id: string, isActive: boolean, actorId: string) {
  if (id === actorId && !isActive) {
    throw forbidden('You cannot deactivate your own account')
  }
  const user = await userRepo.setActive(id, isActive)
  if (!user) throw notFound('User not found')
  return toPublicUser(user)
}

export async function removeUser(id: string, actorId: string) {
  if (id === actorId) throw forbidden('You cannot delete your own account')
  const existing = await userRepo.findById(id)
  if (!existing) throw notFound('User not found')
  await userRepo.deleteUser(id)
  return { ok: true }
}

export async function getStats() {
  const [totalUsers, pendingReports, verifiedOutbreaks] = await Promise.all([
    userRepo.countUsers(),
    reportRepo.countPendingReports(),
    reportRepo.countVerifiedReports(),
  ])
  return { totalUsers, pendingReports, verifiedOutbreaks }
}

export async function getReports(filters: {
  status?: string
  region?: string
  disease?: string
}) {
  const status =
    filters.status === 'pending' ||
    filters.status === 'verified' ||
    filters.status === 'rejected'
      ? filters.status
      : undefined
  return reportRepo.findReportsFiltered({
    status,
    region: filters.region,
    disease: filters.disease,
  })
}

export async function reviewReport(
  id: string,
  adminId: string,
  action: 'verify' | 'reject',
  comment?: string,
) {
  return reportsService.reviewReport(id, adminId, action, comment)
}

export async function getFarms() {
  return farmRepo.listAllFarmsWithOwner()
}

export async function getFarmReports(farmId: string) {
  const farm = await farmRepo.findFarmById(farmId)
  if (!farm) throw notFound('Farm not found')
  return reportRepo.findReportsByFarmId(farmId)
}

export async function getRegionSummary() {
  return farmRepo.getRegionSummary()
}

export async function getHealth() {
  let database = false
  try {
    await getPool().query('SELECT 1')
    database = true
  } catch {
    database = false
  }

  const [knowledgeDocuments, knowledgeChunks] = await Promise.all([
    knowledgeRepo.countDocuments().catch(() => 0),
    knowledgeRepo.countChunks().catch(() => 0),
  ])

  return {
    database,
    bert: isBertReady(),
    groq: isGroqConfigured(),
    knowledgeDocuments,
    knowledgeChunks,
  }
}

export async function createBroadcast(
  adminId: string,
  input: { title: string; message: string; audience: 'all' | 'farmers' | 'officers' },
) {
  return notificationRepo.createNotification({
    title: input.title,
    message: input.message,
    audience: input.audience,
    createdBy: adminId,
  })
}

export async function listBroadcasts() {
  return notificationRepo.listAllNotifications()
}
