import {
  STEM_DISPLAY_DISEASES,
  type StemDisplayDisease,
  type StemPrediction,
} from '../constants/stemDiseaseLabels.js'

export type StemDamageLocation = 'soil' | 'middle' | 'upper' | 'none' | 'unsure'

export type MatchLevel = 'high' | 'moderate' | 'low' | 'uncertain'

export interface StemQuestionnaireResult {
  predictions: StemPrediction[]
  finalResult: string
  confidence: number
  symptomMatch: number
  matchLevel: MatchLevel
  secondaryConditions: string[]
  officerAlert?: string
  safetyWarning?: string
  symptomMatches: Record<string, number>
}

const DISEASE = {
  bleeding: 'Stem Bleeding Disease' as StemDisplayDisease,
  weevil: 'Red Palm Weevil Infestation' as StemDisplayDisease,
  ganoderma: 'Basal Stem Rot—Ganoderma' as StemDisplayDisease,
  termite: 'Termite Damage' as StemDisplayDisease,
  mechanical: 'Mechanical Trunk Injury' as StemDisplayDisease,
  healthy: 'Healthy Coconut Trunk' as StemDisplayDisease,
}

const LOCATION_WEIGHTS: Record<
  Exclude<StemDamageLocation, 'unsure'>,
  Partial<Record<StemDisplayDisease, number>>
> = {
  soil: { [DISEASE.ganoderma]: 10, [DISEASE.termite]: 5 },
  middle: { [DISEASE.bleeding]: 10, [DISEASE.mechanical]: 5 },
  upper: { [DISEASE.weevil]: 10 },
  none: { [DISEASE.healthy]: 5 },
}

const SYMPTOM_WEIGHTS: Array<{
  id: string
  weights: Partial<Record<StemDisplayDisease, number>>
  critical?: boolean
}> = [
  // Stem Bleeding Disease
  { id: 'sbd_reddish_liquid', weights: { [DISEASE.bleeding]: 25 } },
  { id: 'sbd_dark_dried', weights: { [DISEASE.bleeding]: 20 } },
  { id: 'sbd_vertical_cracks', weights: { [DISEASE.bleeding]: 15 } },
  { id: 'sbd_soft_rotten', weights: { [DISEASE.bleeding]: 15 }, critical: true },
  { id: 'sbd_multiple_patches', weights: { [DISEASE.bleeding]: 10 } },
  { id: 'sbd_dark_stain', weights: { [DISEASE.bleeding]: 10 } },
  { id: 'sbd_reduced_growth', weights: { [DISEASE.bleeding]: 5 } },

  // Red Palm Weevil
  { id: 'rpw_round_holes', weights: { [DISEASE.weevil]: 15 } },
  { id: 'rpw_chewed_fibres', weights: { [DISEASE.weevil]: 20 } },
  { id: 'rpw_sawdust', weights: { [DISEASE.weevil]: 15 } },
  { id: 'rpw_sticky_liquid', weights: { [DISEASE.weevil]: 10 } },
  { id: 'rpw_fermented_smell', weights: { [DISEASE.weevil]: 10 } },
  { id: 'rpw_chewing_sounds', weights: { [DISEASE.weevil]: 10 } },
  { id: 'rpw_insects_visible', weights: { [DISEASE.weevil]: 15 }, critical: true },
  { id: 'rpw_crown_collapse', weights: { [DISEASE.weevil]: 5 }, critical: true },

  // Basal Stem Rot — Ganoderma
  { id: 'bsr_near_soil', weights: { [DISEASE.ganoderma]: 10 } },
  { id: 'bsr_soft_base', weights: { [DISEASE.ganoderma]: 20 }, critical: true },
  { id: 'bsr_hollow_sound', weights: { [DISEASE.ganoderma]: 10 }, critical: true },
  { id: 'bsr_brackets', weights: { [DISEASE.ganoderma]: 25 }, critical: true },
  { id: 'bsr_rotten_roots', weights: { [DISEASE.ganoderma]: 15 }, critical: true },
  { id: 'bsr_yellow_droop', weights: { [DISEASE.ganoderma]: 10 } },
  { id: 'bsr_leaning', weights: { [DISEASE.ganoderma]: 10 }, critical: true },

  // Termite Damage
  { id: 'term_mud_tubes', weights: { [DISEASE.termite]: 30 } },
  { id: 'term_live_termites', weights: { [DISEASE.termite]: 25 } },
  { id: 'term_soil_cover', weights: { [DISEASE.termite]: 15 } },
  { id: 'term_eaten_tissue', weights: { [DISEASE.termite]: 10 }, critical: true },
  { id: 'term_near_base', weights: { [DISEASE.termite]: 10 } },
  { id: 'term_weak_palm', weights: { [DISEASE.termite]: 5 } },
  { id: 'term_nearby_wood', weights: { [DISEASE.termite]: 5 } },

  // Mechanical Trunk Injury
  { id: 'mti_visible_wound', weights: { [DISEASE.mechanical]: 25 } },
  { id: 'mti_known_cause', weights: { [DISEASE.mechanical]: 20 } },
  { id: 'mti_limited_area', weights: { [DISEASE.mechanical]: 15 } },
  { id: 'mti_lightning_machine', weights: { [DISEASE.mechanical]: 15 } },
  { id: 'mti_clean_edges', weights: { [DISEASE.mechanical]: 10 } },
  { id: 'mti_no_pests_fungi', weights: { [DISEASE.mechanical]: 10 } },
  { id: 'mti_healing', weights: { [DISEASE.mechanical]: 5 } },

  // Healthy Coconut Trunk
  { id: 'healthy_firm_dry', weights: { [DISEASE.healthy]: 20 } },
  { id: 'healthy_normal_colour', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_leaf_scars', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_no_bleeding', weights: { [DISEASE.healthy]: 15 } },
  { id: 'healthy_no_holes', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_no_soft_rot', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_no_brackets_tubes', weights: { [DISEASE.healthy]: 10 } },
  { id: 'healthy_no_smell_sound', weights: { [DISEASE.healthy]: 5 } },
  { id: 'healthy_upright_crown', weights: { [DISEASE.healthy]: 10 } },
]

const SAFETY_MESSAGE =
  'Safety warning: The palm may be structurally unstable. Keep people and animals away and contact a Coconut Research Institute or agriculture officer.'

function emptyScores(): Record<StemDisplayDisease, number> {
  return Object.fromEntries(STEM_DISPLAY_DISEASES.map((d) => [d, 0])) as Record<
    StemDisplayDisease,
    number
  >
}

function isTruthy(value: string | boolean | undefined): boolean {
  return value === true || value === 'yes' || value === 'true'
}

function addWeights(
  scores: Record<StemDisplayDisease, number>,
  weights: Partial<Record<StemDisplayDisease, number>>,
) {
  for (const [disease, weight] of Object.entries(weights)) {
    scores[disease as StemDisplayDisease] += weight ?? 0
  }
}

function resolveMatchLevel(symptomMatch: number): MatchLevel {
  if (symptomMatch >= 80) return 'high'
  if (symptomMatch >= 60) return 'moderate'
  if (symptomMatch >= 40) return 'low'
  return 'uncertain'
}

/**
 * Score stem/trunk questionnaire.
 * Symptom Match = min(sum of weights, 100)
 * Ranked Percentage = Disease Score ÷ Total Scores × 100
 */
export function scoreStemQuestionnaire(
  answers: Record<string, string | boolean>,
): StemQuestionnaireResult {
  const raw = emptyScores()
  let criticalSelected = false

  const location = String(answers.damage_location ?? 'unsure') as StemDamageLocation
  if (location !== 'unsure' && LOCATION_WEIGHTS[location]) {
    addWeights(raw, LOCATION_WEIGHTS[location])
  }

  for (const symptom of SYMPTOM_WEIGHTS) {
    if (isTruthy(answers[symptom.id])) {
      addWeights(raw, symptom.weights)
      if (symptom.critical) criticalSelected = true
    }
  }

  // Distinguishing Q2 — what is coming from the trunk?
  const discharge = String(answers.q_discharge ?? 'unsure')
  if (discharge === 'reddish') {
    addWeights(raw, { [DISEASE.bleeding]: 15, [DISEASE.weevil]: 5 })
  } else if (discharge === 'black') {
    addWeights(raw, { [DISEASE.bleeding]: 15 })
  } else if (discharge === 'fibres') {
    addWeights(raw, { [DISEASE.weevil]: 20 })
  } else if (discharge === 'nothing') {
    addWeights(raw, { [DISEASE.healthy]: 5 })
  }

  // Distinguishing Q3 — opening type
  const opening = String(answers.q_opening ?? 'unsure')
  if (opening === 'vertical_crack') {
    addWeights(raw, { [DISEASE.bleeding]: 10 })
  } else if (opening === 'round_hole') {
    addWeights(raw, { [DISEASE.weevil]: 15 })
  } else if (opening === 'tool_wound') {
    addWeights(raw, { [DISEASE.mechanical]: 15 })
  } else if (opening === 'soil_rot') {
    addWeights(raw, { [DISEASE.ganoderma]: 15 })
  } else if (opening === 'none') {
    addWeights(raw, { [DISEASE.healthy]: 5 })
  }

  const symptomMatches = emptyScores()
  for (const disease of STEM_DISPLAY_DISEASES) {
    symptomMatches[disease] = Math.min(raw[disease], 100)
  }

  const matchSum = STEM_DISPLAY_DISEASES.reduce((sum, d) => sum + symptomMatches[d], 0)

  const predictions: StemPrediction[] =
    matchSum > 0
      ? STEM_DISPLAY_DISEASES.map((label) => ({
          label,
          probability: symptomMatches[label] / matchSum,
        })).sort((a, b) => b.probability - a.probability)
      : STEM_DISPLAY_DISEASES.map((label) => ({ label, probability: 0 }))

  const top = predictions[0]
  const finalResult = top?.label ?? DISEASE.healthy
  const confidence = top?.probability ?? 0
  const symptomMatch = symptomMatches[finalResult as StemDisplayDisease] ?? 0
  const matchLevel = resolveMatchLevel(symptomMatch)

  const secondaryConditions = STEM_DISPLAY_DISEASES.filter(
    (d) => d !== finalResult && symptomMatches[d] >= 60,
  )

  let safetyWarning: string | undefined
  if (criticalSelected) {
    safetyWarning = SAFETY_MESSAGE
  }

  return {
    predictions,
    finalResult,
    confidence,
    symptomMatch,
    matchLevel,
    secondaryConditions,
    safetyWarning,
    symptomMatches,
  }
}

export function getStemMatchLevelLabel(level: MatchLevel): string {
  if (level === 'high') return 'High symptom match'
  if (level === 'moderate') return 'Moderate symptom match—officer verification recommended'
  if (level === 'low') return 'Low match—provide more photographs and symptoms'
  return 'Insufficient evidence for diagnosis'
}

export function getStemAdvice(disease: string): string {
  const advice: Record<string, string> = {
    'Stem Bleeding Disease':
      'Clean the bleeding area, scrape soft tissue, and apply Bordeaux paste. Improve drainage and avoid fresh trunk wounds.',
    'Red Palm Weevil Infestation':
      'Treat promptly per CRI weevil control guidance. Monitor nearby palms and seal unused wounds or holes.',
    'Basal Stem Rot—Ganoderma':
      'Isolate the palm, avoid wounding nearby trunks, and consult an officer. Severely affected palms may need removal.',
    'Termite Damage':
      'Remove mud tubes, treat the colony per recommended practice, and clear nearby dead wood harbouring termites.',
    'Mechanical Trunk Injury':
      'Keep the wound clean and dry, avoid secondary infection, and monitor healing. Protect from further injury.',
    'Healthy Coconut Trunk':
      'No strong disease signals were selected. Continue routine monitoring and good farm hygiene.',
  }
  return advice[disease] ?? 'Contact your agriculture officer for field verification and treatment guidance.'
}
