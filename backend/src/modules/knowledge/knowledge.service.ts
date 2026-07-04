import * as knowledgeRepo from '../../repositories/knowledge.repository.js'
import type { KnowledgeArticle } from '../../repositories/knowledge.repository.js'
import { notFound, badRequest } from '../../utils/errors.js'

export async function getArticleByTitle(title: string): Promise<KnowledgeArticle> {
  const trimmed = title?.trim()
  if (!trimmed) throw badRequest('title query parameter is required')

  const article = await knowledgeRepo.getDocumentArticleByTitle(trimmed)
  if (!article) throw notFound('Knowledge document not found')
  return article
}

export async function getArticleById(id: string): Promise<KnowledgeArticle> {
  if (!id?.trim()) throw badRequest('document id is required')

  const article = await knowledgeRepo.getDocumentArticleById(id.trim())
  if (!article) throw notFound('Knowledge document not found')
  return article
}
