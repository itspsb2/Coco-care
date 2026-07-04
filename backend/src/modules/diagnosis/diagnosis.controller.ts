import type { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as diagnosisService from './diagnosis.service.js'

export async function submit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await diagnosisService.submitDiagnosis(req.user.id, req.body))
  } catch (err) {
    next(err)
  }
}
