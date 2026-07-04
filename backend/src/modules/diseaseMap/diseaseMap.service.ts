import * as reportRepo from '../../repositories/report.repository.js'
import type { HeatmapPoint } from '../../types/index.js'

export async function getHeatmap(): Promise<HeatmapPoint[]> {
  const rows = await reportRepo.findVerifiedHeatmapPoints()
  return rows.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    weight: r.weight,
    diseaseType: r.disease_type,
  }))
}
