import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import * as notificationsController from './notifications.controller.js'

const router = Router()

router.get('/api/notifications', auth, notificationsController.list)
router.post('/api/notifications/:id/read', auth, notificationsController.markRead)

export default router
