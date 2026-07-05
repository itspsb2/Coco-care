import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  role: z.enum(['farmer', 'officer', 'admin']),
  name: z.string().optional(),
  username: z.string().min(1),
  email: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().email().optional(),
  ),
  phone: z.string().min(1),
  password: z.string().min(6),
  officerId: z.string().optional(),
  assignedRegion: z.string().optional(),
  farms: z
    .array(
      z.object({
        name: z.string(),
        location: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        acreage: z.number(),
        treeCount: z.number(),
      }),
    )
    .optional(),
})

export const farmSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  acreage: z.number().positive(),
  treeCount: z.number().int().positive(),
})

export const diagnosisSchema = z.object({
  farmId: z.string().min(1),
  imageUrl: z.string().optional(),
  symptoms: z.record(z.union([z.string(), z.boolean()])),
  notes: z.string().optional(),
})

export const reviewSchema = z.object({
  action: z.enum(['verify', 'reject']),
  comment: z.string().optional(),
})

export const chatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().uuid(),
})
