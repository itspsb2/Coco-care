import type { Request, Response, NextFunction } from 'express'
import type { User, UserRole } from '../types/index.js'
import { verifyToken } from '../utils/jwt.js'
import * as userRepo from '../repositories/user.repository.js'
import { toPublicUser } from '../repositories/user.repository.js'
import { unauthorized, forbidden } from '../utils/errors.js'

export interface AuthRequest extends Request {
  user?: User
}

export async function auth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw unauthorized()
    }
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    const dbUser = payload.role
      ? await userRepo.findById(payload.sub, payload.role)
      : await userRepo.findByIdAnyRole(payload.sub)
    if (!dbUser) throw unauthorized()
    if (dbUser.is_active === false) throw unauthorized('Your account is inactive. Please contact the admin.')
    req.user = toPublicUser(dbUser)
    next()
  } catch (err) {
    if ((err as Error & { status?: number }).status) {
      return next(err)
    }
    next(unauthorized('Invalid or expired token'))
  }
}

export function roles(...allowed: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized())
    if (!allowed.includes(req.user.role)) return next(forbidden())
    next()
  }
}
