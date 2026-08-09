import { z } from 'zod'
import { farmSchema } from '../auth/auth.schemas.js'

const trimmedOptionalNullableString = z.preprocess(
  (val) => {
    if (typeof val !== 'string') return val
    const trimmed = val.trim()
    return trimmed === '' ? null : trimmed
  },
  z.string().optional().nullable(),
)

export const farmerProfileUpdateSchema = z.object({
  name: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1).optional(),
  ),
  email: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val
      const trimmed = val.trim()
      return trimmed === '' ? null : trimmed.toLowerCase()
    },
    z.string().email().optional().nullable(),
  ),
  phone: trimmedOptionalNullableString,
})

export const farmerPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export const farmerFarmUpdateSchema = farmSchema
