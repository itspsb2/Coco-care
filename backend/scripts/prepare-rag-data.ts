import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const OUTPUT_DIR = join(__dirname, '..', 'data', 'cri-manuals', 'cri')

const SOURCES = [
  join(ROOT, 'fertilizer.md'),
  join(ROOT, 'leda 5.md'),
]

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function extractMeta(block: string): {
  sourceId?: string
  category?: string
  pdf?: string
  officialTitle?: string
} {
  const sourceId = block.match(/-\s*Source ID:\s*(.+)/i)?.[1]?.trim()
  const category = block.match(/-\s*Category:\s*(.+)/i)?.[1]?.trim()
  const officialTitle = block.match(/-\s*Title:\s*(.+)/i)?.[1]?.trim()
  const pdfLine = block.match(/-\s*PDF:\s*(.+)/i)?.[1]?.trim()
  const pdf = pdfLine?.match(/https?:\/\/\S+/i)?.[0]
  return { sourceId, category, pdf, officialTitle }
}

/** Remove non-advisory noise that must never enter embeddings. */
function cleanBlock(raw: string): string {
  let text = raw
  text = text.replace(/<!--\s*CHUNK_(?:START|END):\s*[\w-]+\s*-->/gi, '')
  text = text.replace(/^---\s*$/gm, '')
  // Drop "Note on Source Files" and everything after it
  text = text.replace(/\*\*Note on Source Files:\*\*[\s\S]*$/i, '')
  // Drop standalone CRI contact / technical inquiry blocks (kept once elsewhere if needed)
  text = text.replace(
    /\*\*For Technical Information Inquiries:\*\*[\s\S]*?(?=(\n## |\n##### |\n*$))/i,
    '',
  )
  text = text.replace(/Coconut Research Institute of Sri Lanka[\s\S]*?cri\.gov\.lk\s*/gi, '')
  text = text.replace(/\n{3,}/g, '\n\n').trim()
  return text
}

function splitByH2(markdown: string): Array<{ title: string; body: string }> {
  const sections: Array<{ title: string; body: string }> = []
  const lines = markdown.split(/\r?\n/)
  let title: string | null = null
  let buf: string[] = []

  const flush = () => {
    if (!title) return
    const body = cleanBlock(buf.join('\n'))
    if (body.length >= 40) sections.push({ title, body })
    title = null
    buf = []
  }

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) {
      flush()
      title = h2[1].trim()
      continue
    }
    if (title) buf.push(line)
  }
  flush()
  return sections
}

async function clearOutputDir() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const entries = await readdir(OUTPUT_DIR, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isFile() && /\.(md|txt)$/i.test(entry.name)) {
      await unlink(join(OUTPUT_DIR, entry.name))
    }
  }
}

async function main() {
  await clearOutputDir()
  const usedSlugs = new Set<string>()
  let written = 0
  let contactKept = false

  for (const sourcePath of SOURCES) {
    const raw = await readFile(sourcePath, 'utf-8')
    const sections = splitByH2(raw)

    for (const section of sections) {
      const meta = extractMeta(section.body)
      const title = meta.officialTitle ?? section.title
      let slug = slugify(title)
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${meta.sourceId?.toLowerCase() ?? written}`
      }
      usedSlugs.add(slug)

      let body = section.body
      // Keep CRI contact details only once (on adult fertilizer topic)
      if (!contactKept && /adult coconut/i.test(title)) {
        body = `${body}\n\nFor technical information inquiries contact the Coconut Research Institute of Sri Lanka, Technology Transfer Division (cri.gov.lk).\n`
        contactKept = true
      }

      const category =
        meta.category ??
        (/pest|disease|wilt|rot|beetle|weevil|caterpillar|miner/i.test(title)
          ? 'Pests & Diseases'
          : 'General Coconut Cultivation')

      const frontmatter = [
        '---',
        `title: ${JSON.stringify(title)}`,
        `slug: ${slug}`,
        meta.sourceId ? `sourceId: ${meta.sourceId}` : `sourceId: ${slug.toUpperCase().slice(0, 12)}`,
        `category: ${JSON.stringify(category)}`,
        meta.pdf ? `pdf: ${meta.pdf}` : null,
        meta.officialTitle ? `officialTitle: ${JSON.stringify(meta.officialTitle)}` : null,
        '---',
        '',
      ]
        .filter((line) => line !== null)
        .join('\n')

      const content = `${frontmatter}# ${title}\n\n${body}\n`
      await writeFile(join(OUTPUT_DIR, `${slug}.md`), content, 'utf-8')
      written++
      console.log(`  + ${slug}.md`)
    }
  }

  console.log(`Prepared ${written} topic files from fertilizer.md + leda 5.md in ${OUTPUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
