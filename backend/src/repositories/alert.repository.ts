import { getPool } from '../db/pool.js'
import type { DiseaseAlert } from '../types/index.js'

interface AlertRow {
  id: string
  report_id: string
  farm_id: string
  disease_type: string
  distance_km: string
  message: string
  read_at: Date | null
  created_at: Date
}

interface NearbyFarmRow {
  farmer_user_id: string
  farm_id: string
  distance_km: number
}

export interface InsertAlertInput {
  reportId: string
  farmerUserId: string
  farmId: string
  diseaseType: string
  distanceKm: number
  message: string
}

function mapAlert(row: AlertRow): DiseaseAlert {
  return {
    id: row.id,
    reportId: row.report_id,
    farmId: row.farm_id,
    diseaseType: row.disease_type,
    distanceKm: Number(row.distance_km),
    message: row.message,
    read: row.read_at != null,
    createdAt: row.created_at.toISOString(),
  }
}

const HAVERSINE_KM = `
  6371 * acos(
    LEAST(1.0, GREATEST(-1.0,
      cos(radians($1)) * cos(radians(f.latitude)) * cos(radians(f.longitude) - radians($2))
      + sin(radians($1)) * sin(radians(f.latitude))
    ))
  )
`

export async function findAlertsByFarmerId(farmerUserId: string): Promise<DiseaseAlert[]> {
  const { rows } = await getPool().query<AlertRow>(
    `SELECT id, report_id, farm_id, disease_type, distance_km, message, read_at, created_at
     FROM disease_alerts
     WHERE farmer_user_id = $1
     ORDER BY created_at DESC`,
    [farmerUserId],
  )
  return rows.map(mapAlert)
}

export async function markAlertRead(
  alertId: string,
  farmerUserId: string,
): Promise<DiseaseAlert | null> {
  const { rows } = await getPool().query<AlertRow>(
    `UPDATE disease_alerts
     SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND farmer_user_id = $2
     RETURNING id, report_id, farm_id, disease_type, distance_km, message, read_at, created_at`,
    [alertId, farmerUserId],
  )
  return rows[0] ? mapAlert(rows[0]) : null
}

export async function findNearbyFarms(
  latitude: number,
  longitude: number,
  excludeUserId: string,
  radiusKm: number,
): Promise<NearbyFarmRow[]> {
  const { rows } = await getPool().query<NearbyFarmRow>(
    `SELECT f.user_id AS farmer_user_id,
            f.id AS farm_id,
            (${HAVERSINE_KM})::float AS distance_km
     FROM farms f
     JOIN farmers u ON u.id = f.user_id
     WHERE f.user_id != $3
       AND u.is_active IS DISTINCT FROM false
       AND (${HAVERSINE_KM}) <= $4`,
    [latitude, longitude, excludeUserId, radiusKm],
  )
  return rows
}

export async function insertAlertsIgnoreConflicts(alerts: InsertAlertInput[]): Promise<number> {
  if (alerts.length === 0) return 0

  let inserted = 0
  for (const alert of alerts) {
    const result = await getPool().query(
      `INSERT INTO disease_alerts (
         report_id, farmer_user_id, farm_id, disease_type, distance_km, message
       ) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (report_id, farmer_user_id, farm_id) DO NOTHING`,
      [
        alert.reportId,
        alert.farmerUserId,
        alert.farmId,
        alert.diseaseType,
        alert.distanceKm,
        alert.message,
      ],
    )
    inserted += result.rowCount ?? 0
  }
  return inserted
}
