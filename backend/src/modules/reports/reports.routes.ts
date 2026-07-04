import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { reviewSchema } from '../auth/auth.schemas.js'
import * as reportsController from './reports.controller.js'

const router = Router()

router.get('/reports/my', auth, roles('farmer'), reportsController.my)
router.get(
  '/officer/reports/pending',
  auth,
  roles('officer'),
  reportsController.pending,
)
router.get(
  '/officer/reports/verified',
  auth,
  roles('officer'),
  reportsController.verified,
)
router.post(
  '/officer/reports/:id/review',
  auth,
  roles('officer'),
  validateBody(reviewSchema),
  reportsController.review,
)

export default router
