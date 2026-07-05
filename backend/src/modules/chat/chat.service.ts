import type { ChatMessage, ChatConversation } from '../../types/index.js'
import * as chatRepo from '../../repositories/chat.repository.js'
import * as knowledgeRepo from '../../repositories/knowledge.repository.js'
import { extractAnswer } from '../../services/bertNlp.service.js'
import { embedText } from '../../services/geminiEmbedding.service.js'
import { generateGroundedAnswer, isGroqConfigured } from '../../services/groq.service.js'
import { expandQueryTerms } from '../../services/ragGlossary.js'
import { env } from '../../config/env.js'
import { serviceUnavailable, notFound } from '../../utils/errors.js'

const OFFICER_FALLBACK =
  'I could not find verified guidance. Please contact your agriculture officer.'

const CONTEXT_TURNS = 6
/** Keyword fallback may surface below vector min score (sparse table queries). */
const KEYWORD_FALLBACK_MIN_SCORE = 0.35

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

function rankChunks(
  message: string,
  chunks: Awaited<ReturnType<typeof knowledgeRepo.vectorSearch>>,
) {
  const terms = expandQueryTerms(message)
  return chunks
    .map((chunk) => {
      const contentLower = chunk.content.toLowerCase()
      const titleLower = (chunk.sourceTitle ?? '').toLowerCase()
      const categoryLower = (chunk.category ?? '').toLowerCase()

      const contentBoost = terms.reduce(
        (sum, term) => sum + (contentLower.includes(term) ? 0.06 : 0),
        0,
      )
      // Stronger boost when query terms match the document title or category
      const titleBoost = terms.reduce(
        (sum, term) => sum + (titleLower.includes(term) ? 0.14 : 0),
        0,
      )
      const categoryBoost = terms.reduce(
        (sum, term) => sum + (categoryLower.includes(term) ? 0.1 : 0),
        0,
      )

      return {
        ...chunk,
        score: chunk.score + contentBoost + titleBoost + categoryBoost,
      }
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
    const history = await chatRepo.findMessagesByConversationId(userId, conversationId)
    const contextualQuery = buildContextualQuery(history, message)

    const embedding = await embedText(contextualQuery)
    const chunks = await knowledgeRepo.vectorSearch(embedding, env.ragTopK * 2)
    // Rank/boost using the current question only so prior turns do not pull wrong topics
    const ranked = rankChunks(message, chunks)
    let relevant = ranked.filter((c) => c.score >= env.ragMinScore).slice(0, env.ragTopK)

    if (relevant.length === 0) {
      const keywordHits = await knowledgeRepo.keywordSearch(
        expandQueryTerms(message),
        env.ragTopK,
      )
      relevant = keywordHits.filter((c) => c.score >= KEYWORD_FALLBACK_MIN_SCORE)
    }

    let reply: string
    let groqUsed = false

    if (relevant.length === 0) {
      reply = OFFICER_FALLBACK
    } else if (isGroqConfigured()) {
      try {
        const historyForPrompt = history
          .slice(-CONTEXT_TURNS, -1)
          .map((m) => {
            const text = m.content.includes('\n\nSource:')
              ? m.content.slice(0, m.content.lastIndexOf('\n\nSource:'))
              : m.content
            return `${m.role}: ${text.trim()}`
          })
          .join('\n')

        const generated = await generateGroundedAnswer({
          question: message,
          conversationSnippet: historyForPrompt || undefined,
          chunks: relevant,
        })
        const sourceTitle = relevant[0].sourceTitle
        reply = sourceTitle ? `${generated}\n\nSource: ${sourceTitle}` : generated
        groqUsed = true
      } catch (groqErr) {
        console.warn('Groq generation failed, using extractAnswer fallback:', groqErr)
        reply = extractAnswer(contextualQuery, relevant)
      }
    } else {
      reply = extractAnswer(contextualQuery, relevant)
    }

    // RAG safety: log document_id + score for every chunk used
    if (relevant.length > 0) {
      const evidence = relevant
        .map(
          (c) =>
            `${c.slug ?? c.documentId}:${c.score.toFixed(3)}`,
        )
        .join(', ')
      console.log(
        `RAG reply evidence: [${evidence}] geminiEmbed=true groq=${groqUsed} conversation=${conversationId}`,
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
