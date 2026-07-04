import type { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as farmerService from './farmer.service.js'

export async function profile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await farmerService.getProfile(req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function createFarm(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await farmerService.createFarm(req.user.id, req.body))
  } catch (err) {
    next(err)
  }
}
