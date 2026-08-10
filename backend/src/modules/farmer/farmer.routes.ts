import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { farmSchema } from '../auth/auth.schemas.js'
import * as farmerController from './farmer.controller.js'
import {
  farmerFarmUpdateSchema,
  farmerPasswordChangeSchema,
  farmerProfileUpdateSchema,
} from './farmer.schemas.js'

const router = Router()

router.get('/farmers/profile', auth, roles('farmer'), farmerController.profile)
router.patch(
  '/farmers/profile',
  auth,
  roles('farmer'),
  validateBody(farmerProfileUpdateSchema),
  farmerController.updateProfile,
)
router.patch(
  '/farmers/password',
  auth,
  roles('farmer'),
  validateBody(farmerPasswordChangeSchema),
  farmerController.changePassword,
)
router.post('/farms', auth, roles('farmer'), validateBody(farmSchema), farmerController.createFarm)
router.patch(
  '/farms/:id',
  auth,
  roles('farmer'),
  validateBody(farmerFarmUpdateSchema),
  farmerController.updateFarm,
)
router.delete('/farms/:id', auth, roles('farmer'), farmerController.deleteFarm)

export default router
