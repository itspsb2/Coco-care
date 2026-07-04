import { getPool } from '../db/pool.js'

export interface KnowledgeChunk {
  id: string
  documentId: string
  content: string
  score: number
  sourceTitle?: string
  category?: string
  slug?: string
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
  sourceUrl?: string | null
}

export interface KnowledgeArticle {
  id: string
  title: string
  source: string
  content: string
  sourceUrl?: string | null
}

export async function findDocumentByTitle(title: string): Promise<{ id: string } | null> {
  const { rows } = await getPool().query<{ id: string }>(
    'SELECT id FROM knowledge_documents WHERE title = $1 LIMIT 1',
    [title],
  )
  return rows[0] ?? null
}

export async function findDocumentById(id: string): Promise<KnowledgeDocumentMeta | null> {
  const { rows } = await getPool().query<{
    id: string
    title: string
    source: string
    source_url: string | null
  }>('SELECT id, title, source, source_url FROM knowledge_documents WHERE id = $1 LIMIT 1', [id])
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    sourceUrl: row.source_url,
  }
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
    sourceUrl: doc.sourceUrl,
    content: rows.map((r) => r.content).join('\n\n'),
  }
}

export async function getDocumentArticleByTitle(title: string): Promise<KnowledgeArticle | null> {
  const { rows } = await getPool().query<{
    id: string
    title: string
    source: string
    source_url: string | null
  }>(
    'SELECT id, title, source, source_url FROM knowledge_documents WHERE title = $1 LIMIT 1',
    [title.trim()],
  )
  const row = rows[0]
  if (!row) return null
  return getDocumentArticleById(row.id)
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

function metaFields(metadata: unknown): { category?: string; slug?: string } {
  if (!metadata || typeof metadata !== 'object') return {}
  const m = metadata as Record<string, unknown>
  return {
    category: typeof m.category === 'string' ? m.category : undefined,
    slug: typeof m.slug === 'string' ? m.slug : undefined,
  }
}

export async function vectorSearch(
  embedding: number[],
  limit: number,
): Promise<KnowledgeChunk[]> {
  const { rows } = await getPool().query<{
    id: string
    document_id: string
    content: string
    embedding: number[] | string
    metadata: unknown
    title: string
  }>(
    `SELECT kc.id, kc.document_id, kc.content, kc.embedding, kc.metadata, kd.title
     FROM knowledge_chunks kc
     JOIN knowledge_documents kd ON kd.id = kc.document_id`,
  )

  return rows
    .map((r) => {
      const emb = Array.isArray(r.embedding)
        ? r.embedding
        : (typeof r.embedding === 'string' ? JSON.parse(r.embedding) : [])
      const meta =
        typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
      const { category, slug } = metaFields(meta)
      return {
        id: r.id,
        documentId: r.document_id,
        content: r.content,
        score: cosineSimilarity(embedding, emb as number[]),
        sourceTitle: r.title,
        category,
        slug,
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

export async function countDocuments(): Promise<number> {
  const { rows } = await getPool().query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM knowledge_documents',
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
    metadata: unknown
    title: string
  }>(
    `SELECT kc.id, kc.document_id, kc.content, kc.metadata, kd.title
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
    const meta =
      typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
    const { category, slug } = metaFields(meta)
    const lower = `${r.content} ${r.title} ${category ?? ''}`.toLowerCase()
    const hits = terms.filter((t) => lower.includes(t)).length
    results.push({
      id: r.id,
      documentId: r.document_id,
      content: r.content,
      score: 0.5 + hits * 0.1,
      sourceTitle: r.title,
      category,
      slug,
    })
    if (results.length >= limit) break
  }

  return results.sort((a, b) => b.score - a.score)
}
