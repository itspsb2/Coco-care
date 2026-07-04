import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import * as adminController from './admin.controller.js'

const router = Router()
const adminOnly = [auth, roles('admin')] as const

router.get('/admin/users', ...adminOnly, adminController.users)
router.post('/admin/users', ...adminOnly, adminController.createUser)
router.patch('/admin/users/:id', ...adminOnly, adminController.updateUser)
router.post('/admin/users/:id/reset-password', ...adminOnly, adminController.resetPassword)
router.post('/admin/users/:id/deactivate', ...adminOnly, adminController.deactivateUser)
router.post('/admin/users/:id/activate', ...adminOnly, adminController.activateUser)
router.delete('/admin/users/:id', ...adminOnly, adminController.deleteUser)

router.get('/admin/stats', ...adminOnly, adminController.stats)
router.get('/admin/reports', ...adminOnly, adminController.reports)
router.post('/admin/reports/:id/review', ...adminOnly, adminController.reviewReport)

router.get('/admin/farms', ...adminOnly, adminController.farms)
router.get('/admin/farms/:id/reports', ...adminOnly, adminController.farmReports)
router.get('/admin/regions/summary', ...adminOnly, adminController.regionSummary)

router.get('/admin/health', ...adminOnly, adminController.health)

router.get('/admin/notifications', ...adminOnly, adminController.listBroadcasts)
router.post('/admin/notifications', ...adminOnly, adminController.createBroadcast)

export default router
