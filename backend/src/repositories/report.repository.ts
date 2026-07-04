import type { DiseaseReport } from '../types/index.js'
import { getPool } from '../db/pool.js'

export interface CreateReportInput {
  farmId: string
  userId: string
  imageUrl?: string
  symptoms: Record<string, string | boolean>
  imageResult: string
  symptomResult: string
  finalResult: string
  confidence: number
  advice: string
  status: 'pending' | 'verified' | 'rejected'
}

interface ReportRow {
  id: string
  farm_id: string
  user_id: string
  image_url: string | null
  symptoms: Record<string, string | boolean>
  image_result: string | null
  symptom_result: string | null
  final_result: string | null
  confidence: string | null
  advice: string | null
  status: 'pending' | 'verified' | 'rejected'
  review_comment: string | null
  reviewed_by: string | null
  created_at: Date
  farm_name: string
  region: string
}

function mapReport(row: ReportRow): DiseaseReport {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmName: row.farm_name,
    region: row.region,
    imageResult: row.image_result ?? undefined,
    symptomResult: row.symptom_result ?? undefined,
    finalResult: row.final_result ?? undefined,
    confidence: Number(row.confidence ?? 0),
    status: row.status,
    createdAt: row.created_at.toISOString(),
    reviewComment: row.review_comment ?? undefined,
  }
}

const REPORT_SELECT = `
  SELECT dr.id, dr.farm_id, dr.user_id, dr.image_url, dr.symptoms,
         dr.image_result, dr.symptom_result, dr.final_result, dr.confidence,
         dr.advice, dr.status, dr.review_comment, dr.reviewed_by, dr.created_at,
         f.name AS farm_name, f.location AS region
  FROM disease_reports dr
  JOIN farms f ON f.id = dr.farm_id
`

export async function createReport(input: CreateReportInput): Promise<DiseaseReport> {
  const { rows: inserted } = await getPool().query<{ id: string }>(
    `INSERT INTO disease_reports (
       farm_id, user_id, image_url, symptoms, image_result, symptom_result,
       final_result, confidence, advice, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      input.farmId,
      input.userId,
      input.imageUrl ?? null,
      JSON.stringify(input.symptoms),
      input.imageResult,
      input.symptomResult,
      input.finalResult,
      input.confidence,
      input.advice,
      input.status,
    ],
  )
  const full = await findReportById(inserted[0].id)
  if (!full) throw new Error('Failed to create report')
  return mapReport(full)
}

export async function findReportsByUserId(userId: string): Promise<DiseaseReport[]> {
  const { rows } = await getPool().query<ReportRow>(
    `${REPORT_SELECT} WHERE dr.user_id = $1 ORDER BY dr.created_at DESC`,
    [userId],
  )
  return rows.map(mapReport)
}

export async function findPendingReports(): Promise<DiseaseReport[]> {
  const { rows } = await getPool().query<ReportRow>(
    `${REPORT_SELECT} WHERE dr.status = 'pending' ORDER BY dr.created_at DESC`,
  )
  return rows.map(mapReport)
}

export async function findReportById(id: string): Promise<ReportRow | null> {
  const { rows } = await getPool().query<ReportRow>(
    `${REPORT_SELECT} WHERE dr.id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function updateReportReview(
  id: string,
  status: 'verified' | 'rejected',
  reviewedBy: string,
  comment?: string,
): Promise<DiseaseReport> {
  const result = await getPool().query(
    `UPDATE disease_reports
     SET status = $2, reviewed_by = $3, review_comment = $4
     WHERE id = $1`,
    [id, status, reviewedBy, comment ?? null],
  )
  if (result.rowCount === 0) throw new Error('Report not found')
  const full = await findReportById(id)
  if (!full) throw new Error('Report not found')
  return mapReport(full)
}

export async function countPendingReports(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM disease_reports WHERE status = 'pending'`,
  )
  return Number(rows[0]?.count ?? 0)
}

export async function countVerifiedReports(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM disease_reports WHERE status = 'verified'`,
  )
  return Number(rows[0]?.count ?? 0)
}

export interface HeatmapRow {
  lat: number
  lng: number
  weight: number
  disease_type: string
}

export async function findVerifiedHeatmapPoints(): Promise<HeatmapRow[]> {
  const { rows } = await getPool().query<HeatmapRow>(
    `SELECT f.latitude AS lat, f.longitude AS lng,
            COALESCE(dr.confidence, 0.5)::float AS weight,
            COALESCE(dr.final_result, 'Unknown') AS disease_type
     FROM disease_reports dr
     JOIN farms f ON f.id = dr.farm_id
     WHERE dr.status = 'verified'
     ORDER BY dr.created_at DESC`,
  )
  return rows
}
