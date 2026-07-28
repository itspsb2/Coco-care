import {
  LEAF_DISPLAY_DISEASES,
  type LeafDisplayDisease,
  type LeafPrediction,
} from '../constants/leafDiseaseLabels.js'

export type LeafAreaOption =
  | 'older'
  | 'middle'
  | 'youngest'
  | 'most'
  | 'normal'
  | 'unsure'

export type MatchLevel = 'high' | 'moderate' | 'uncertain'

export interface LeafQuestionnaireResult {
  predictions: LeafPrediction[]
  finalResult: string
  confidence: number
  matchLevel: MatchLevel
  secondaryConditions: string[]
  officerAlert?: string
  symptomMatches: Record<string, number>
}

const DISEASE = {
  gray: 'Gray Leaf Spot' as LeafDisplayDisease,
  early: 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)' as LeafDisplayDisease,
  intermediate:
    'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)' as LeafDisplayDisease,
  advanced:
    'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)' as LeafDisplayDisease,
  leafRot: 'Leaf Rot' as LeafDisplayDisease,
  cci: 'Coconut Caterpillar Infestation (CCI)' as LeafDisplayDisease,
  healthy: 'Healthy Coconut Leaf' as LeafDisplayDisease,
}

const AREA_WEIGHTS: Record<
  Exclude<LeafAreaOption, 'unsure'>,
  Partial<Record<LeafDisplayDisease, number>>
> = {
  older: { [DISEASE.gray]: 15, [DISEASE.cci]: 10 },
  middle: { [DISEASE.early]: 15, [DISEASE.intermediate]: 15, [DISEASE.advanced]: 10 },
  youngest: { [DISEASE.leafRot]: 20 },
  most: { [DISEASE.advanced]: 10 },
  normal: { [DISEASE.healthy]: 10 },
}

/** Symptom id → disease weight contributions */
const SYMPTOM_WEIGHTS: Array<{
  id: string
  weights: Partial<Record<LeafDisplayDisease, number>>
}> = [
  // Gray Leaf Spot
  { id: 'gls_oval_spots', weights: { [DISEASE.gray]: 20 } },
  { id: 'gls_grey_centre', weights: { [DISEASE.gray]: 20 } },
  { id: 'gls_dark_border', weights: { [DISEASE.gray]: 15 } },
  { id: 'gls_yellow_halo', weights: { [DISEASE.gray]: 10 } },
  { id: 'gls_merged_patches', weights: { [DISEASE.gray]: 15 } },
  { id: 'gls_blighted_older', weights: { [DISEASE.gray]: 10 } },
  { id: 'gls_dry_tips', weights: { [DISEASE.gray]: 10 } },

  // WCLWD Early
  { id: 'wclwd_e_uneven_yellow', weights: { [DISEASE.early]: 35 } },
  { id: 'wclwd_e_middle_yellow', weights: { [DISEASE.early]: 20 } },
  { id: 'wclwd_e_irregular_patches', weights: { [DISEASE.early]: 15 } },
  { id: 'wclwd_e_firm_leaflets', weights: { [DISEASE.early]: 10 } },
  { id: 'wclwd_e_little_drying', weights: { [DISEASE.early]: 10 } },
  { id: 'wclwd_e_no_other_damage', weights: { [DISEASE.early]: 10 } },

  // WCLWD Intermediate
  { id: 'wclwd_i_bent_limp', weights: { [DISEASE.intermediate]: 35 } },
  { id: 'wclwd_i_flaccid', weights: { [DISEASE.intermediate]: 20 } },
  { id: 'wclwd_i_uneven_yellow', weights: { [DISEASE.intermediate]: 20 } },
  { id: 'wclwd_i_middle_crown', weights: { [DISEASE.intermediate]: 10 } },
  { id: 'wclwd_i_early_drying', weights: { [DISEASE.intermediate]: 10 } },
  { id: 'wclwd_i_reduced_vigour', weights: { [DISEASE.intermediate]: 5 } },

  // WCLWD Advanced
  { id: 'wclwd_a_margin_drying', weights: { [DISEASE.advanced]: 30 } },
  { id: 'wclwd_a_collapsed', weights: { [DISEASE.advanced]: 20 } },
  { id: 'wclwd_a_intense_yellow', weights: { [DISEASE.advanced]: 15 } },
  { id: 'wclwd_a_large_dried', weights: { [DISEASE.advanced]: 15 } },
  { id: 'wclwd_a_weak_crown', weights: { [DISEASE.advanced]: 10 } },
  { id: 'wclwd_a_decline', weights: { [DISEASE.advanced]: 10 } },

  // Leaf Rot
  { id: 'lr_water_soaked', weights: { [DISEASE.leafRot]: 25 } },
  { id: 'lr_soft_rotten', weights: { [DISEASE.leafRot]: 20 } },
  { id: 'lr_enlarge_join', weights: { [DISEASE.leafRot]: 20 } },
  { id: 'lr_fall_away', weights: { [DISEASE.leafRot]: 15 } },
  { id: 'lr_fan_shape', weights: { [DISEASE.leafRot]: 10 } },
  { id: 'lr_spear_fail', weights: { [DISEASE.leafRot]: 10 } },

  // CCI
  { id: 'cci_scraped_underside', weights: { [DISEASE.cci]: 20 } },
  { id: 'cci_silk_galleries', weights: { [DISEASE.cci]: 25 } },
  { id: 'cci_frass', weights: { [DISEASE.cci]: 20 } },
  { id: 'cci_visible_insects', weights: { [DISEASE.cci]: 20 } },
  { id: 'cci_dry_grey_lower', weights: { [DISEASE.cci]: 10 } },
  { id: 'cci_scorched_lower', weights: { [DISEASE.cci]: 5 } },

  // Healthy
  { id: 'healthy_even_green', weights: { [DISEASE.healthy]: 20 } },
  { id: 'healthy_no_spots', weights: { [DISEASE.healthy]: 15 } },
  { id: 'healthy_no_yellowing', weights: { [DISEASE.healthy]: 15 } },
  { id: 'healthy_firm', weights: { [DISEASE.healthy]: 15 } },
  { id: 'healthy_no_dry_margins', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_no_insects', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_spear_clean', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_normal_growth', weights: { [DISEASE.healthy]: 5 } },
]

function emptyScores(): Record<LeafDisplayDisease, number> {
  return Object.fromEntries(LEAF_DISPLAY_DISEASES.map((d) => [d, 0])) as Record<
    LeafDisplayDisease,
    number
  >
}

function isTruthy(value: string | boolean | undefined): boolean {
  return value === true || value === 'yes' || value === 'true'
}

function addWeights(
  scores: Record<LeafDisplayDisease, number>,
  weights: Partial<Record<LeafDisplayDisease, number>>,
) {
  for (const [disease, weight] of Object.entries(weights)) {
    scores[disease as LeafDisplayDisease] += weight ?? 0
  }
}

/**
 * Score leaf questionnaire per COCO CARE weighted symptom form.
 * Final Score = (0.60 × Image Probability) + (0.40 × Normalized Symptom Score)
 * then renormalize so scores sum to 1.0.
 */
export function scoreLeafQuestionnaire(
  answers: Record<string, string | boolean>,
  imagePredictions: LeafPrediction[],
): LeafQuestionnaireResult {
  const raw = emptyScores()

  // Step 1 — leaf area (single)
  const area = String(answers.leaf_area ?? 'unsure') as LeafAreaOption
  if (area !== 'unsure' && AREA_WEIGHTS[area]) {
    addWeights(raw, AREA_WEIGHTS[area])
  }

  // Step 2 — selected symptoms
  for (const symptom of SYMPTOM_WEIGHTS) {
    if (isTruthy(answers[symptom.id])) {
      addWeights(raw, symptom.weights)
    }
  }

  // Step 3 — additional distinguishing questions
  if (isTruthy(answers.q_spots_bordered)) {
    addWeights(raw, { [DISEASE.gray]: 15 })
  }
  if (isTruthy(answers.q_uneven_yellowing)) {
    addWeights(raw, { [DISEASE.early]: 15 })
  }

  const bent = String(answers.q_leaflets_bent ?? 'unknown')
  if (bent === 'slightly') {
    addWeights(raw, { [DISEASE.intermediate]: 10 })
  } else if (bent === 'severely') {
    addWeights(raw, { [DISEASE.advanced]: 15 })
  } else if (bent === 'no') {
    addWeights(raw, { [DISEASE.early]: 5, [DISEASE.healthy]: 5 })
  }

  if (isTruthy(answers.q_silk_frass)) {
    addWeights(raw, { [DISEASE.cci]: 25 })
  }

  const spear = String(answers.q_spear_rotten ?? 'unknown')
  if (spear === 'yes' || spear === 'true') {
    addWeights(raw, { [DISEASE.leafRot]: 25 })
  } else if (spear === 'no') {
    addWeights(raw, { [DISEASE.healthy]: 5 })
  }

  let officerAlert: string | undefined
  if (isTruthy(answers.q_nearby_palms)) {
    officerAlert =
      'Possible spreading condition—request officer inspection'
  }

  // Cap each condition match at 100
  const symptomMatches = emptyScores()
  for (const disease of LEAF_DISPLAY_DISEASES) {
    symptomMatches[disease] = Math.min(raw[disease], 100)
  }

  const matchSum = LEAF_DISPLAY_DISEASES.reduce((sum, d) => sum + symptomMatches[d], 0)

  const imageMap = new Map(imagePredictions.map((p) => [p.label, p.probability]))

  // Final Score = 0.60 * image + 0.40 * normalized symptom
  const combined = LEAF_DISPLAY_DISEASES.map((disease) => {
    const imageProb = imageMap.get(disease) ?? 0
    const normalizedSymptom = matchSum > 0 ? symptomMatches[disease] / matchSum : 0
    return {
      label: disease,
      probability: 0.6 * imageProb + 0.4 * normalizedSymptom,
    }
  })

  const combinedSum = combined.reduce((s, c) => s + c.probability, 0)
  const predictions =
    combinedSum > 0
      ? combined
          .map((c) => ({
            label: c.label,
            probability: c.probability / combinedSum,
          }))
          .sort((a, b) => b.probability - a.probability)
      : LEAF_DISPLAY_DISEASES.map((label) => ({
          label,
          probability: imageMap.get(label) ?? 0,
        })).sort((a, b) => b.probability - a.probability)

  const top = predictions[0]
  const confidence = top?.probability ?? 0
  const finalResult = top?.label ?? DISEASE.healthy

  const matchLevel: MatchLevel =
    confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'moderate' : 'uncertain'

  // If two conditions exceed 60% questionnaire match, surface both
  const secondaryConditions = LEAF_DISPLAY_DISEASES.filter(
    (d) => d !== finalResult && symptomMatches[d] >= 60,
  )

  return {
    predictions,
    finalResult,
    confidence,
    matchLevel,
    secondaryConditions,
    officerAlert,
    symptomMatches,
  }
}

export function getMatchLevelLabel(level: MatchLevel): string {
  if (level === 'high') return 'High symptom-supported match'
  if (level === 'moderate') return 'Moderate match—officer verification recommended'
  return 'Uncertain result—upload clearer images or contact an agriculture officer'
}
