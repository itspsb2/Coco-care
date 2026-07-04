import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import * as diseaseMapController from './diseaseMap.controller.js'

const router = Router()

router.get(
  '/api/disease-map/heatmap',
  auth,
  roles('farmer', 'officer', 'admin'),
  diseaseMapController.heatmap,
)

router.get(
  '/api/disease-map/nearby',
  auth,
  roles('farmer'),
  diseaseMapController.nearby,
)

router.get(
  '/api/disease-map/alerts',
  auth,
  roles('farmer'),
  diseaseMapController.alerts,
)

router.patch(
  '/api/disease-map/alerts/:id/read',
  auth,
  roles('farmer'),
  diseaseMapController.markAlertRead,
)

router.get(
  '/api/disease-map/stats',
  auth,
  roles('farmer', 'officer', 'admin'),
  diseaseMapController.stats,
)

export default router
