import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import * as weatherController from './weather.controller.js'

const router = Router()

router.get('/api/weather/forecast', auth, roles('farmer'), weatherController.forecast)

export default router
