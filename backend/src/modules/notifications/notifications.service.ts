import type { UserRole } from '../../types/index.js'
import * as notificationRepo from '../../repositories/notification.repository.js'

export async function listForUser(userId: string, role: UserRole) {
  return notificationRepo.listForUser(userId, role)
}

export async function markRead(notificationId: string, userId: string) {
  await notificationRepo.markRead(notificationId, userId)
  return { ok: true }
}
