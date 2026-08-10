import {
  CATEGORY_DISEASES,
  type DiagnosisCategory,
} from '../constants/diagnosisCategories.js'
import type { LeafDisplayDisease } from '../constants/leafDiseaseLabels.js'

const LEAF_DISEASE_SYMPTOMS: Array<{ name: LeafDisplayDisease; symptoms: string[] }> = [
  {
    name: 'Coconut Caterpillar Infestation (CCI)',
    symptoms: [
      'Holes in leaflets',
      'Chewed or eaten leaf edges',
      'Skeletonized leaves',
      'Visible caterpillars or larvae',
      'Brown feeding marks',
    ],
  },
  {
    name: 'Leaf Rot',
    symptoms: [
      'Brown or dark brown patches',
      'Water-soaked lesions',
      'Soft rotting leaf tissues',
      'Drying and browning of leaf tips',
      'Leaflets becoming brittle',
    ],
  },
  {
    name: 'Gray Leaf Spot',
    symptoms: [
      'Gray or ash-coloured spots',
      'Irregular discoloured patches',
      'Spots enlarging and merging',
      'Premature yellowing of affected areas',
    ],
  },
  {
    name: 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)',
    symptoms: [
      'Yellowing of older leaves',
      'Pale green leaflets',
      'Slight reduction in leaf brightness',
      'Leaves remain firm without drooping',
    ],
  },
  {
    name: 'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)',
    symptoms: [
      'Leaves become soft and droop downward',
      'Leaflets lose their natural stiffness',
      'Crown appears weak',
      'Reduced flowering',
    ],
  },
  {
    name: 'Healthy Coconut Leaf',
    symptoms: [
      'Normal green leaf colour',
      'Leaflets appear firm and intact',
      'No significant lesions, holes, or wilting',
    ],
  },
]

export function scoreLeafSymptoms(symptoms: Record<string, string | boolean>) {
  const positives: string[] = []
  const negatives: string[] = []

  for (const [key, value] of Object.entries(symptoms)) {
    const normalized = key.toLowerCase()
    if (value === true || value === 'yes') {
      positives.push(normalized)
      continue
    }
    if (value === false || value === 'no') {
      negatives.push(normalized)
      continue
    }
    if (typeof value === 'string' && value.trim().length > 0 && value !== 'unknown') {
      positives.push(normalized)
    }
  }

  const scoreByDisease = new Map<LeafDisplayDisease, number>()
  for (const disease of LEAF_DISEASE_SYMPTOMS) {
    let positiveScore = 0
    let negativePenalty = 0
    for (const symptom of disease.symptoms) {
      const symptomKey = symptom.toLowerCase()
      const positiveMatch = positives.some(
        (s) => s === symptomKey || s.includes(symptomKey) || symptomKey.includes(s),
      )
      const negativeMatch = negatives.some(
        (s) => s === symptomKey || s.includes(symptomKey) || symptomKey.includes(s),
      )
      if (positiveMatch) positiveScore += 1
      if (negativeMatch) negativePenalty += 0.75
    }
    const raw = positiveScore - negativePenalty
    const normalized = disease.symptoms.length > 0 ? raw / disease.symptoms.length : 0
    scoreByDisease.set(disease.name, Math.min(1, Math.max(0, normalized)))
  }

  return scoreByDisease
}

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
  'Gray Leaf Spot':
    'Remove affected leaf sections and improve airflow around the canopy. Use recommended fungicide when spread is rapid.',
  'Healthy Coconut Leaf':
    'No strong disease signals were detected. Continue routine monitoring and good farm hygiene.',
  'Coconut Caterpillar Infestation (CCI)':
    'Inspect nearby palms, remove heavily infested fronds, and apply CRI-recommended biological control.',
  'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)':
    'Monitor progression weekly and report if drooping increases. Follow CRI guidance for wilt-prone regions.',
  'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)':
    'Disease progression is moderate; inspect nearby palms and seek agricultural officer support.',
  'Leaf Rot':
    'Prune infected fronds, improve drainage and canopy ventilation, and apply recommended fungicide if needed.',
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
    .filter(([, v]) => v === true || v === 'yes' || (typeof v === 'string' && v.trim().length > 0 && v !== 'unknown' && v !== 'no'))
    .map(([k]) => k.toLowerCase())

  if (category === 'leaves') {
    const scoreByDisease = scoreLeafSymptoms(symptoms)
    let bestDisease: LeafDisplayDisease = 'Healthy Coconut Leaf'
    let bestScore = 0

    for (const [disease, score] of scoreByDisease) {
      if (score > bestScore) {
        bestScore = score
        bestDisease = disease
      }
    }

    const confidence = bestScore > 0 ? Math.min(0.95, 0.45 + bestScore * 0.5) : 0.35

    return {
      disease: bestDisease,
      confidence,
      advice: ADVICE[bestDisease] ?? ADVICE['Weligama Coconut Leaf Wilt Disease'],
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
