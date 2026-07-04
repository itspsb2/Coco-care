import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const err = new Error(
        result.error.errors.map((e) => e.message).join(', '),
      ) as Error & { status: number }
      err.status = 400
      return next(err)
    }
    req.body = result.data
    next()
  }
}
