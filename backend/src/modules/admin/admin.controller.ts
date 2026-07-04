import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as adminService from './admin.service.js'
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminResetPasswordSchema,
  adminReviewSchema,
  adminBroadcastSchema,
} from './admin.schemas.js'
import { badRequest } from '../../utils/errors.js'

function paramId(req: AuthRequest): string {
  return String(req.params.id ?? '')
}

export async function users(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = typeof req.query.role === 'string' ? req.query.role : undefined
    const q = typeof req.query.q === 'string' ? req.query.q : undefined
    res.json(await adminService.getUsers({ role, q }))
  } catch (err) {
    next(err)
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = adminCreateUserSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')
    const user = await adminService.createUser(parsed.data)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = adminUpdateUserSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')
    res.json(await adminService.updateUser(paramId(req), parsed.data))
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = adminResetPasswordSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')
    res.json(await adminService.resetPassword(paramId(req), parsed.data.password))
  } catch (err) {
    next(err)
  }
}

export async function deactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    res.json(await adminService.setUserActive(paramId(req), false, req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function activateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    res.json(await adminService.setUserActive(paramId(req), true, req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    res.json(await adminService.removeUser(paramId(req), req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function stats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getStats())
  } catch (err) {
    next(err)
  }
}

export async function reports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(
      await adminService.getReports({
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        region: typeof req.query.region === 'string' ? req.query.region : undefined,
        disease: typeof req.query.disease === 'string' ? req.query.disease : undefined,
      }),
    )
  } catch (err) {
    next(err)
  }
}

export async function reviewReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    const parsed = adminReviewSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')
    res.json(
      await adminService.reviewReport(
        paramId(req),
        req.user.id,
        parsed.data.action,
        parsed.data.comment,
      ),
    )
  } catch (err) {
    next(err)
  }
}

export async function farms(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getFarms())
  } catch (err) {
    next(err)
  }
}

export async function farmReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getFarmReports(paramId(req)))
  } catch (err) {
    next(err)
  }
}

export async function regionSummary(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getRegionSummary())
  } catch (err) {
    next(err)
  }
}

export async function health(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getHealth())
  } catch (err) {
    next(err)
  }
}

export async function createBroadcast(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw badRequest('Not authenticated')
    const parsed = adminBroadcastSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input')
    const item = await adminService.createBroadcast(req.user.id, parsed.data)
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

export async function listBroadcasts(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.listBroadcasts())
  } catch (err) {
    next(err)
  }
}
