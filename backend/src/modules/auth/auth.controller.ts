import type { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as authService from './auth.service.js'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await authService.login(req.body))
  } catch (err) {
    next(err)
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await authService.register(req.body))
  } catch (err) {
    next(err)
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await authService.me(req.user.id))
  } catch (err) {
    next(err)
  }
}
