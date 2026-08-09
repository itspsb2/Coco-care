import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as farmerService from './farmer.service.js'

function paramId(req: AuthRequest): string {
  return String(req.params.id ?? '')
}

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

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await farmerService.updateProfile(req.user.id, req.body))
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await farmerService.changePassword(req.user.id, req.body))
  } catch (err) {
    next(err)
  }
}

export async function updateFarm(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await farmerService.updateFarm(req.user.id, paramId(req), req.body))
  } catch (err) {
    next(err)
  }
}

export async function deleteFarm(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await farmerService.deleteFarm(req.user.id, paramId(req)))
  } catch (err) {
    next(err)
  }
}
