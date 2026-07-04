import * as reportRepo from '../../repositories/report.repository.js'
import * as diseaseMapService from '../diseaseMap/diseaseMap.service.js'
import { notFound } from '../../utils/errors.js'

export async function getMyReports(userId: string) {
  return reportRepo.findReportsByUserId(userId)
}

export async function getPendingReports() {
  return reportRepo.findPendingReports()
}

export async function reviewReport(
  id: string,
  officerId: string,
  action: 'verify' | 'reject',
  comment?: string,
) {
  const existing = await reportRepo.findReportById(id)
  if (!existing) throw notFound('Report not found')

  const updated = await reportRepo.updateReportReview(
    id,
    action === 'verify' ? 'verified' : 'rejected',
    officerId,
    comment,
  )

  if (action === 'verify') {
    await diseaseMapService.createAlertsForVerifiedReport(id)
  }

  return updated
}
