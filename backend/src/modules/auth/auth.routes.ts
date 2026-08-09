import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { loginSchema, registerSchema } from './auth.schemas.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/login', validateBody(loginSchema), authController.login)
router.post('/register', validateBody(registerSchema), authController.register)
router.get('/me', auth, authController.me)

export default router
