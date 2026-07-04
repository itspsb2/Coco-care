import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const SOURCE = join(ROOT, 'Rag data.md')
const OUTPUT_DIR = join(__dirname, '..', 'data', 'cri-manuals', 'cri')

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function titleFromHeading(heading: string): string {
  const fileMatch = heading.match(/^File:\s*(\S+)/i)
  if (fileMatch) {
    const sub = heading.match(/###\s+(.+)/)
    return sub?.[1]?.trim() ?? fileMatch[1].replace('.pdf', '')
  }

  const bracketMatch = heading.match(/^\[File:\s*[^\]]+\]\s*-\s*(.+)/i)
  if (bracketMatch) return bracketMatch[1].trim()

  const codeMatch = heading.match(/^([A-Z]\d+):\s*(.+)/)
  if (codeMatch) return `${codeMatch[1]}: ${codeMatch[2].trim()}`

  return heading.trim()
}

function filenameFromHeading(heading: string, index: number): string {
  const fileMatch = heading.match(/File:\s*([a-z0-9]+\.pdf)/i)
  if (fileMatch) return fileMatch[1].replace('.pdf', '.md')

  const bracketMatch = heading.match(/\[File:\s*([^\]]+)\]/i)
  if (bracketMatch) {
    return bracketMatch[1].replace('.pdf', '').trim() + '.md'
  }

  const codeMatch = heading.match(/^([A-Z]\d+):/i)
  if (codeMatch) return `${codeMatch[1].toLowerCase()}.md`

  const slug = slugify(heading)
  return slug ? `${slug}.md` : `section-${String(index).padStart(3, '0')}.md`
}

async function main() {
  const raw = await readFile(SOURCE, 'utf-8')
  const parts = raw.split(/\n(?=## )/)

  await mkdir(OUTPUT_DIR, { recursive: true })

  let written = 0
  const usedNames = new Set<string>()

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (!part.startsWith('## ')) continue

    const firstLineEnd = part.indexOf('\n')
    const headingLine = firstLineEnd === -1 ? part : part.slice(0, firstLineEnd)
    const heading = headingLine.replace(/^##\s+/, '').trim()

    if (/table of contents/i.test(heading)) continue

    const body = (firstLineEnd === -1 ? '' : part.slice(firstLineEnd + 1)).trim()
    if (body.length < 80) continue

    const title = titleFromHeading(heading)
    let filename = filenameFromHeading(heading, i)

    if (usedNames.has(filename)) {
      filename = filename.replace('.md', `-${i}.md`)
    }
    usedNames.add(filename)

    const content = `# ${title}\n\n${body}\n`
    await writeFile(join(OUTPUT_DIR, filename), content, 'utf-8')
    written++
  }

  console.log(`Prepared ${written} CRI manual files in ${OUTPUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
