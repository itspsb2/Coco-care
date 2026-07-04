import type { User, UserRole } from '../types/index.js'
import { getPool } from '../db/pool.js'

export interface DbUser {
  id: string
  username: string
  password_hash: string
  name: string
  email: string | null
  phone: string | null
  role: UserRole
  officer_id: string | null
  assigned_region: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

const USER_COLUMNS = `id, username, password_hash, name, email, phone, role,
            officer_id, assigned_region, is_active, created_at, updated_at`

export function toPublicUser(row: DbUser): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: row.role,
    isActive: row.is_active !== false,
    officerId: row.officer_id ?? undefined,
    assignedRegion: row.assigned_region ?? undefined,
  }
}

export interface CreateUserInput {
  username: string
  passwordHash: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  officerId?: string
  assignedRegion?: string
}

export interface UpdateUserInput {
  name?: string
  email?: string | null
  phone?: string | null
  role?: UserRole
  officerId?: string | null
  assignedRegion?: string | null
}

export async function findByUsername(username: string): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `SELECT ${USER_COLUMNS} FROM users WHERE username = $1`,
    [username],
  )
  return rows[0] ?? null
}

export async function findById(id: string): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function createUser(input: CreateUserInput): Promise<DbUser> {
  const { rows } = await getPool().query<DbUser>(
    `INSERT INTO users (username, password_hash, name, email, phone, role, officer_id, assigned_region)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${USER_COLUMNS}`,
    [
      input.username,
      input.passwordHash,
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.role,
      input.officerId ?? null,
      input.assignedRegion ?? null,
    ],
  )
  return rows[0]
}

export async function listAllUsers(filters?: {
  role?: UserRole
  q?: string
}): Promise<DbUser[]> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (filters?.role) {
    params.push(filters.role)
    conditions.push(`role = $${params.length}`)
  }
  if (filters?.q?.trim()) {
    params.push(`%${filters.q.trim().toLowerCase()}%`)
    conditions.push(
      `(LOWER(name) LIKE $${params.length} OR LOWER(username) LIKE $${params.length})`,
    )
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await getPool().query<DbUser>(
    `SELECT ${USER_COLUMNS} FROM users ${where} ORDER BY created_at DESC`,
    params,
  )
  return rows
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<DbUser | null> {
  const existing = await findById(id)
  if (!existing) return null

  const { rows } = await getPool().query<DbUser>(
    `UPDATE users SET
       name = $2,
       email = $3,
       phone = $4,
       role = $5,
       officer_id = $6,
       assigned_region = $7,
       updated_at = NOW()
     WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [
      id,
      input.name ?? existing.name,
      input.email !== undefined ? input.email : existing.email,
      input.phone !== undefined ? input.phone : existing.phone,
      input.role ?? existing.role,
      input.officerId !== undefined ? input.officerId : existing.officer_id,
      input.assignedRegion !== undefined ? input.assignedRegion : existing.assigned_region,
    ],
  )
  return rows[0] ?? null
}

export async function setPassword(id: string, passwordHash: string): Promise<boolean> {
  const result = await getPool().query(
    `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
    [id, passwordHash],
  )
  return (result.rowCount ?? 0) > 0
}

export async function setActive(id: string, isActive: boolean): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [id, isActive],
  )
  return rows[0] ?? null
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM users WHERE id = $1`, [id])
  return (result.rowCount ?? 0) > 0
}

export async function countUsers(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM users',
  )
  return Number(rows[0]?.count ?? 0)
}
