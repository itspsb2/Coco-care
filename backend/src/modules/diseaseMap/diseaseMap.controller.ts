import type { Request, Response, NextFunction } from 'express'
import * as diseaseMapService from './diseaseMap.service.js'

export async function heatmap(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await diseaseMapService.getHeatmap())
  } catch (err) {
    next(err)
  }
}
