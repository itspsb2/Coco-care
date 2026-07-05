function sectionBetween(text: string, startLabel: string, endLabels: string[]): string | null {
  const startRe = new RegExp(`(?:###?\\s*)?${startLabel}\\s*\\n([\\s\\S]*?)(?=${endLabels.map((l) => `(?:###?\\s*)?${l}\\b`).join('|')}|$)`, 'i')
  const match = text.match(startRe)
  return match?.[1]?.trim() || null
}

function wantsDetailedAnswer(query: string): boolean {
  return /\b(dosage|dose|amount|kg|grams?|ml|steps?|how to apply|schedule|timing|rate|mixture|recommendation|guideline|procedure|method)\b/i.test(
    query,
  )
}

function wantsSourceLink(query: string): boolean {
  return /\b(source|pdf|circular|reference|official (cri )?document)\b/i.test(query)
}

function cleanAnswerBody(text: string, maxLen: number): string {
  let body = text
    .replace(/Source ID:\s*\S+/gi, '')
    .replace(/PDF:\s*https?:\/\/\S+/gi, '')
    .replace(/\b[ABC]\d+\b\.pdf/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (body.length > maxLen) {
    body = body.slice(0, maxLen - 3).trimEnd() + '...'
  }
  return body
}

export function extractAnswer(
  query: string,
  chunks: Array<{ content: string; sourceTitle?: string; score: number }>,
): string {
  if (chunks.length === 0) {
    return 'I could not find verified guidance. Please contact your agriculture officer.'
  }

  const top = chunks[0]
  const combined = chunks
    .slice(0, 3)
    .map((c) => c.content)
    .join('\n\n')

  const directAnswer =
    sectionBetween(combined, 'Direct Answer', [
      'Related Topics',
      'Use When User Asks About',
      'Details',
      'Official CRI Source',
      'Questions This Section',
      'Retrieval Keywords',
    ]) ??
    sectionBetween(top.content, 'Direct Answer', [
      'Related Topics',
      'Use When User Asks About',
      'Details',
    ])

  const details =
    sectionBetween(combined, 'Details', [
      'Related Topics',
      'Official CRI Source',
      'CHUNK_END',
    ]) ?? sectionBetween(top.content, 'Details', ['Related Topics'])

  let body: string

  if (wantsDetailedAnswer(query) && details) {
    const detailSentences = details
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 20)
      .slice(0, 4)
    body = [directAnswer, ...detailSentences].filter(Boolean).join(' ')
  } else if (directAnswer) {
    body = directAnswer
  } else {
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const picked = new Set<string>()
    const parts: string[] = []

    for (const chunk of chunks.slice(0, 3)) {
      const sentences = chunk.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20)
      const ranked = sentences
        .map((sentence) => {
          const lower = sentence.toLowerCase()
          const score = queryWords.filter((w) => lower.includes(w)).length
          return { sentence: sentence.trim(), score }
        })
        .sort((a, b) => b.score - a.score)

      const take = ranked.some((r) => r.score > 0)
        ? ranked.filter((r) => r.score > 0).slice(0, 2)
        : ranked.slice(0, 1)

      for (const { sentence } of take) {
        if (!picked.has(sentence)) {
          picked.add(sentence)
          parts.push(sentence)
        }
      }
    }

    body = parts.length > 0 ? parts.join(' ') : top.content.slice(0, 400).trim()
  }

  body = cleanAnswerBody(body, wantsDetailedAnswer(query) ? 700 : 500)

  if (
    /\b(pesticide|insecticide|monocrotophos|fungicide|toxic|chemical)\b/i.test(body) &&
    !/officer|safety|caution|warning/i.test(body)
  ) {
    body +=
      ' Handle chemicals safely and follow Coconut Development Officer / agriculture officer guidance.'
  }

  const source = top.sourceTitle ? `\n\nSource: ${top.sourceTitle}` : ''
  const sourceLink =
    wantsSourceLink(query) && top.sourceTitle
      ? `\nOfficial CRI PDF may be available via the Source article link.`
      : ''

  return `${body}${source}${sourceLink}`
}
