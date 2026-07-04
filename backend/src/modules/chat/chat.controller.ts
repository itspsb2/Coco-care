import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../../middleware/auth.js'
import * as chatService from './chat.service.js'

export async function listConversations(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await chatService.listConversations(req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function createConversation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.status(201).json(await chatService.createConversation(req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function deleteConversation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    await chatService.deleteConversation(req.user.id, String(req.params.id ?? ''))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await chatService.getMessages(req.user.id, String(req.params.id ?? '')))
  } catch (err) {
    next(err)
  }
}

export async function history(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    res.json(await chatService.getHistory(req.user.id))
  } catch (err) {
    next(err)
  }
}

export async function send(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized')
    const { message, conversationId } = req.body as {
      message: string
      conversationId: string
    }
    res.json(await chatService.sendMessage(req.user.id, conversationId, message))
  } catch (err) {
    next(err)
  }
}
