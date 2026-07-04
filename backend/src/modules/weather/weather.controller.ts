import type { Request, Response, NextFunction } from 'express'
import * as weatherService from '../../services/weather.service.js'

export async function forecast(req: Request, res: Response, next: NextFunction) {
  try {
    const lat = req.query.lat != null ? Number(req.query.lat) : undefined
    const lon = req.query.lon != null ? Number(req.query.lon) : undefined
    const location = typeof req.query.location === 'string' ? req.query.location : undefined

    const data = await weatherService.getForecast({ lat, lon, location })
    res.json(data)
  } catch (err) {
    next(err)
  }
}
