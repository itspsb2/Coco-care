import * as userRepo from '../../repositories/user.repository.js'
import { toPublicUser } from '../../repositories/user.repository.js'
import * as reportRepo from '../../repositories/report.repository.js'

export async function getUsers() {
  const users = await userRepo.listAllUsers()
  return users.map(toPublicUser)
}

export async function getStats() {
  const [totalUsers, pendingReports, verifiedOutbreaks] = await Promise.all([
    userRepo.countUsers(),
    reportRepo.countPendingReports(),
    reportRepo.countVerifiedReports(),
  ])
  return { totalUsers, pendingReports, verifiedOutbreaks }
}
