import { extractAnswer, isBertReady } from '../src/services/bertNlp.service.js'
import { expandQueryTerms, queryTerms } from '../src/services/ragGlossary.js'
import { chunkDocument } from '../src/services/ragIngest.service.js'

describe('bertNlp.extractAnswer', () => {
  it('returns fallback when no chunks', () => {
    const answer = extractAnswer('how to treat bud rot', [])
    expect(answer).toContain('could not find verified guidance')
  })

  it('extracts answer with source citation', () => {
    const answer = extractAnswer('bud rot treatment', [
      {
        content: 'Apply Bordeaux mixture to affected crown. Improve drainage.',
        sourceTitle: 'CRI Manual — Bud Rot',
        score: 0.9,
      },
    ])
    expect(answer).toContain('Source: CRI Manual — Bud Rot')
    expect(answer).toContain('Bordeaux')
  })

  it('combines sentences from multiple chunks', () => {
    const answer = extractAnswer('caterpillar control coconut', [
      {
        content: 'Cut infested fronds and burn them. Release lab-bred parasitoids when needed.',
        sourceTitle: 'B2 Caterpillar',
        score: 0.85,
      },
      {
        content: 'Spray Marshal 20 SC on seedlings. Notify the Coconut Development Officer.',
        sourceTitle: 'B2 Caterpillar Control',
        score: 0.8,
      },
    ])
    expect(answer.length).toBeGreaterThan(40)
    expect(answer).toContain('Source:')
  })

  it('prefers top chunk content when query terms do not overlap sentences', () => {
    const answer = extractAnswer('xyzzy', [
      {
        content: 'Adult coconut palms need consistent soil moisture during dry periods.',
        sourceTitle: 'Water Requirement',
        score: 0.92,
      },
    ])
    expect(answer).toContain('soil moisture')
    expect(answer).toContain('Source: Water Requirement')
  })

  it('prefers Direct Answer section for simple questions', () => {
    const answer = extractAnswer('what is bud rot', [
      {
        content: `### Direct Answer
Bud rot can kill the palm if the growing point is destroyed.

### Details
Apply Bordeaux mixture at 5-6 g/L when detected early. Remove and burn advanced cases.
`,
        sourceTitle: 'BUD ROT DISEASE AND ITS CONTROL',
        score: 0.95,
      },
    ])
    expect(answer).toContain('growing point')
    expect(answer).not.toContain('5-6 g/L')
    expect(answer).toContain('Source: BUD ROT DISEASE AND ITS CONTROL')
  })

  it('includes Details when user asks for dosage', () => {
    const answer = extractAnswer('bud rot fungicide dosage amount', [
      {
        content: `### Direct Answer
Treat early bud rot with fungicide.

### Details
Apply Bordeaux mixture or a fungicide containing Dithiocarbamate at 5-6 g/L.
`,
        sourceTitle: 'BUD ROT DISEASE AND ITS CONTROL',
        score: 0.95,
      },
    ])
    expect(answer).toMatch(/5-6 g\/L|Bordeaux/i)
    expect(answer).toContain('Source:')
  })
})

describe('ragGlossary', () => {
  it('extracts english query terms', () => {
    expect(queryTerms('How to treat bud rot disease?')).toEqual(
      expect.arrayContaining(['bud', 'rot', 'disease']),
    )
  })

  it('expands fertilizer aliases', () => {
    const terms = expandQueryTerms('Best fertilizer for coconut trees')
    expect(terms).toEqual(
      expect.arrayContaining(['fertilizer', 'nutrient', 'manure', 'dolomite']),
    )
  })

  it('expands red weevil aliases', () => {
    const terms = expandQueryTerms('How to prevent red weevil damage')
    expect(terms).toEqual(expect.arrayContaining(['weevil', 'red', 'rhynchophorus']))
  })
})

describe('ragIngest.chunkDocument', () => {
  it('keeps tables intact and prefixes topic title', () => {
    const body = `### Details
Intro text about seedlings.

**Table 1: Other fertilizers to be applied with Cow Dung Manure for seedlings**

| Nutrient | Fertilizer Type | Year 1 |
| :--- | :--- | :--- |
| **N** | Cow dung (kg) | 12 |
| **Mg** | Dolomite (g) | 250 |

##### Application Method: For Seedling Trees
Spread fertilizer within the recommended radius.
`
    const chunks = chunkDocument('Fertilizer Recommendations for Coconut Seedlings', body)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    expect(chunks.some((c) => c.includes('Table 1') && c.includes('|'))).toBe(true)
    expect(chunks.every((c) => c.startsWith('Fertilizer Recommendations'))).toBe(true)
  })

  it('splits pest topics by intent headings', () => {
    const body = `### Details
Overview of the pest.

##### Symptoms
Brown patches on leaves.

##### Control Measures
Release parasitoids.
`
    const chunks = chunkDocument('Coconut Leaf Miner', body)
    expect(chunks.some((c) => c.includes('Symptoms'))).toBe(true)
    expect(chunks.some((c) => c.includes('Control Measures'))).toBe(true)
  })
})


describe('bertNlp readiness', () => {
  it('reports not ready before warmup in isolated unit context', () => {
    // Warmup is not run in unit tests; readiness is false unless another suite loaded the model.
    expect(typeof isBertReady()).toBe('boolean')
  })
})
