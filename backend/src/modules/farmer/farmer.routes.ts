import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { farmSchema } from '../auth/auth.schemas.js'
import * as farmerController from './farmer.controller.js'

const router = Router()

router.get('/farmers/profile', auth, roles('farmer'), farmerController.profile)
router.post('/farms', auth, roles('farmer'), validateBody(farmSchema), farmerController.createFarm)

export default router
