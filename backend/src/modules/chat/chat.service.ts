import type { ChatMessage, ChatConversation } from '../../types/index.js'
import * as chatRepo from '../../repositories/chat.repository.js'
import * as knowledgeRepo from '../../repositories/knowledge.repository.js'
import { encodeQueryStrict, extractAnswer, isBertReady } from '../../services/bertNlp.service.js'
import { expandQueryTerms } from '../../services/ragGlossary.js'
import { env } from '../../config/env.js'
import { serviceUnavailable, notFound } from '../../utils/errors.js'

const CONTEXT_TURNS = 6

function buildContextualQuery(history: ChatMessage[], current: string): string {
  const prior = history
    .slice(-CONTEXT_TURNS)
    .map((m) => {
      const text = m.content.includes('\n\nSource:')
        ? m.content.slice(0, m.content.lastIndexOf('\n\nSource:'))
        : m.content
      return `${m.role}: ${text.trim()}`
    })
    .join('\n')

  return prior
    ? `Conversation so far:\n${prior}\n\nCurrent question: ${current}`
    : current
}

function glossaryTextFromHistory(history: ChatMessage[], current: string): string {
  const priorUser = history
    .filter((m) => m.role === 'user')
    .slice(-CONTEXT_TURNS)
    .map((m) => m.content)
    .join(' ')
  return `${priorUser} ${current}`.trim()
}

function rankChunks(
  message: string,
  chunks: Awaited<ReturnType<typeof knowledgeRepo.vectorSearch>>,
) {
  const terms = expandQueryTerms(message)
  return chunks
    .map((chunk) => {
      const lower = `${chunk.content} ${chunk.sourceTitle ?? ''}`.toLowerCase()
      const keywordBoost = terms.reduce((sum, term) => sum + (lower.includes(term) ? 0.08 : 0), 0)
      return { ...chunk, score: chunk.score + keywordBoost }
    })
    .sort((a, b) => b.score - a.score)
}

function isAppError(err: unknown): err is Error & { status: number } {
  return err instanceof Error && typeof (err as Error & { status?: number }).status === 'number'
}

async function requireConversation(userId: string, conversationId: string) {
  const conversation = await chatRepo.findConversationForUser(userId, conversationId)
  if (!conversation) throw notFound('Conversation not found')
  return conversation
}

export async function listConversations(userId: string): Promise<ChatConversation[]> {
  const list = await chatRepo.listConversations(userId)
  if (list.length === 0) {
    const created = await chatRepo.createConversation(userId)
    return [created]
  }
  return list
}

export async function createConversation(userId: string): Promise<ChatConversation> {
  return chatRepo.createConversation(userId)
}

export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  const deleted = await chatRepo.deleteConversation(userId, conversationId)
  if (!deleted) throw notFound('Conversation not found')
}

export async function getMessages(
  userId: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  await requireConversation(userId, conversationId)
  return chatRepo.findMessagesByConversationId(userId, conversationId)
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  message: string,
): Promise<ChatMessage> {
  await requireConversation(userId, conversationId)

  const userCountBefore = await chatRepo.countUserMessages(conversationId)
  await chatRepo.createMessage(userId, conversationId, 'user', message)

  if (userCountBefore === 0) {
    await chatRepo.setConversationTitleIfDefault(conversationId, message)
  }

  try {
    if (env.bertRequired && !isBertReady()) {
      await encodeQueryStrict('warmup')
    }

    const history = await chatRepo.findMessagesByConversationId(userId, conversationId)
    const contextualQuery = buildContextualQuery(history, message)
    const glossaryText = glossaryTextFromHistory(history, message)

    const embedding = await encodeQueryStrict(contextualQuery)
    const chunks = await knowledgeRepo.vectorSearch(embedding, env.ragTopK * 2)
    const ranked = rankChunks(glossaryText, chunks)
    let relevant = ranked.filter((c) => c.score >= env.ragMinScore).slice(0, env.ragTopK)

    if (relevant.length === 0) {
      const keywordHits = await knowledgeRepo.keywordSearch(
        expandQueryTerms(glossaryText),
        env.ragTopK,
      )
      relevant = keywordHits
    }

    const reply =
      relevant.length > 0
        ? extractAnswer(contextualQuery, relevant)
        : 'I could not find verified guidance. Please contact your agriculture officer.'

    if (relevant[0]) {
      console.log(
        `RAG reply source: document=${relevant[0].documentId} score=${relevant[0].score.toFixed(3)} bert=true conversation=${conversationId}`,
      )
    }

    return chatRepo.createMessage(userId, conversationId, 'assistant', reply)
  } catch (err) {
    console.error('Chat RAG error:', err)
    if (isAppError(err)) throw err
    throw serviceUnavailable('Knowledge assistant is temporarily unavailable. Please try again.')
  }
}

/** @deprecated Prefer conversation-scoped APIs */
export async function getHistory(userId: string): Promise<ChatMessage[]> {
  const conversations = await listConversations(userId)
  return chatRepo.findMessagesByConversationId(userId, conversations[0].id)
}
