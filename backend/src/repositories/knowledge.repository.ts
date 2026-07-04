import { getPool } from '../db/pool.js'

export interface KnowledgeChunk {
  id: string
  documentId: string
  content: string
  score: number
  sourceTitle?: string
}

export interface CreateKnowledgeChunkInput {
  documentId: string
  chunkIndex: number
  content: string
  embedding: number[]
  metadata?: Record<string, unknown>
}

export async function createDocument(
  title: string,
  source: string,
  sourceUrl?: string,
): Promise<string> {
  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO knowledge_documents (title, source, source_url)
     VALUES ($1, $2, $3) RETURNING id`,
    [title, source, sourceUrl ?? null],
  )
  return rows[0].id
}

export interface KnowledgeDocumentMeta {
  id: string
  title: string
  source: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  source: string
  content: string
}

export async function findDocumentByTitle(title: string): Promise<{ id: string } | null> {
  const { rows } = await getPool().query<{ id: string }>(
    'SELECT id FROM knowledge_documents WHERE title = $1 LIMIT 1',
    [title],
  )
  return rows[0] ?? null
}

export async function findDocumentById(id: string): Promise<KnowledgeDocumentMeta | null> {
  const { rows } = await getPool().query<KnowledgeDocumentMeta>(
    'SELECT id, title, source FROM knowledge_documents WHERE id = $1 LIMIT 1',
    [id],
  )
  return rows[0] ?? null
}

export async function getDocumentArticleById(id: string): Promise<KnowledgeArticle | null> {
  const doc = await findDocumentById(id)
  if (!doc) return null

  const { rows } = await getPool().query<{ content: string }>(
    `SELECT content FROM knowledge_chunks
     WHERE document_id = $1
     ORDER BY chunk_index`,
    [id],
  )

  return {
    id: doc.id,
    title: doc.title,
    source: doc.source,
    content: rows.map((r) => r.content).join('\n\n'),
  }
}

export async function getDocumentArticleByTitle(title: string): Promise<KnowledgeArticle | null> {
  const { rows } = await getPool().query<KnowledgeDocumentMeta>(
    'SELECT id, title, source FROM knowledge_documents WHERE title = $1 LIMIT 1',
    [title.trim()],
  )
  const doc = rows[0]
  if (!doc) return null
  return getDocumentArticleById(doc.id)
}

export async function clearAllKnowledge(): Promise<void> {
  await getPool().query('TRUNCATE knowledge_chunks, knowledge_documents RESTART IDENTITY CASCADE')
}

export async function insertChunk(input: CreateKnowledgeChunkInput): Promise<void> {
  await getPool().query(
    `INSERT INTO knowledge_chunks (document_id, chunk_index, content, embedding, metadata)
     VALUES ($1, $2, $3, $4::jsonb, $5)`,
    [
      input.documentId,
      input.chunkIndex,
      input.content,
      JSON.stringify(input.embedding),
      JSON.stringify(input.metadata ?? {}),
    ],
  )
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

export async function vectorSearch(
  embedding: number[],
  limit: number,
): Promise<KnowledgeChunk[]> {
  const { rows } = await getPool().query<{
    id: string
    document_id: string
    content: string
    embedding: number[]
    title: string
  }>(
    `SELECT kc.id, kc.document_id, kc.content, kc.embedding, kd.title
     FROM knowledge_chunks kc
     JOIN knowledge_documents kd ON kd.id = kc.document_id`,
  )

  return rows
    .map((r) => {
      const emb = Array.isArray(r.embedding)
        ? r.embedding
        : (typeof r.embedding === 'string' ? JSON.parse(r.embedding) : [])
      return {
        id: r.id,
        documentId: r.document_id,
        content: r.content,
        score: cosineSimilarity(embedding, emb as number[]),
        sourceTitle: r.title,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export async function countChunks(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM knowledge_chunks',
  )
  return Number(rows[0]?.count ?? 0)
}

export async function keywordSearch(terms: string[], limit: number): Promise<KnowledgeChunk[]> {
  if (terms.length === 0) return []

  const conditions = terms.map((_, i) => `(kc.content ILIKE $${i + 1} OR kd.title ILIKE $${i + 1})`)
  const patterns = terms.map((t) => `%${t}%`)

  const { rows } = await getPool().query<{
    id: string
    document_id: string
    content: string
    title: string
  }>(
    `SELECT kc.id, kc.document_id, kc.content, kd.title
     FROM knowledge_chunks kc
     JOIN knowledge_documents kd ON kd.id = kc.document_id
     WHERE ${conditions.join(' OR ')}
     LIMIT $${terms.length + 1}`,
    [...patterns, limit * 3],
  )

  const seen = new Set<string>()
  const results: KnowledgeChunk[] = []

  for (const r of rows) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    const lower = `${r.content} ${r.title}`.toLowerCase()
    const hits = terms.filter((t) => lower.includes(t)).length
    results.push({
      id: r.id,
      documentId: r.document_id,
      content: r.content,
      score: 0.5 + hits * 0.1,
      sourceTitle: r.title,
    })
    if (results.length >= limit) break
  }

  return results.sort((a, b) => b.score - a.score)
}
