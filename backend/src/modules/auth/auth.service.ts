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
    const user = await userRepo.findByUsername(payload.username)
    const passwordOk = user ? await verifyPassword(payload.password, user.password_hash) : false
    if (!user || !passwordOk) {
      throw unauthorized('Invalid username or password')
    }
    if (user.is_active === false) {
      throw unauthorized('This account has been deactivated')
    }
    return {
      token: signToken(user.id),
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
  const existing = await userRepo.findByUsername(payload.username)
  if (existing) {
    throw badRequest('Username already exists')
  }

  const passwordHash = await hashPassword(payload.password)
  const client = await getPool().connect()

  try {
    await client.query('BEGIN')
    const { rows } = await client.query<userRepo.DbUser>(
      `INSERT INTO users (username, password_hash, name, email, phone, role, officer_id, assigned_region)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, password_hash, name, email, phone, role,
                 officer_id, assigned_region, is_active, created_at, updated_at`,
      [
        payload.username,
        passwordHash,
        payload.name ?? payload.username,
        payload.email ?? null,
        payload.phone,
        payload.role,
        payload.officerId ?? null,
        payload.assignedRegion ?? null,
      ],
    )
    const user = rows[0]

    if (payload.farms?.length) {
      for (const farm of payload.farms) {
        await client.query(
          `INSERT INTO farms (user_id, name, location, latitude, longitude, acreage, tree_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            user.id,
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
    return {
      token: signToken(user.id),
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
  const user = await userRepo.findById(userId)
  if (!user) throw unauthorized()
  return toPublicUser(user)
}
