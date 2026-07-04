const SYMPTOM_RULES: Array<{ keywords: string[]; disease: string }> = [
  {
    keywords: ['yellowing', 'wilting', 'drooping', 'flaccid'],
    disease: 'Weligama Coconut Leaf Wilt Disease',
  },
  {
    keywords: ['bleeding', 'cracked bark', 'wound', 'reddish'],
    disease: 'Stem Bleeding Disease',
  },
  {
    keywords: ['rot', 'foul smell', 'crown', 'blackened bud'],
    disease: 'Bud Rot Disease',
  },
  {
    keywords: ['caterpillar', 'holes', 'damaged leaf', 'brown dried'],
    disease: 'Coconut Caterpillar Damage',
  },
]

const ADVICE: Record<string, string> = {
  'Weligama Coconut Leaf Wilt Disease':
    'Remove affected fronds. Apply recommended fungicide per CRI guidelines. Monitor nearby trees weekly.',
  'Stem Bleeding Disease':
    'Remove affected bark and apply Bordeaux paste. Improve drainage around the tree base.',
  'Bud Rot Disease':
    'Remove infected tissues immediately. Apply Bordeaux mixture and improve crown drainage.',
  'Coconut Caterpillar Damage':
    'Remove and destroy affected fronds. Apply recommended biological control per CRI guidelines.',
}

export function classifySymptoms(symptoms: Record<string, string | boolean>): {
  disease: string
  confidence: number
  advice: string
} {
  const active = Object.entries(symptoms)
    .filter(([, v]) => v === true || (typeof v === 'string' && v.length > 0))
    .map(([k]) => k.toLowerCase())

  let best = SYMPTOM_RULES[0]
  let bestScore = 0

  for (const rule of SYMPTOM_RULES) {
    const score = rule.keywords.filter((kw) =>
      active.some((s) => s.includes(kw) || kw.includes(s)),
    ).length
    if (score > bestScore) {
      bestScore = score
      best = rule
    }
  }

  const confidence = bestScore > 0 ? Math.min(0.95, 0.6 + bestScore * 0.15) : 0.5

  return {
    disease: best.disease,
    confidence,
    advice: ADVICE[best.disease] ?? ADVICE['Weligama Coconut Leaf Wilt Disease'],
  }
}

export function getAdviceForDisease(disease: string): string {
  return ADVICE[disease] ?? 'Consult your agriculture officer for verified treatment guidance.'
}
