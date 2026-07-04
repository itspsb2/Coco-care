import * as reportRepo from '../../repositories/report.repository.js'
import * as userRepo from '../../repositories/user.repository.js'
import { notFound, forbidden } from '../../utils/errors.js'

export function regionMatches(farmLocation: string, assignedRegion: string): boolean {
  const location = farmLocation.trim().toLowerCase()
  const region = assignedRegion.trim().toLowerCase()
  if (!location || !region) return false
  return location.includes(region)
}

export async function getMyReports(userId: string) {
  return reportRepo.findReportsByUserId(userId)
}

export async function getPendingReportsForOfficer(officerId: string) {
  const officer = await userRepo.findById(officerId)
  if (!officer?.assigned_region?.trim()) {
    return []
  }
  return reportRepo.findPendingReportsByRegion(officer.assigned_region)
}

export async function getVerifiedReportsForOfficer() {
  return reportRepo.findReportsByStatus('verified')
}

export async function getPendingReports() {
  return reportRepo.findPendingReports()
}

export async function reviewReport(
  id: string,
  reviewerId: string,
  action: 'verify' | 'reject',
  comment?: string,
) {
  const existing = await reportRepo.findReportById(id)
  if (!existing) throw notFound('Report not found')

  const reviewer = await userRepo.findById(reviewerId)
  if (!reviewer) throw notFound('Reviewer not found')

  if (reviewer.role === 'officer') {
    const assignedRegion = reviewer.assigned_region?.trim()
    if (!assignedRegion) {
      throw forbidden('No assigned region — contact admin to assign your region before reviewing reports')
    }
    if (!regionMatches(existing.region, assignedRegion)) {
      throw forbidden('You can only review reports in your assigned region')
    }
  }

  return reportRepo.updateReportReview(
    id,
    action === 'verify' ? 'verified' : 'rejected',
    reviewerId,
    comment,
  )
}
