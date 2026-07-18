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

export interface AdminFarmRow {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: string
  tree_count: number
  owner_id: string
  owner_name: string
  owner_username: string
}

export interface AdminFarm {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: number
  treeCount: number
  ownerId: string
  ownerName: string
  ownerUsername: string
}

export async function listAllFarmsWithOwner(): Promise<AdminFarm[]> {
  const { rows } = await getPool().query<AdminFarmRow>(
    `SELECT f.id, f.name, f.location, f.latitude, f.longitude, f.acreage, f.tree_count,
            u.id AS owner_id, u.name AS owner_name, u.username AS owner_username
     FROM farms f
     JOIN farmers u ON u.id = f.user_id
     ORDER BY f.created_at DESC`,
  )
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    latitude: r.latitude,
    longitude: r.longitude,
    acreage: Number(r.acreage),
    treeCount: r.tree_count,
    ownerId: r.owner_id,
    ownerName: r.owner_name,
    ownerUsername: r.owner_username,
  }))
}

export interface RegionSummary {
  region: string
  pending: number
  verified: number
  rejected: number
  total: number
}

export async function getRegionSummary(): Promise<RegionSummary[]> {
  const { rows } = await getPool().query<{
    region: string
    pending: string
    verified: string
    rejected: string
    total: string
  }>(
    `SELECT f.location AS region,
            COUNT(*) FILTER (WHERE dr.status = 'pending')::text AS pending,
            COUNT(*) FILTER (WHERE dr.status = 'verified')::text AS verified,
            COUNT(*) FILTER (WHERE dr.status = 'rejected')::text AS rejected,
            COUNT(*)::text AS total
     FROM farms f
     LEFT JOIN disease_reports dr ON dr.farm_id = f.id
     GROUP BY f.location
     ORDER BY COUNT(*) FILTER (WHERE dr.status = 'verified') DESC, f.location`,
  )
  return rows.map((r) => ({
    region: r.region,
    pending: Number(r.pending),
    verified: Number(r.verified),
    rejected: Number(r.rejected),
    total: Number(r.total),
  }))
}
