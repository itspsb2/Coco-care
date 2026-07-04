import { z } from 'zod'

export const adminCreateUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['farmer', 'officer', 'admin']),
  officerId: z.string().optional(),
  assignedRegion: z.string().optional(),
})

export const adminUpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  role: z.enum(['farmer', 'officer', 'admin']).optional(),
  officerId: z.string().optional().nullable(),
  assignedRegion: z.string().optional().nullable(),
})

export const adminResetPasswordSchema = z.object({
  password: z.string().min(6),
})

export const adminReviewSchema = z.object({
  action: z.enum(['verify', 'reject']),
  comment: z.string().optional(),
})

export const adminBroadcastSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  audience: z.enum(['all', 'farmers', 'officers']),
})
