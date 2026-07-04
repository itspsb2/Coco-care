import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import * as adminController from './admin.controller.js'

const router = Router()

router.get('/admin/users', auth, roles('admin'), adminController.users)
router.get('/admin/stats', auth, roles('admin'), adminController.stats)

export default router
