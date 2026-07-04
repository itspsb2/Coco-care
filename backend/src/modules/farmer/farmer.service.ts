import type { Farm } from '../../types/index.js'
import * as userRepo from '../../repositories/user.repository.js'
import { toPublicUser } from '../../repositories/user.repository.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import { notFound } from '../../utils/errors.js'

export async function getProfile(userId: string) {
  const user = await userRepo.findById(userId)
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
