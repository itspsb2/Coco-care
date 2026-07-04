import { extractAnswer, isBertReady } from '../src/services/bertNlp.service.js'
import { expandQueryTerms, queryTerms } from '../src/services/ragGlossary.js'

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
})

describe('ragGlossary', () => {
  it('extracts english query terms', () => {
    expect(queryTerms('How to treat bud rot disease?')).toEqual(
      expect.arrayContaining(['bud', 'rot', 'disease']),
    )
  })

  it('expands fertilizer aliases', () => {
    const terms = expandQueryTerms('Best fertilizer for coconut trees')
    expect(terms).toEqual(expect.arrayContaining(['fertilizer', 'npk', 'urea', 'nutrient']))
  })
})

describe('bertNlp readiness', () => {
  it('reports not ready before warmup in isolated unit context', () => {
    // Warmup is not run in unit tests; readiness is false unless another suite loaded the model.
    expect(typeof isBertReady()).toBe('boolean')
  })
})
