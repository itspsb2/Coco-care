import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { diagnosisSchema } from '../auth/auth.schemas.js'
import * as diagnosisController from './diagnosis.controller.js'

const router = Router()

router.post(
  '/api/diagnosis',
  auth,
  roles('farmer'),
  validateBody(diagnosisSchema),
  diagnosisController.submit,
)

export default router
