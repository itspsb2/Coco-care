import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import * as diseaseMapController from './diseaseMap.controller.js'

const router = Router()

router.get(
  '/api/disease-map/heatmap',
  auth,
  roles('farmer'),
  diseaseMapController.heatmap,
)

export default router
