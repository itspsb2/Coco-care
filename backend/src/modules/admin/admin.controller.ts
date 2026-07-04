import type { Request, Response, NextFunction } from 'express'
import * as adminService from './admin.service.js'

export async function users(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getUsers())
  } catch (err) {
    next(err)
  }
}

export async function stats(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.getStats())
  } catch (err) {
    next(err)
  }
}
