import {
  CATEGORY_DISEASES,
  type DiagnosisCategory,
} from '../constants/diagnosisCategories.js'

const ADVICE: Record<string, string> = {
  'Weligama Coconut Leaf Wilt Disease':
    'Remove affected fronds. Apply recommended fungicide per CRI guidelines. Monitor nearby trees weekly.',
  'Stem Bleeding Disease':
    'Remove affected bark and apply Bordeaux paste. Improve drainage around the tree base.',
  'Ganoderma Butt Rot':
    'Remove and destroy infected trees. Avoid wounding trunks and improve soil drainage around remaining palms.',
  'Bud Rot Disease':
    'Remove infected tissues immediately. Apply Bordeaux mixture and improve crown drainage.',
  'Crown Wilt':
    'Inspect crown for rot or nutrient stress. Consult your agriculture officer for verified treatment.',
  'Coconut Caterpillar Damage':
    'Remove and destroy affected fronds. Apply recommended biological control per CRI guidelines.',
  'Coconut Mite Damage':
    'Prune severely damaged fronds. Apply miticide per CRI recommendations during early infestation.',
  'Fruit Rot':
    'Collect and destroy fallen nuts. Improve canopy airflow and consult officer for fungicide guidance.',
  'Lethal Yellowing':
    'Report immediately to agriculture authorities. Remove severely affected palms to limit spread.',
}

function flattenCategoryDiseases(category: Exclude<DiagnosisCategory, 'leaves'>) {
  return CATEGORY_DISEASES[category].flatMap((disease) =>
    disease.symptoms.map((symptom) => ({
      symptom,
      disease: disease.name,
    })),
  )
}

export function classifySymptoms(
  symptoms: Record<string, string | boolean>,
  category: DiagnosisCategory = 'whole-tree',
): {
  disease: string
  confidence: number
  advice: string
} {
  const active = Object.entries(symptoms)
    .filter(([, v]) => v === true || (typeof v === 'string' && v.length > 0))
    .map(([k]) => k.toLowerCase())

  if (category === 'leaves') {
    return {
      disease: 'Not assessed',
      confidence: 0,
      advice: ADVICE['Weligama Coconut Leaf Wilt Disease'],
    }
  }

  const rules = flattenCategoryDiseases(category)
  const diseaseScores = new Map<string, number>()

  for (const rule of rules) {
    const symptomKey = rule.symptom.toLowerCase()
    const matched = active.some(
      (s) => s === symptomKey || s.includes(symptomKey) || symptomKey.includes(s),
    )
    if (matched) {
      diseaseScores.set(rule.disease, (diseaseScores.get(rule.disease) ?? 0) + 1)
    }
  }

  let bestDisease = CATEGORY_DISEASES[category][0]?.name ?? 'Unknown condition'
  let bestScore = 0

  for (const [disease, score] of diseaseScores) {
    if (score > bestScore) {
      bestScore = score
      bestDisease = disease
    }
  }

  const confidence =
    bestScore > 0 ? Math.min(0.95, 0.55 + bestScore * 0.15) : active.length > 0 ? 0.45 : 0.35

  return {
    disease: bestDisease,
    confidence,
    advice: ADVICE[bestDisease] ?? 'Consult your agriculture officer for verified treatment guidance.',
  }
}

export function getAdviceForDisease(disease: string): string {
  return ADVICE[disease] ?? 'Consult your agriculture officer for verified treatment guidance.'
}
