import { z } from 'zod'

export const diseaseMapFilterSchema = z.object({
  diseaseType: z.string().min(1).optional(),
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  minWeight: z.coerce.number().min(0).max(1).optional(),
  district: z.string().min(1).optional(),
})

export const heatmapQuerySchema = diseaseMapFilterSchema

export const statsQuerySchema = diseaseMapFilterSchema

export const nearbyQuerySchema = z.object({
  radiusKm: z.coerce.number().min(1).max(50).optional(),
})

export const alertIdParamSchema = z.object({
  id: z.string().uuid(),
})
