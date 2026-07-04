import type { ChatMessage, ChatConversation } from '../types/index.js'
import { getPool } from '../db/pool.js'

interface ChatRow {
  id: string
  user_id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: Date
}

interface ConversationRow {
  id: string
  user_id: string
  title: string
  created_at: Date
  updated_at: Date
}

const WELCOME =
  'Hello! I am Coco AI. Ask me anything about coconut farming, diseases, or fertilizer.'

function mapMessage(row: ChatRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    conversationId: row.conversation_id,
  }
}

function mapConversation(row: ConversationRow): ChatConversation {
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  }
}

export async function listConversations(userId: string): Promise<ChatConversation[]> {
  const { rows } = await getPool().query<ConversationRow>(
    `SELECT id, user_id, title, created_at, updated_at
     FROM chat_conversations
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId],
  )
  return rows.map(mapConversation)
}

export async function findConversationForUser(
  userId: string,
  conversationId: string,
): Promise<ChatConversation | null> {
  const { rows } = await getPool().query<ConversationRow>(
    `SELECT id, user_id, title, created_at, updated_at
     FROM chat_conversations
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [conversationId, userId],
  )
  return rows[0] ? mapConversation(rows[0]) : null
}

export async function createConversation(
  userId: string,
  title = 'New conversation',
): Promise<ChatConversation> {
  const { rows } = await getPool().query<ConversationRow>(
    `INSERT INTO chat_conversations (user_id, title)
     VALUES ($1, $2)
     RETURNING id, user_id, title, created_at, updated_at`,
    [userId, title],
  )
  const conversation = mapConversation(rows[0])
  await createMessage(userId, conversation.id, 'assistant', WELCOME)
  return conversation
}

export async function deleteConversation(userId: string, conversationId: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2`,
    [conversationId, userId],
  )
  return (rowCount ?? 0) > 0
}

export async function findMessagesByConversationId(
  userId: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  const owned = await findConversationForUser(userId, conversationId)
  if (!owned) return []

  const { rows } = await getPool().query<ChatRow>(
    `SELECT id, user_id, conversation_id, role, content, created_at
     FROM chat_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId],
  )
  return rows.map(mapMessage)
}

export async function createMessage(
  userId: string,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<ChatMessage> {
  const { rows } = await getPool().query<ChatRow>(
    `INSERT INTO chat_messages (user_id, conversation_id, role, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, conversation_id, role, content, created_at`,
    [userId, conversationId, role, content],
  )

  await getPool().query(
    `UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1`,
    [conversationId],
  )

  return mapMessage(rows[0])
}

export async function countUserMessages(conversationId: string): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM chat_messages
     WHERE conversation_id = $1 AND role = 'user'`,
    [conversationId],
  )
  return Number(rows[0]?.count ?? 0)
}

export async function setConversationTitleIfDefault(
  conversationId: string,
  title: string,
): Promise<void> {
  const truncated = title.trim().slice(0, 60) || 'New conversation'
  await getPool().query(
    `UPDATE chat_conversations
     SET title = $2, updated_at = NOW()
     WHERE id = $1 AND title = 'New conversation'`,
    [conversationId, truncated],
  )
}
