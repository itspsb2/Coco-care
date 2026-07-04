import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { chatSchema } from '../auth/auth.schemas.js'
import * as chatController from './chat.controller.js'

const router = Router()

router.get('/api/chat/conversations', auth, roles('farmer'), chatController.listConversations)
router.post('/api/chat/conversations', auth, roles('farmer'), chatController.createConversation)
router.delete(
  '/api/chat/conversations/:id',
  auth,
  roles('farmer'),
  chatController.deleteConversation,
)
router.get(
  '/api/chat/conversations/:id/messages',
  auth,
  roles('farmer'),
  chatController.getMessages,
)

router.get('/api/chat/history', auth, roles('farmer'), chatController.history)
router.post(
  '/api/chat',
  auth,
  roles('farmer'),
  validateBody(chatSchema),
  chatController.send,
)

export default router
