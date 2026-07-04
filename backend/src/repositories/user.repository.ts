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
  created_at: Date
  updated_at: Date
}

export function toPublicUser(row: DbUser): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: row.role,
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

export async function findByUsername(username: string): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `SELECT id, username, password_hash, name, email, phone, role,
            officer_id, assigned_region, created_at, updated_at
     FROM users WHERE username = $1`,
    [username],
  )
  return rows[0] ?? null
}

export async function findById(id: string): Promise<DbUser | null> {
  const { rows } = await getPool().query<DbUser>(
    `SELECT id, username, password_hash, name, email, phone, role,
            officer_id, assigned_region, created_at, updated_at
     FROM users WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function createUser(input: CreateUserInput): Promise<DbUser> {
  const { rows } = await getPool().query<DbUser>(
    `INSERT INTO users (username, password_hash, name, email, phone, role, officer_id, assigned_region)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, username, password_hash, name, email, phone, role,
               officer_id, assigned_region, created_at, updated_at`,
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

export async function listAllUsers(): Promise<DbUser[]> {
  const { rows } = await getPool().query<DbUser>(
    `SELECT id, username, password_hash, name, email, phone, role,
            officer_id, assigned_region, created_at, updated_at
     FROM users ORDER BY created_at DESC`,
  )
  return rows
}

export async function countUsers(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM users',
  )
  return Number(rows[0]?.count ?? 0)
}
