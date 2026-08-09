import type { Farm } from '../../types/index.js'
import * as userRepo from '../../repositories/user.repository.js'
import { toPublicUser } from '../../repositories/user.repository.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import * as authService from '../auth/auth.service.js'
import { conflict, notFound } from '../../utils/errors.js'

export async function getProfile(userId: string) {
  const user = await userRepo.findById(userId, 'farmer')
  if (!user) throw notFound('User not found')
  const farms = await farmRepo.findFarmsByUserId(userId)
  return { user: toPublicUser(user), farms }
}

export async function createFarm(userId: string, farm: Omit<Farm, 'id'>) {
  return farmRepo.createFarm({
    userId,
    name: farm.name,
    location: farm.location,
    latitude: farm.latitude,
    longitude: farm.longitude,
    acreage: farm.acreage,
    treeCount: farm.treeCount,
  })
}

export async function updateProfile(
  userId: string,
  input: { name?: string; email?: string | null; phone?: string | null },
) {
  const email = input.email === '' ? null : input.email
  const user = await userRepo.updateUser(userId, { ...input, email })
  if (!user || user.role !== 'farmer') throw notFound('User not found')
  return toPublicUser(user)
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  return authService.changePassword(userId, input)
}

export async function updateFarm(userId: string, farmId: string, farm: Omit<Farm, 'id'>) {
  const updated = await farmRepo.updateFarmForUser(farmId, userId, {
    name: farm.name,
    location: farm.location,
    latitude: farm.latitude,
    longitude: farm.longitude,
    acreage: farm.acreage,
    treeCount: farm.treeCount,
  })
  if (!updated) throw notFound('Farm not found')
  return updated
}

export async function deleteFarm(userId: string, farmId: string) {
  const farm = await farmRepo.findFarmByIdForUser(farmId, userId)
  if (!farm) throw notFound('Farm not found')

  const linkedRecords = await farmRepo.countLinkedRecordsForFarm(farmId)
  if (linkedRecords > 0) {
    throw conflict('Farm has disease report or alert history and cannot be deleted')
  }

  await farmRepo.deleteFarmForUser(farmId, userId)
  return { ok: true }
}
