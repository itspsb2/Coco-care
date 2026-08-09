import * as reportRepo from '../../repositories/report.repository.js'
import * as alertRepo from '../../repositories/alert.repository.js'
import { env } from '../../config/env.js'
import { notFound } from '../../utils/errors.js'
import type {
  HeatmapPoint,
  NearbyResponse,
  DiseaseAlert,
  DiseaseMapStats,
} from '../../types/index.js'

export async function getHeatmap(filters: reportRepo.HeatmapFilters = {}): Promise<HeatmapPoint[]> {
  const rows = await reportRepo.findVerifiedHeatmapPoints(filters)
  return rows.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    weight: r.weight,
    diseaseType: r.disease_type,
    verificationStatus: r.verification_status,
    createdAt: r.created_at.toISOString(),
  }))
}

export async function getNearby(
  farmerUserId: string,
  radiusKm = env.diseaseAlertRadiusKm,
): Promise<NearbyResponse> {
  const capped = Math.min(Math.max(radiusKm, 1), 50)
  const rows = await reportRepo.findNearbyOutbreaks(farmerUserId, capped)

  const byFarm = new Map<
    string,
    { farmId: string; farmName: string; outbreaks: NearbyResponse['farms'][0]['outbreaks'] }
  >()

  for (const r of rows) {
    let entry = byFarm.get(r.farm_id)
    if (!entry) {
      entry = { farmId: r.farm_id, farmName: r.farm_name, outbreaks: [] }
      byFarm.set(r.farm_id, entry)
    }
    entry.outbreaks.push({
      lat: r.lat,
      lng: r.lng,
      diseaseType: r.disease_type,
      weight: r.weight,
      distanceKm: Math.round(Number(r.distance_km) * 100) / 100,
      reportId: r.report_id,
      verificationStatus: r.verification_status,
      createdAt: r.created_at.toISOString(),
    })
  }

  return { farms: Array.from(byFarm.values()) }
}

export async function getAlerts(farmerUserId: string): Promise<DiseaseAlert[]> {
  return alertRepo.findAlertsByFarmerId(farmerUserId)
}

export async function markAlertRead(
  alertId: string,
  farmerUserId: string,
): Promise<DiseaseAlert> {
  const alert = await alertRepo.markAlertRead(alertId, farmerUserId)
  if (!alert) throw notFound('Alert not found')
  return alert
}

export async function getStats(filters: reportRepo.HeatmapFilters = {}): Promise<DiseaseMapStats> {
  const stats = await reportRepo.getVerifiedStats(0.7, filters)
  return {
    byDisease: stats.byDisease.map((r) => ({
      diseaseType: r.disease_type,
      count: Number(r.count),
    })),
    byWeek: stats.byWeek.map((r) => ({
      week: r.week,
      count: Number(r.count),
    })),
    highRiskCount: stats.highRiskCount,
  }
}

async function createAlertsForReport(
  reportId: string,
  alertType: 'verified' | 'ai_suspected',
): Promise<number> {
  const report = await reportRepo.findReportById(reportId)
  if (!report) return 0

  const confidence = Number(report.confidence ?? 0)
  const isReviewedVerified =
    report.status === 'verified' &&
    (report.reviewed_by_officer != null || report.reviewed_by_admin != null)
  const isHighConfidencePending =
    report.status === 'pending' &&
    confidence > reportRepo.AI_SUSPECTED_CONFIDENCE_THRESHOLD

  if (alertType === 'verified' && !isReviewedVerified) return 0
  if (alertType === 'ai_suspected' && !isHighConfidencePending) return 0

  const farm = await reportRepo.findReportFarmCoords(reportId)
  if (!farm) return 0

  const diseaseType = report.final_result ?? 'Unknown disease'
  const radiusKm = env.diseaseAlertRadiusKm
  const nearby = await alertRepo.findNearbyFarms(
    farm.latitude,
    farm.longitude,
    report.user_id,
    radiusKm,
  )

  const alerts = nearby.map((n) => {
    const distanceKm = Math.round(n.distance_km * 100) / 100
    return {
      reportId,
      farmerUserId: n.farmer_user_id,
      farmId: n.farm_id,
      diseaseType,
      alertType,
      distanceKm,
      message:
        alertType === 'verified'
          ? `Verified outbreak of ${diseaseType} reported approximately ${distanceKm} km from your farm.`
          : `AI-suspected case of ${diseaseType} reported approximately ${distanceKm} km from your farm. This has not been officer verified yet.`,
    }
  })

  return alertRepo.upsertAlerts(alerts)
}

/** Create nearby-farmer alerts after an officer or admin verifies a report. */
export async function createAlertsForVerifiedReport(reportId: string): Promise<number> {
  return createAlertsForReport(reportId, 'verified')
}

/** Create nearby-farmer alerts for high-confidence pending AI reports. */
export async function createAlertsForSuspectedReport(reportId: string): Promise<number> {
  return createAlertsForReport(reportId, 'ai_suspected')
}

/** Remove outbreak alerts when a report is rejected. */
export async function deleteAlertsForRejectedReport(reportId: string): Promise<number> {
  return alertRepo.deleteAlertsForReport(reportId)
}
