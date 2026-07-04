import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as notificationsService from './notifications.service.js'
import { badRequest } from '../../utils/errors.js'

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    res.json(await notificationsService.listForUser(req.user.id, req.user.role))
  } catch (err) {
    next(err)
  }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    const id = String(req.params.id ?? '')
    res.json(await notificationsService.markRead(id, req.user.id))
  } catch (err) {
    next(err)
  }
}
