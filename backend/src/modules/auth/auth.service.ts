import type { LoginPayload, RegisterPayload, User } from '../../types/index.js'
import * as userRepo from '../../repositories/user.repository.js'
import { toPublicUser } from '../../repositories/user.repository.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import { hashPassword, verifyPassword } from '../../utils/password.js'
import { signToken } from '../../utils/jwt.js'
import { unauthorized, badRequest, serviceUnavailable } from '../../utils/errors.js'
import { getPool } from '../../db/pool.js'

export async function login(payload: LoginPayload) {
  try {
    const user = await userRepo.findByUsernameAnyRole(payload.username)
    const passwordOk = user ? await verifyPassword(payload.password, user.password_hash) : false
    if (!user || !passwordOk) {
      throw unauthorized('Invalid username or password')
    }
    if (user.is_active === false) {
      throw unauthorized('Your account is inactive. Please contact the admin.')
    }
    return {
      token: signToken(user.id, user.role),
      user: toPublicUser(user),
    }
  } catch (err) {
    const e = err as Error & { code?: string; status?: number }
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw serviceUnavailable(
        'Database is not running. Start it with: cd backend && npm run db:up && npm run db:migrate && npm run db:seed',
      )
    }
    throw err
  }
}

export async function register(payload: RegisterPayload) {
  // Usernames must be unique across all three role tables
  const existing = await userRepo.findByUsernameAnyRole(payload.username)
  if (existing) {
    throw badRequest('Username already exists')
  }

  const passwordHash = await hashPassword(payload.password)
  const client = await getPool().connect()

  try {
    await client.query('BEGIN')
    let userId: string
    if (payload.role === 'officer') {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO officers (username, password_hash, name, email, phone, officer_id, assigned_region)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          payload.username,
          passwordHash,
          payload.name ?? payload.username,
          payload.email ?? null,
          payload.phone,
          payload.officerId ?? null,
          payload.assignedRegion ?? null,
        ],
      )
      userId = rows[0].id
    } else {
      const table = payload.role === 'admin' ? 'admins' : 'farmers'
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO ${table} (username, password_hash, name, email, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          payload.username,
          passwordHash,
          payload.name ?? payload.username,
          payload.email ?? null,
          payload.phone,
        ],
      )
      userId = rows[0].id
    }

    if (payload.role === 'farmer' && payload.farms?.length) {
      for (const farm of payload.farms) {
        await client.query(
          `INSERT INTO farms (user_id, name, location, latitude, longitude, acreage, tree_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userId,
            farm.name,
            farm.location,
            farm.latitude,
            farm.longitude,
            farm.acreage,
            farm.treeCount,
          ],
        )
      }
    }

    await client.query('COMMIT')
    const user = await userRepo.findById(userId, payload.role)
    if (!user) throw badRequest('Registration failed')
    return {
      token: signToken(user.id, user.role),
      user: toPublicUser(user),
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function me(userId: string): Promise<User> {
  const user = await userRepo.findByIdAnyRole(userId)
  if (!user) throw unauthorized()
  return toPublicUser(user)
}
