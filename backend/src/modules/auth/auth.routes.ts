import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { loginSchema, passwordChangeSchema, registerSchema } from './auth.schemas.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/login', validateBody(loginSchema), authController.login)
router.post('/register', validateBody(registerSchema), authController.register)
router.get('/me', auth, authController.me)
router.patch('/password', auth, validateBody(passwordChangeSchema), authController.changePassword)

export default router
