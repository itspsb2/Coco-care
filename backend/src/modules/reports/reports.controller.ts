import type { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as reportsService from './reports.service.js'

export async function my(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await reportsService.getMyReports(req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function pending(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await reportsService.getPendingReportsForOfficer(req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function verified(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await reportsService.getVerifiedReportsForOfficer())
  } catch (err) {
    next(err)
  }
}

export async function review(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    const { action, comment } = req.body as { action: 'verify' | 'reject'; comment?: string }
    const id = String(req.params.id)
    res.json(await reportsService.reviewReport(id, req.user.id, action, comment))
  } catch (err) {
    next(err)
  }
}
