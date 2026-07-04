import { buildGroundedUserPrompt } from '../src/services/groq.service.js'

describe('groq.buildGroundedUserPrompt', () => {
  it('formats question and numbered excerpts', () => {
    const prompt = buildGroundedUserPrompt({
      question: 'How to treat bud rot?',
      conversationSnippet: 'user: leaves are rotting',
      chunks: [
        {
          content: 'Wet the bud region with Bordeaux mixture.',
          sourceTitle: 'BUD ROT DISEASE AND ITS CONTROL',
          score: 0.9,
        },
      ],
    })

    expect(prompt).toContain('Current question:')
    expect(prompt).toContain('How to treat bud rot?')
    expect(prompt).toContain('Recent conversation:')
    expect(prompt).toContain('[1] Title: BUD ROT DISEASE AND ITS CONTROL')
    expect(prompt).toContain('Bordeaux mixture')
  })

  it('omits conversation section when snippet empty', () => {
    const prompt = buildGroundedUserPrompt({
      question: 'fertilizer',
      chunks: [{ content: 'Apply cow dung manure', sourceTitle: 'Adult Trees', score: 0.8 }],
    })
    expect(prompt).not.toContain('Recent conversation:')
  })

  it('includes at least three chunks when available', () => {
    const prompt = buildGroundedUserPrompt({
      question: 'fertilizer for seedlings',
      chunks: [
        { content: 'Cow dung table', sourceTitle: 'Seedlings', score: 0.9 },
        { content: 'Goat manure table', sourceTitle: 'Seedlings', score: 0.8 },
        { content: 'Radius table', sourceTitle: 'Seedlings', score: 0.7 },
        { content: 'Extra', sourceTitle: 'Seedlings', score: 0.6 },
      ],
    })
    expect(prompt).toContain('[1]')
    expect(prompt).toContain('[2]')
    expect(prompt).toContain('[3]')
    expect(prompt).toContain('Cow dung table')
    expect(prompt).toContain('Radius table')
  })
})

