import { readFile, readdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { env } from '../config/env.js'
import * as knowledgeRepo from '../repositories/knowledge.repository.js'
import { embedText, warmupGeminiEmbedding } from './geminiEmbedding.service.js'

export interface DocFrontmatter {
  title?: string
  slug?: string
  sourceId?: string
  category?: string
  pdf?: string
  officialTitle?: string
}

const MAX_CHUNK_CHARS = 1_000

export function titleFromFilename(filename: string): string {
  const base = basename(filename).replace(/\.(md|txt)$/i, '')
  return base
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Light cleanup for embeddings — keep table pipes and structure. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r\n/g, '\n')
    .trim()
}

/** Parse optional YAML-like frontmatter between --- fences. */
export function parseFrontmatter(raw: string): { meta: DocFrontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta: DocFrontmatter = {}
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    let value = line.slice(colon + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key === 'title') meta.title = value
    else if (key === 'slug') meta.slug = value
    else if (key === 'sourceId') meta.sourceId = value
    else if (key === 'category') meta.category = value
    else if (key === 'pdf') meta.pdf = value
    else if (key === 'officialTitle') meta.officialTitle = value
  }

  return { meta, body: match[2] }
}

interface SectionBlock {
  heading: string
  body: string
}

/** Split body into sections on ##### / ###### headings; preserve tables. */
function splitSections(body: string): SectionBlock[] {
  const lines = body.split(/\r?\n/)
  const sections: SectionBlock[] = []
  let heading = ''
  let buf: string[] = []

  const flush = () => {
    const text = buf.join('\n').trim()
    if (text.length > 0) sections.push({ heading, body: text })
    buf = []
  }

  for (const line of lines) {
    const h = line.match(/^#{3,6}\s+(.+)$/)
    // Treat ### Details / Official CRI Source as metadata wrappers, not intent sections
    if (h && !/^#{1,2}\s/.test(line)) {
      const level = line.match(/^(#{3,6})\s/)?.[1].length ?? 3
      const name = h[1].trim()
      // Split on ##### / ###### intent headings, and on **Table N:** style bold lines
      if (level >= 5) {
        flush()
        heading = name
        continue
      }
      // Skip Official CRI Source / Details wrappers — keep content under current heading
      if (/^(official cri source|details)$/i.test(name)) {
        continue
      }
    }

    // Bold table titles like **Table 1: ...** become their own section
    const tableTitle = line.match(/^\*\*(Table\s+\d+:[^*]+)\*\*\s*$/i)
    if (tableTitle) {
      flush()
      heading = tableTitle[1].trim()
      continue
    }

    buf.push(line)
  }
  flush()
  return sections
}

/** Extract contiguous markdown tables as standalone blocks with their heading. */
function expandTables(sections: SectionBlock[]): SectionBlock[] {
  const out: SectionBlock[] = []

  for (const section of sections) {
    const lines = section.body.split('\n')
    let i = 0
    let prose: string[] = []

    const flushProse = () => {
      const text = prose.join('\n').trim()
      if (text) out.push({ heading: section.heading, body: text })
      prose = []
    }

    while (i < lines.length) {
      const line = lines[i]
      const isTableRow = /^\s*\|.+\|\s*$/.test(line)
      if (isTableRow) {
        flushProse()
        const tableLines: string[] = []
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          tableLines.push(lines[i])
          i++
        }
        out.push({
          heading: section.heading || 'Table',
          body: tableLines.join('\n'),
        })
        continue
      }
      prose.push(line)
      i++
    }
    flushProse()
  }

  return out
}

function splitAtSentence(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const parts: string[] = []
  let remaining = text
  while (remaining.length > maxChars) {
    const window = remaining.slice(0, maxChars)
    const breakAt = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('.\n'),
      window.lastIndexOf('\n'),
    )
    const cut = breakAt > maxChars * 0.4 ? breakAt + 1 : maxChars
    parts.push(remaining.slice(0, cut).trim())
    remaining = remaining.slice(cut).trim()
  }
  if (remaining) parts.push(remaining)
  return parts
}

function prefixChunk(title: string, heading: string, body: string): string {
  const label = heading ? `${title} — ${heading}` : title
  return `${label}\n\n${body}`.trim()
}

/**
 * Intent-aware chunking:
 * - pest topics → Symptoms / Control / Prevention / Application as separate chunks
 * - seedling fertilizer → one chunk per manure table + radius/method
 * - tables never split mid-row
 */
export function chunkDocument(title: string, markdownBody: string): string[] {
  // Drop leading # title line if present (already in frontmatter title)
  const body = markdownBody.replace(/^#\s+.+\n+/, '').trim()
  let sections = splitSections(body)
  sections = expandTables(sections)

  // Merge tiny prose blocks under the same heading (not tables)
  const merged: SectionBlock[] = []
  for (const section of sections) {
    const isTable = /^\s*\|/.test(section.body)
    const prev = merged[merged.length - 1]
    if (
      !isTable &&
      prev &&
      prev.heading === section.heading &&
      !/^\s*\|/.test(prev.body) &&
      prev.body.length + section.body.length + 2 <= MAX_CHUNK_CHARS
    ) {
      prev.body = `${prev.body}\n\n${section.body}`
    } else {
      merged.push({ ...section })
    }
  }

  const chunks: string[] = []
  for (const section of merged) {
    const isTable = /^\s*\|/.test(section.body)
    if (isTable || section.body.length <= MAX_CHUNK_CHARS) {
      chunks.push(prefixChunk(title, section.heading, section.body))
      continue
    }
    for (const part of splitAtSentence(section.body, MAX_CHUNK_CHARS)) {
      chunks.push(prefixChunk(title, section.heading, part))
    }
  }

  // Fallback: whole body as one chunk if nothing was produced
  if (chunks.length === 0 && body.length > 0) {
    chunks.push(prefixChunk(title, '', body.slice(0, MAX_CHUNK_CHARS)))
  }

  return chunks.map((c) => stripMarkdown(c))
}

async function collectKnowledgeFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      // Prefer cri/ topics only; skip mock/ and other folders when walking root
      if (entry.name.toLowerCase() === 'mock') continue
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
  options?: {
    sourceUrl?: string
    slug?: string
    sourceId?: string
    category?: string
  },
): Promise<boolean> {
  const existing = await knowledgeRepo.findDocumentByTitle(title)
  if (existing) {
    console.log(`Skipping (already exists): ${title}`)
    return false
  }

  const docId = await knowledgeRepo.createDocument(title, source, options?.sourceUrl)
  const chunks = chunkDocument(title, content)

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i], { ingest: true })
    await knowledgeRepo.insertChunk({
      documentId: docId,
      chunkIndex: i,
      content: chunks[i],
      embedding,
      metadata: {
        title,
        source,
        model: env.geminiEmbeddingModel,
        lang: 'en',
        slug: options?.slug,
        sourceId: options?.sourceId,
        category: options?.category,
      },
    })
  }

  console.log(`Ingested: ${title} (${chunks.length} chunks)`)
  return true
}

export async function ingestMockKnowledge(): Promise<void> {
  // Mock data is no longer used; always ingest prepared cri/ topics.
  await ingestFromDirectory(join(env.knowledgeDataDir, 'cri'), 'CRI Advisory Circular')
}

export async function ingestFromDirectory(
  dir = join(env.knowledgeDataDir, 'cri'),
  source = 'CRI Advisory Circular',
): Promise<void> {
  await warmupGeminiEmbedding()

  const files = await collectKnowledgeFiles(dir)
  if (files.length === 0) {
    console.warn(`No .md or .txt files found in ${dir}`)
    return
  }

  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf-8')
    const { meta, body } = parseFrontmatter(raw)
    const title = meta.title ?? titleFromFilename(filePath)
    await ingestDocument(title, source, body, {
      sourceUrl: meta.pdf,
      slug: meta.slug,
      sourceId: meta.sourceId,
      category: meta.category,
    })
  }
}
