import type { Farm } from '../types/index.js'
import { getPool } from '../db/pool.js'

export interface CreateFarmInput {
  userId: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: number
  treeCount: number
}

interface FarmRow {
  id: string
  user_id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: string
  tree_count: number
  created_at: Date
}

function mapFarm(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    acreage: Number(row.acreage),
    treeCount: row.tree_count,
  }
}

export async function findFarmsByUserId(userId: string): Promise<Farm[]> {
  const { rows } = await getPool().query<FarmRow>(
    `SELECT id, user_id, name, location, latitude, longitude, acreage, tree_count, created_at
     FROM farms WHERE user_id = $1 ORDER BY created_at`,
    [userId],
  )
  return rows.map(mapFarm)
}

export async function findFarmById(id: string): Promise<Farm | null> {
  const { rows } = await getPool().query<FarmRow>(
    `SELECT id, user_id, name, location, latitude, longitude, acreage, tree_count, created_at
     FROM farms WHERE id = $1`,
    [id],
  )
  return rows[0] ? mapFarm(rows[0]) : null
}

export async function createFarm(input: CreateFarmInput): Promise<Farm> {
  const { rows } = await getPool().query<FarmRow>(
    `INSERT INTO farms (user_id, name, location, latitude, longitude, acreage, tree_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, name, location, latitude, longitude, acreage, tree_count, created_at`,
    [
      input.userId,
      input.name,
      input.location,
      input.latitude,
      input.longitude,
      input.acreage,
      input.treeCount,
    ],
  )
  return mapFarm(rows[0])
}
