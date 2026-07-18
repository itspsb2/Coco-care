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

const TABLE_BY_ROLE: Record<UserRole, string> = {
  farmer: 'farmers',
  officer: 'officers',
  admin: 'admins',
}

// Every role table is projected to the same DbUser shape; only officers
// actually store officer_id / assigned_region.
function selectFor(role: UserRole): string {
  const officerCols =
    role === 'officer'
      ? 'officer_id, assigned_region'
      : 'NULL::varchar AS officer_id, NULL::varchar AS assigned_region'
  return `SELECT id, username, password_hash, name, email, phone, '${role}'::text AS role,
          ${officerCols}, is_active, created_at, updated_at
          FROM ${TABLE_BY_ROLE[role]}`
}

const ALL_ROLES: UserRole[] = ['farmer', 'officer', 'admin']

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
  officerId?: string | null
  assignedRegion?: string | null
}

export async function findByUsername(
  username: string,
  role: UserRole,
): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `${selectFor(role)} WHERE username = $1`,
    [username],
  )
  return rows[0] ?? null
}

export async function findByUsernameAnyRole(username: string): Promise<DbUser | null> {
  const union = ALL_ROLES.map(
    (role) => `(${selectFor(role)} WHERE username = $1)`,
  ).join(' UNION ALL ')
  const { rows } = await getPool().query<DbUser>(union, [username])
  return rows[0] ?? null
}

export async function findById(id: string, role: UserRole): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `${selectFor(role)} WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function findByIdAnyRole(id: string): Promise<DbUser | null> {
  const union = ALL_ROLES.map((role) => `(${selectFor(role)} WHERE id = $1)`).join(
    ' UNION ALL ',
  )
  const { rows } = await getPool().query<DbUser>(union, [id])
  return rows[0] ?? null
}

export async function createUser(input: CreateUserInput): Promise<DbUser> {
  if (input.role === 'officer') {
    const { rows } = await getPool().query<{ id: string }>(
      `INSERT INTO officers (username, password_hash, name, email, phone, officer_id, assigned_region)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        input.username,
        input.passwordHash,
        input.name,
        input.email ?? null,
        input.phone ?? null,
        input.officerId ?? null,
        input.assignedRegion ?? null,
      ],
    )
    return (await findById(rows[0].id, 'officer'))!
  }

  const table = TABLE_BY_ROLE[input.role]
  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO ${table} (username, password_hash, name, email, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      input.username,
      input.passwordHash,
      input.name,
      input.email ?? null,
      input.phone ?? null,
    ],
  )
  return (await findById(rows[0].id, input.role))!
}

export async function listAllUsers(filters?: {
  role?: UserRole
  q?: string
}): Promise<DbUser[]> {
  const roles = filters?.role ? [filters.role] : ALL_ROLES
  const params: unknown[] = []
  let qCondition = ''

  if (filters?.q?.trim()) {
    params.push(`%${filters.q.trim().toLowerCase()}%`)
    qCondition = ` WHERE (LOWER(name) LIKE $${params.length} OR LOWER(username) LIKE $${params.length})`
  }

  const union = roles.map((role) => `(${selectFor(role)}${qCondition})`).join(' UNION ALL ')
  const { rows } = await getPool().query<DbUser>(
    `SELECT * FROM (${union}) AS all_users ORDER BY created_at DESC`,
    params,
  )
  return rows
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<DbUser | null> {
  const existing = await findByIdAnyRole(id)
  if (!existing) return null

  const table = TABLE_BY_ROLE[existing.role]
  const officerSet =
    existing.role === 'officer' ? ', officer_id = $5, assigned_region = $6' : ''
  const params: unknown[] = [
    id,
    input.name ?? existing.name,
    input.email !== undefined ? input.email : existing.email,
    input.phone !== undefined ? input.phone : existing.phone,
  ]
  if (existing.role === 'officer') {
    params.push(
      input.officerId !== undefined ? input.officerId : existing.officer_id,
      input.assignedRegion !== undefined ? input.assignedRegion : existing.assigned_region,
    )
  }

  await getPool().query(
    `UPDATE ${table} SET
       name = $2,
       email = $3,
       phone = $4${officerSet},
       updated_at = NOW()
     WHERE id = $1`,
    params,
  )
  return findById(id, existing.role)
}

export async function setPassword(id: string, passwordHash: string): Promise<boolean> {
  const existing = await findByIdAnyRole(id)
  if (!existing) return false
  const result = await getPool().query(
    `UPDATE ${TABLE_BY_ROLE[existing.role]} SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
    [id, passwordHash],
  )
  return (result.rowCount ?? 0) > 0
}

export async function setActive(id: string, isActive: boolean): Promise<DbUser | null> {
  const existing = await findByIdAnyRole(id)
  if (!existing) return null
  await getPool().query(
    `UPDATE ${TABLE_BY_ROLE[existing.role]} SET is_active = $2, updated_at = NOW() WHERE id = $1`,
    [id, isActive],
  )
  return findById(id, existing.role)
}

export async function deleteUser(id: string): Promise<boolean> {
  const existing = await findByIdAnyRole(id)
  if (!existing) return false

  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    // Stale rows: notification_reads has no FK to the role tables
    await client.query(
      'DELETE FROM notification_reads WHERE user_id = $1 AND user_role = $2',
      [id, existing.role],
    )
    // reviewed_by_* and farmer-owned rows cascade / set null via FKs
    const result = await client.query(
      `DELETE FROM ${TABLE_BY_ROLE[existing.role]} WHERE id = $1`,
      [id],
    )
    await client.query('COMMIT')
    return (result.rowCount ?? 0) > 0
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function countUsers(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    `SELECT (
       (SELECT COUNT(*) FROM farmers) +
       (SELECT COUNT(*) FROM officers) +
       (SELECT COUNT(*) FROM admins)
     )::text AS count`,
  )
  return Number(rows[0]?.count ?? 0)
}
