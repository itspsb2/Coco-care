import { z } from 'zod'

const trimmedRequiredString = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim() : val),
  z.string().min(1),
)

const trimmedOptionalString = z.preprocess(
  (val) => {
    if (typeof val !== 'string') return val
    const trimmed = val.trim()
    return trimmed === '' ? undefined : trimmed
  },
  z.string().optional(),
)

export const loginSchema = z.object({
  username: trimmedRequiredString,
  password: z.string().min(1),
})

export const registerSchema = z.object({
  role: z.enum(['farmer', 'officer', 'admin']),
  name: trimmedOptionalString,
  username: trimmedRequiredString,
  email: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val
      const trimmed = val.trim()
      return trimmed === '' ? undefined : trimmed.toLowerCase()
    },
    z.string().email().optional(),
  ),
  phone: trimmedRequiredString,
  password: z.string().min(6),
  officerId: trimmedOptionalString,
  assignedRegion: trimmedOptionalString,
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
  category: z.enum(['leaves', 'stem', 'bud', 'fruit', 'whole-tree']).optional(),
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
