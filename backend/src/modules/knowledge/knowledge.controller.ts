import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as knowledgeService from './knowledge.service.js'

export async function getByTitle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    const title = typeof req.query.title === 'string' ? req.query.title : ''
    res.json(await knowledgeService.getArticleByTitle(title))
  } catch (err) {
    next(err)
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    const id = String(req.params.id ?? '')
    res.json(await knowledgeService.getArticleById(id))
  } catch (err) {
    next(err)
  }
}
