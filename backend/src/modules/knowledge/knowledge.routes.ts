import { Router } from 'express'
import { auth, roles } from '../../middleware/auth.js'
import * as knowledgeController from './knowledge.controller.js'

const router = Router()

router.get(
  '/api/knowledge/documents',
  auth,
  roles('farmer'),
  knowledgeController.getByTitle,
)

router.get(
  '/api/knowledge/documents/:id',
  auth,
  roles('farmer'),
  knowledgeController.getById,
)

export default router
