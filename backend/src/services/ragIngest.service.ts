import { readFile, readdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { env } from '../config/env.js'
import * as knowledgeRepo from '../repositories/knowledge.repository.js'
import { encodeQueryStrict, warmupBert } from './bertNlp.service.js'

function chunkText(text: string, size = 600): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

export function titleFromFilename(filename: string): string {
  const base = basename(filename).replace(/\.(md|txt)$/i, '')
  return base
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r\n/g, '\n')
    .trim()
}

async function collectKnowledgeFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectKnowledgeFiles(fullPath)))
    } else if (
      entry.isFile() &&
      /\.(md|txt)$/i.test(entry.name) &&
      entry.name.toLowerCase() !== 'readme.md'
    ) {
      files.push(fullPath)
    }
  }

  return files
}

export async function ingestDocument(
  title: string,
  source: string,
  content: string,
  sourceUrl?: string,
): Promise<boolean> {
  const existing = await knowledgeRepo.findDocumentByTitle(title)
  if (existing) {
    console.log(`Skipping (already exists): ${title}`)
    return false
  }

  const docId = await knowledgeRepo.createDocument(title, source, sourceUrl)
  const plain = stripMarkdown(content)
  const chunks = chunkText(plain)

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await encodeQueryStrict(chunks[i])
    await knowledgeRepo.insertChunk({
      documentId: docId,
      chunkIndex: i,
      content: chunks[i],
      embedding,
      metadata: {
        title,
        source,
        model: env.bertModelName,
        lang: 'en',
      },
    })
  }

  console.log(`Ingested: ${title} (${chunks.length} chunks)`)
  return true
}

export async function ingestMockKnowledge(): Promise<void> {
  const mockDir = join(env.knowledgeDataDir, 'mock')
  await ingestFromDirectory(mockDir, 'CRI Manual (Mock)')
}

export async function ingestFromDirectory(
  dir = env.knowledgeDataDir,
  source = 'CRI Advisory Circular',
): Promise<void> {
  await warmupBert()

  const files = await collectKnowledgeFiles(dir)
  if (files.length === 0) {
    console.warn(`No .md or .txt files found in ${dir}`)
    return
  }

  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf-8')
    const title = titleFromFilename(filePath)
    await ingestDocument(title, source, raw)
  }
}
