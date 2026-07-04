import type { Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import type { AuthRequest } from '../../middleware/auth.js'
import * as diseaseMapService from './diseaseMap.service.js'
import {
  heatmapQuerySchema,
  nearbyQuerySchema,
  alertIdParamSchema,
} from './diseaseMap.schemas.js'
import { badRequest } from '../../utils/errors.js'

function parseWithSchema<T>(schema: ZodSchema<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw badRequest(result.error.errors.map((e) => e.message).join(', '))
  }
  return result.data
}

export async function heatmap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters = parseWithSchema(heatmapQuerySchema, req.query)
    res.json(await diseaseMapService.getHeatmap(filters))
  } catch (err) {
    next(err)
  }
}

export async function nearby(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { radiusKm } = parseWithSchema(nearbyQuerySchema, req.query)
    res.json(await diseaseMapService.getNearby(req.user!.id, radiusKm))
  } catch (err) {
    next(err)
  }
}

export async function alerts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await diseaseMapService.getAlerts(req.user!.id))
  } catch (err) {
    next(err)
  }
}

export async function markAlertRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = parseWithSchema(alertIdParamSchema, req.params)
    res.json(await diseaseMapService.markAlertRead(id, req.user!.id))
  } catch (err) {
    next(err)
  }
}

export async function stats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await diseaseMapService.getStats())
  } catch (err) {
    next(err)
  }
}
