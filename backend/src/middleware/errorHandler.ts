import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error & { status?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status ?? 500
  res.status(status).json({
    message: err.message || 'Internal server error',
    status,
  })
}
