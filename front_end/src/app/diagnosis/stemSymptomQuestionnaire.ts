export type StemDamageLocation = 'soil' | 'middle' | 'upper' | 'none' | 'unsure'

export type StemQuestionnaireState = {
  damageLocation: StemDamageLocation | ''
  selectedSymptoms: string[]
  qDischarge: 'reddish' | 'black' | 'fibres' | 'nothing' | 'unsure' | ''
  qOpening: 'vertical_crack' | 'round_hole' | 'tool_wound' | 'soil_rot' | 'none' | ''
}

export const EMPTY_STEM_QUESTIONNAIRE: StemQuestionnaireState = {
  damageLocation: '',
  selectedSymptoms: [],
  qDischarge: '',
  qOpening: '',
}

export const STEM_DAMAGE_LOCATION_OPTIONS: Array<{
  id: StemDamageLocation
  label: string
}> = [
  { id: 'soil', label: 'Near the soil and root area' },
  { id: 'middle', label: 'Middle part of the trunk' },
  { id: 'upper', label: 'Upper trunk or leaf bases' },
  { id: 'none', label: 'No damage visible' },
  { id: 'unsure', label: 'Not sure' },
]

export type StemSymptomGroup = {
  title: string
  note?: string
  symptoms: Array<{ id: string; label: string }>
}

export const STEM_SYMPTOM_GROUPS: StemSymptomGroup[] = [
  {
    title: 'Stem Bleeding Disease',
    symptoms: [
      { id: 'sbd_reddish_liquid', label: 'Reddish-brown liquid comes from the trunk' },
      { id: 'sbd_dark_dried', label: 'Liquid becomes dark or black after drying' },
      { id: 'sbd_vertical_cracks', label: 'Vertical cracks are visible on the trunk' },
      {
        id: 'sbd_soft_rotten',
        label: 'Tissue under the affected bark is soft or rotten',
      },
      { id: 'sbd_multiple_patches', label: 'Multiple bleeding patches are present' },
      {
        id: 'sbd_dark_stain',
        label: 'A dark stain runs downward along the trunk',
      },
      { id: 'sbd_reduced_growth', label: 'Palm growth or production has reduced' },
    ],
  },
  {
    title: 'Red Palm Weevil Infestation',
    symptoms: [
      {
        id: 'rpw_round_holes',
        label: 'Round holes are visible on the trunk or leaf bases',
      },
      { id: 'rpw_chewed_fibres', label: 'Chewed fibres come out of the holes' },
      {
        id: 'rpw_sawdust',
        label: 'Sawdust-like material or insect waste is present',
      },
      { id: 'rpw_sticky_liquid', label: 'Brown sticky liquid comes from a hole' },
      {
        id: 'rpw_fermented_smell',
        label: 'An unpleasant fermented smell is present',
      },
      {
        id: 'rpw_chewing_sounds',
        label: 'Chewing sounds can be heard inside the trunk',
      },
      {
        id: 'rpw_insects_visible',
        label: 'Larvae, cocoons or adult weevils are visible',
      },
      {
        id: 'rpw_crown_collapse',
        label: 'Crown is bending, weakening or collapsing',
      },
    ],
  },
  {
    title: 'Basal Stem Rot—Ganoderma',
    symptoms: [
      { id: 'bsr_near_soil', label: 'Damage begins near the soil level' },
      { id: 'bsr_soft_base', label: 'Base of the trunk is soft or rotten' },
      {
        id: 'bsr_hollow_sound',
        label: 'Base sounds hollow when lightly tapped',
      },
      {
        id: 'bsr_brackets',
        label: 'Mushroom-like fungal brackets are attached to the base',
      },
      { id: 'bsr_rotten_roots', label: 'Roots are black, soft or rotten' },
      {
        id: 'bsr_yellow_droop',
        label: 'Older leaves are yellowing and drooping',
      },
      { id: 'bsr_leaning', label: 'Palm is leaning or becoming unstable' },
    ],
  },
  {
    title: 'Termite Damage',
    symptoms: [
      { id: 'term_mud_tubes', label: 'Mud tubes are present on the trunk' },
      {
        id: 'term_live_termites',
        label: 'Live termites are visible under loose bark',
      },
      {
        id: 'term_soil_cover',
        label: 'Soil-like material covers parts of the trunk',
      },
      { id: 'term_eaten_tissue', label: 'Outer trunk tissue has been eaten' },
      {
        id: 'term_near_base',
        label: 'Damage mainly occurs near the trunk base',
      },
      {
        id: 'term_weak_palm',
        label: 'Palm is young, weak or previously damaged',
      },
      {
        id: 'term_nearby_wood',
        label: 'Nearby dead wood also contains termites',
      },
    ],
  },
  {
    title: 'Mechanical Trunk Injury',
    note: 'Use this section when the damage is from a known injury rather than disease.',
    symptoms: [
      {
        id: 'mti_visible_wound',
        label: 'A visible cut, climbing wound or tool injury is present',
      },
      {
        id: 'mti_known_cause',
        label: 'The farmer knows when and how the damage happened',
      },
      { id: 'mti_limited_area', label: 'Damage is limited to one specific area' },
      {
        id: 'mti_lightning_machine',
        label: 'Lightning, machinery or animal damage is visible',
      },
      {
        id: 'mti_clean_edges',
        label: 'The wound has clean edges rather than rotten edges',
      },
      {
        id: 'mti_no_pests_fungi',
        label: 'No insects, frass or fungal structures are present',
      },
      { id: 'mti_healing', label: 'The wound is dry and healing normally' },
    ],
  },
  {
    title: 'Healthy Coconut Trunk',
    note: 'Select positive healthy characteristics — do not mark Healthy only because disease symptoms were not selected.',
    symptoms: [
      { id: 'healthy_firm_dry', label: 'Trunk is firm and dry' },
      {
        id: 'healthy_normal_colour',
        label: 'Trunk colour appears normal and uniform',
      },
      { id: 'healthy_leaf_scars', label: 'Normal leaf-scar rings are visible' },
      { id: 'healthy_no_bleeding', label: 'No liquid or dark bleeding patches' },
      { id: 'healthy_no_holes', label: 'No holes or chewed fibres' },
      { id: 'healthy_no_soft_rot', label: 'No soft, hollow or rotten areas' },
      {
        id: 'healthy_no_brackets_tubes',
        label: 'No fungal brackets or mud tubes',
      },
      {
        id: 'healthy_no_smell_sound',
        label: 'No unpleasant smell or internal sound',
      },
      {
        id: 'healthy_upright_crown',
        label: 'Crown appears upright and healthy',
      },
    ],
  },
]

export function questionnaireToStemSymptomsPayload(
  state: StemQuestionnaireState,
): Record<string, string | boolean> {
  const payload: Record<string, string | boolean> = {}

  if (state.damageLocation) {
    payload.damage_location = state.damageLocation
  }

  for (const id of state.selectedSymptoms) {
    payload[id] = true
  }

  if (state.qDischarge) payload.q_discharge = state.qDischarge
  if (state.qOpening) payload.q_opening = state.qOpening

  return payload
}

export const STEM_DISPLAY_DISEASES = [
  'Stem Bleeding Disease',
  'Red Palm Weevil Infestation',
  'Basal Stem Rot—Ganoderma',
  'Termite Damage',
  'Mechanical Trunk Injury',
  'Healthy Coconut Trunk',
] as const

export type StemDisplayDisease = (typeof STEM_DISPLAY_DISEASES)[number]

/** Percentage weights from the COCO CARE stem/trunk form spec. */
const STEM_SYMPTOM_WEIGHTS: Array<{
  id: string
  weights: Partial<Record<StemDisplayDisease, number>>
  critical?: boolean
}> = [
  { id: 'sbd_reddish_liquid', weights: { 'Stem Bleeding Disease': 25 } },
  { id: 'sbd_dark_dried', weights: { 'Stem Bleeding Disease': 20 } },
  { id: 'sbd_vertical_cracks', weights: { 'Stem Bleeding Disease': 15 } },
  { id: 'sbd_soft_rotten', weights: { 'Stem Bleeding Disease': 15 }, critical: true },
  { id: 'sbd_multiple_patches', weights: { 'Stem Bleeding Disease': 10 } },
  { id: 'sbd_dark_stain', weights: { 'Stem Bleeding Disease': 10 } },
  { id: 'sbd_reduced_growth', weights: { 'Stem Bleeding Disease': 5 } },
  { id: 'rpw_round_holes', weights: { 'Red Palm Weevil Infestation': 15 } },
  { id: 'rpw_chewed_fibres', weights: { 'Red Palm Weevil Infestation': 20 } },
  { id: 'rpw_sawdust', weights: { 'Red Palm Weevil Infestation': 15 } },
  { id: 'rpw_sticky_liquid', weights: { 'Red Palm Weevil Infestation': 10 } },
  { id: 'rpw_fermented_smell', weights: { 'Red Palm Weevil Infestation': 10 } },
  { id: 'rpw_chewing_sounds', weights: { 'Red Palm Weevil Infestation': 10 } },
  { id: 'rpw_insects_visible', weights: { 'Red Palm Weevil Infestation': 15 }, critical: true },
  { id: 'rpw_crown_collapse', weights: { 'Red Palm Weevil Infestation': 5 }, critical: true },
  { id: 'bsr_near_soil', weights: { 'Basal Stem Rot—Ganoderma': 10 } },
  { id: 'bsr_soft_base', weights: { 'Basal Stem Rot—Ganoderma': 20 }, critical: true },
  { id: 'bsr_hollow_sound', weights: { 'Basal Stem Rot—Ganoderma': 10 }, critical: true },
  { id: 'bsr_brackets', weights: { 'Basal Stem Rot—Ganoderma': 25 }, critical: true },
  { id: 'bsr_rotten_roots', weights: { 'Basal Stem Rot—Ganoderma': 15 }, critical: true },
  { id: 'bsr_yellow_droop', weights: { 'Basal Stem Rot—Ganoderma': 10 } },
  { id: 'bsr_leaning', weights: { 'Basal Stem Rot—Ganoderma': 10 }, critical: true },
  { id: 'term_mud_tubes', weights: { 'Termite Damage': 30 } },
  { id: 'term_live_termites', weights: { 'Termite Damage': 25 } },
  { id: 'term_soil_cover', weights: { 'Termite Damage': 15 } },
  { id: 'term_eaten_tissue', weights: { 'Termite Damage': 10 }, critical: true },
  { id: 'term_near_base', weights: { 'Termite Damage': 10 } },
  { id: 'term_weak_palm', weights: { 'Termite Damage': 5 } },
  { id: 'term_nearby_wood', weights: { 'Termite Damage': 5 } },
  { id: 'mti_visible_wound', weights: { 'Mechanical Trunk Injury': 25 } },
  { id: 'mti_known_cause', weights: { 'Mechanical Trunk Injury': 20 } },
  { id: 'mti_limited_area', weights: { 'Mechanical Trunk Injury': 15 } },
  { id: 'mti_lightning_machine', weights: { 'Mechanical Trunk Injury': 15 } },
  { id: 'mti_clean_edges', weights: { 'Mechanical Trunk Injury': 10 } },
  { id: 'mti_no_pests_fungi', weights: { 'Mechanical Trunk Injury': 10 } },
  { id: 'mti_healing', weights: { 'Mechanical Trunk Injury': 5 } },
  { id: 'healthy_firm_dry', weights: { 'Healthy Coconut Trunk': 20 } },
  { id: 'healthy_normal_colour', weights: { 'Healthy Coconut Trunk': 10 } },
  { id: 'healthy_leaf_scars', weights: { 'Healthy Coconut Trunk': 10 } },
  { id: 'healthy_no_bleeding', weights: { 'Healthy Coconut Trunk': 15 } },
  { id: 'healthy_no_holes', weights: { 'Healthy Coconut Trunk': 10 } },
  { id: 'healthy_no_soft_rot', weights: { 'Healthy Coconut Trunk': 10 } },
  { id: 'healthy_no_brackets_tubes', weights: { 'Healthy Coconut Trunk': 10 } },
  { id: 'healthy_no_smell_sound', weights: { 'Healthy Coconut Trunk': 5 } },
  { id: 'healthy_upright_crown', weights: { 'Healthy Coconut Trunk': 10 } },
]

const LOCATION_WEIGHTS: Record<
  Exclude<StemDamageLocation, 'unsure'>,
  Partial<Record<StemDisplayDisease, number>>
> = {
  soil: { 'Basal Stem Rot—Ganoderma': 10, 'Termite Damage': 5 },
  middle: { 'Stem Bleeding Disease': 10, 'Mechanical Trunk Injury': 5 },
  upper: { 'Red Palm Weevil Infestation': 10 },
  none: { 'Healthy Coconut Trunk': 5 },
}

export type StemLocalScore = {
  predictions: Array<{ label: string; probability: number }>
  finalResult: string
  confidence: number
  symptomMatch: number
  matchLevel: 'high' | 'moderate' | 'low' | 'uncertain'
  secondaryConditions: string[]
  officerAlert?: string
  symptomMatches: Record<string, number>
}

/**
 * Local scoring using the uploaded COCO CARE percentage weights.
 * Symptom Match = min(sum, 100); Ranked % = score ÷ total × 100.
 */
export function scoreStemQuestionnaireLocal(
  answers: Record<string, string | boolean>,
): StemLocalScore {
  const raw: Record<StemDisplayDisease, number> = Object.fromEntries(
    STEM_DISPLAY_DISEASES.map((d) => [d, 0]),
  ) as Record<StemDisplayDisease, number>

  let critical = false
  const location = String(answers.damage_location ?? 'unsure') as StemDamageLocation
  if (location !== 'unsure' && LOCATION_WEIGHTS[location as Exclude<StemDamageLocation, 'unsure'>]) {
    const weights = LOCATION_WEIGHTS[location as Exclude<StemDamageLocation, 'unsure'>]
    for (const [disease, weight] of Object.entries(weights)) {
      raw[disease as StemDisplayDisease] += weight ?? 0
    }
  }

  for (const symptom of STEM_SYMPTOM_WEIGHTS) {
    const value = answers[symptom.id]
    if (value === true || value === 'yes' || value === 'true') {
      for (const [disease, weight] of Object.entries(symptom.weights)) {
        raw[disease as StemDisplayDisease] += weight ?? 0
      }
      if (symptom.critical) critical = true
    }
  }

  const discharge = String(answers.q_discharge ?? 'unsure')
  if (discharge === 'reddish') {
    raw['Stem Bleeding Disease'] += 15
    raw['Red Palm Weevil Infestation'] += 5
  } else if (discharge === 'black') {
    raw['Stem Bleeding Disease'] += 15
  } else if (discharge === 'fibres') {
    raw['Red Palm Weevil Infestation'] += 20
  } else if (discharge === 'nothing') {
    raw['Healthy Coconut Trunk'] += 5
  }

  const opening = String(answers.q_opening ?? 'unsure')
  if (opening === 'vertical_crack') raw['Stem Bleeding Disease'] += 10
  else if (opening === 'round_hole') raw['Red Palm Weevil Infestation'] += 15
  else if (opening === 'tool_wound') raw['Mechanical Trunk Injury'] += 15
  else if (opening === 'soil_rot') raw['Basal Stem Rot—Ganoderma'] += 15
  else if (opening === 'none') raw['Healthy Coconut Trunk'] += 5

  const symptomMatches: Record<string, number> = {}
  for (const disease of STEM_DISPLAY_DISEASES) {
    symptomMatches[disease] = Math.min(raw[disease], 100)
  }

  const matchSum = STEM_DISPLAY_DISEASES.reduce((sum, d) => sum + symptomMatches[d], 0)
  const predictions =
    matchSum > 0
      ? STEM_DISPLAY_DISEASES.map((label) => ({
          label,
          probability: symptomMatches[label] / matchSum,
        })).sort((a, b) => b.probability - a.probability)
      : STEM_DISPLAY_DISEASES.map((label) => ({ label, probability: 0 }))

  const top = predictions[0]
  const finalResult = top?.label ?? 'Healthy Coconut Trunk'
  const confidence = top?.probability ?? 0
  const symptomMatch = symptomMatches[finalResult] ?? 0
  const matchLevel =
    symptomMatch >= 80
      ? 'high'
      : symptomMatch >= 60
        ? 'moderate'
        : symptomMatch >= 40
          ? 'low'
          : 'uncertain'

  return {
    predictions,
    finalResult,
    confidence,
    symptomMatch,
    matchLevel,
    secondaryConditions: STEM_DISPLAY_DISEASES.filter(
      (d) => d !== finalResult && (symptomMatches[d] ?? 0) >= 60,
    ),
    officerAlert: critical
      ? 'Safety warning: The palm may be structurally unstable. Keep people and animals away and contact a Coconut Research Institute or agriculture officer.'
      : undefined,
    symptomMatches,
  }
}

export function getStemMatchLevelLabel(
  level: 'high' | 'moderate' | 'low' | 'uncertain' | undefined,
  symptomMatch = 0,
): string {
  const resolved =
    level ??
    (symptomMatch >= 80
      ? 'high'
      : symptomMatch >= 60
        ? 'moderate'
        : symptomMatch >= 40
          ? 'low'
          : 'uncertain')

  if (resolved === 'high') return 'High symptom match'
  if (resolved === 'moderate') return 'Moderate symptom match—officer verification recommended'
  if (resolved === 'low') return 'Low match—provide more photographs and symptoms'
  return 'Insufficient evidence for diagnosis'
}

export function getStemQuestionnaireMissing(state: StemQuestionnaireState): string[] {
  const missing: string[] = []
  if (!state.damageLocation) missing.push('Step 1: where the damage is')
  if (state.selectedSymptoms.length < 1) missing.push('Step 2: at least 1 visible symptom')
  if (!state.qDischarge) missing.push('Step 3: what is coming from the trunk')
  if (!state.qOpening) missing.push('Step 3: what type of opening is present')
  return missing
}

export function isStemQuestionnaireReady(state: StemQuestionnaireState): boolean {
  return getStemQuestionnaireMissing(state).length === 0
}
