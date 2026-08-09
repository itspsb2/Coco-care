import {
  BUD_CONDITION_CODES,
  BUD_CONDITION_PROFILES,
  BUD_DISCLAIMER,
  type BudConditionCode,
} from '../constants/budCrownDiseases.js'

export type MatchLevel = 'high' | 'moderate' | 'uncertain'
export type Differentiation = 'strong' | 'good' | 'some_uncertainty' | 'ambiguous'
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical'

export interface BudRankedCondition {
  code: BudConditionCode
  name: string
  category: 'disease' | 'pest' | 'environmental'
  matchScore: number
}

export interface BudQuestionnaireResult {
  predictions: Array<{ label: string; probability: number }>
  finalResult: string
  confidence: number
  matchLevel: MatchLevel
  secondaryConditions: string[]
  officerAlert?: string
  symptomMatches: Record<string, number>
  inconclusive: boolean
  differentiation: Differentiation
  severity: SeverityLevel
  severityScore: number
  evidence: string[]
  rankings: BudRankedCondition[]
  code: BudConditionCode | 'INC'
  typeLabel: string
  cause: string
  riskFactors: string[]
  whatHappensIfWorse: string
  whatToDoNow: string
  prevention: string[]
  management: string[]
  officerReferral: boolean
  referralPriority?: 'standard' | 'high' | 'urgent'
  disclaimer: string
  matchBandLabel: string
  rbbCrossCheckRpw?: boolean
  suggestLeafModule?: boolean
}

type ScoreMap = Record<BudConditionCode, number>
type MaxMap = Record<BudConditionCode, number>

function emptyScores(): ScoreMap {
  return { BR: 0, RPW: 0, RBB: 0, PLB: 0, PHY: 0 }
}

function getAns(symptoms: Record<string, string | boolean>, key: string): string {
  const v = symptoms[key]
  if (v === true) return 'yes'
  if (v === false) return 'no'
  if (typeof v === 'string') return v.trim().toLowerCase()
  return ''
}

function isYes(symptoms: Record<string, string | boolean>, key: string): boolean {
  return getAns(symptoms, key) === 'yes'
}

function isApplicable(ans: string): boolean {
  return ans !== '' && ans !== 'unsure' && ans !== 'unknown' && ans !== 'not_sure'
}

function applySingleChoice(
  scores: ScoreMap,
  maxes: MaxMap,
  answer: string,
  table: Record<string, Partial<ScoreMap>>,
): void {
  if (!isApplicable(answer)) return
  for (const code of BUD_CONDITION_CODES) {
    let qMax = 0
    for (const opt of Object.values(table)) {
      qMax = Math.max(qMax, opt[code] ?? 0)
    }
    maxes[code] += qMax
  }
  const row = table[answer]
  if (!row) return
  for (const code of BUD_CONDITION_CODES) {
    scores[code] += row[code] ?? 0
  }
}

function applyYesNo(
  scores: ScoreMap,
  maxes: MaxMap,
  answer: string,
  yesWeights: Partial<ScoreMap>,
): void {
  if (!isApplicable(answer)) return
  for (const code of BUD_CONDITION_CODES) {
    maxes[code] += yesWeights[code] ?? 0
  }
  if (answer === 'yes') {
    for (const code of BUD_CONDITION_CODES) {
      scores[code] += yesWeights[code] ?? 0
    }
  }
}

function matchBand(scorePct: number): string {
  if (scorePct >= 85) return 'Very high match'
  if (scorePct >= 70) return 'High match'
  if (scorePct >= 50) return 'Moderate match'
  if (scorePct >= 30) return 'Low match'
  return 'Very low match'
}

function matchLevelFromScore(
  scorePct: number,
  differentiation: Differentiation,
  inconclusive: boolean,
): MatchLevel {
  if (inconclusive) return 'uncertain'
  if (scorePct >= 70 && (differentiation === 'strong' || differentiation === 'good')) return 'high'
  if (scorePct >= 50) return 'moderate'
  return 'uncertain'
}

function severityLabel(score: number): SeverityLevel {
  if (score > 60) return 'critical'
  if (score >= 36) return 'severe'
  if (score >= 16) return 'moderate'
  return 'mild'
}

function differentiationFromMargin(margin: number): Differentiation {
  if (margin >= 25) return 'strong'
  if (margin >= 15) return 'good'
  if (margin >= 8) return 'some_uncertainty'
  return 'ambiguous'
}

export function getBudMatchLevelLabel(level: MatchLevel): string {
  if (level === 'high') return 'High symptom-supported match'
  if (level === 'moderate') return 'Moderate match — review carefully'
  return 'Uncertain / low specificity'
}

export function scoreBudQuestionnaire(
  symptoms: Record<string, string | boolean>,
): BudQuestionnaireResult {
  const scores = emptyScores()
  const maxes = emptyScores()
  const evidence: string[] = []

  // Q1 age
  applySingleChoice(scores, maxes, getAns(symptoms, 'bc_q1_age'), {
    lt3: { BR: 7, RPW: 2, RBB: 12, PLB: 12, PHY: 3 },
    '3to5': { BR: 8, RPW: 12, RBB: 10, PLB: 10, PHY: 3 },
    '6to15': { BR: 8, RPW: 12, RBB: 7, PLB: 4, PHY: 3 },
    gt15: { BR: 7, RPW: 3, RBB: 3, PLB: 2, PHY: 3 },
  })

  // Q2 spear condition
  const spear = getAns(symptoms, 'bc_q2_spear')
  applySingleChoice(scores, maxes, spear === 'normal' ? '' : spear, {
    dull: { BR: 10, RPW: 3, RBB: 4, PLB: 4, PHY: 2 },
    yellow: { BR: 12, RPW: 8, RBB: 6, PLB: 6, PHY: 2 },
    wilting: { BR: 20, RPW: 12, RBB: 8, PLB: 7, PHY: 5 },
    brown: { BR: 22, RPW: 10, RBB: 10, PLB: 9, PHY: 7 },
  })
  if (spear === 'wilting') evidence.push('Central spear leaf wilting')
  if (spear === 'brown') evidence.push('Spear leaf brown / dry')
  if (spear === 'dull') evidence.push('Spear leaf dull / loss of lustre')
  if (spear === 'yellow') evidence.push('Spear leaf yellowing')

  // Q3 pullable spear
  const pullable = getAns(symptoms, 'bc_q3_pullable')
  applyYesNo(scores, maxes, pullable, { BR: 35, RPW: 10, RBB: 5, PLB: 2, PHY: 4 })
  if (pullable === 'yes') evidence.push('Spear leaf pulls out unusually easily')

  // Q4 spear base colour
  const spearBase = getAns(symptoms, 'bc_q4_spear_base')
  applySingleChoice(scores, maxes, spearBase === 'no' ? '' : spearBase, {
    yellow: { BR: 12, RPW: 5, RBB: 4, PLB: 7, PHY: 2 },
    brown: { BR: 18, RPW: 7, RBB: 5, PLB: 8, PHY: 3 },
    dark: { BR: 22, RPW: 8, RBB: 6, PLB: 5, PHY: 4 },
  })
  if (spearBase === 'brown' || spearBase === 'dark') {
    evidence.push('Discoloured tissue at base of spear leaf')
  }

  // Q5 soft rot
  const softRot = getAns(symptoms, 'bc_q5_soft_rot')
  applyYesNo(scores, maxes, softRot, { BR: 30, RPW: 12, RBB: 7, PLB: 4, PHY: 4 })
  if (softRot === 'yes') evidence.push('Soft or rotten tissue around the bud')

  // Q6 foul smell
  const foul = getAns(symptoms, 'bc_q6_foul')
  applyYesNo(scores, maxes, foul, { BR: 35, RPW: 10, RBB: 3, PLB: 1, PHY: 1 })
  if (foul === 'yes') evidence.push('Foul / unpleasant smell from the bud')

  // Q7 bud breaking / falling
  const budFall = getAns(symptoms, 'bc_q7_bud_fall')
  applyYesNo(scores, maxes, budFall, { BR: 30, RPW: 24, RBB: 15, PLB: 3, PHY: 10 })
  if (budFall === 'yes') evidence.push('Central bud breaking away or falling')

  // Q8 holes
  const holes = getAns(symptoms, 'bc_q8_holes')
  applySingleChoice(scores, maxes, holes === 'none' || holes === 'no' ? '' : holes, {
    one: { BR: 1, RPW: 15, RBB: 20, PLB: 2, PHY: 3 },
    several: { BR: 1, RPW: 28, RBB: 18, PLB: 2, PHY: 4 },
  })
  if (holes === 'one') evidence.push('One hole in or around the crown')
  if (holes === 'several') evidence.push('Several holes in or around the crown')

  // Q9 hole location
  const holeLoc = getAns(symptoms, 'bc_q9_hole_loc')
  if (holes === 'one' || holes === 'several') {
    applySingleChoice(scores, maxes, holeLoc, {
      bud_base: { BR: 2, RPW: 12, RBB: 25, PLB: 2, PHY: 2 },
      inside_crown: { BR: 2, RPW: 22, RBB: 18, PLB: 2, PHY: 2 },
      petiole: { BR: 1, RPW: 18, RBB: 12, PLB: 2, PHY: 2 },
      multiple: { BR: 1, RPW: 25, RBB: 16, PLB: 2, PHY: 3 },
    })
    if (holeLoc === 'bud_base') evidence.push('Hole mainly at base of bud')
    if (holeLoc === 'inside_crown' || holeLoc === 'multiple') {
      evidence.push('Holes inside / across the crown')
    }
  }

  // Q10 frass
  const frass = getAns(symptoms, 'bc_q10_frass')
  applyYesNo(scores, maxes, frass, { RPW: 22, RBB: 25, PLB: 3 })
  if (frass === 'yes') evidence.push('Fresh chewed fibre / frass from a hole')

  // Q11 viscous fluid
  const viscous = getAns(symptoms, 'bc_q11_viscous')
  applyYesNo(scores, maxes, viscous, { BR: 5, RPW: 30, RBB: 6, PLB: 1, PHY: 2 })
  if (viscous === 'yes') evidence.push('Thick brown sticky fluid oozing from a crown hole')

  // Q12 crunch
  const crunch = getAns(symptoms, 'bc_q12_crunch')
  applyYesNo(scores, maxes, crunch, { RPW: 40, RBB: 5, PLB: 1 })
  if (crunch === 'yes') evidence.push('Chewing / crunching sounds inside crown or trunk')

  // Q13 cocoons
  const cocoon = getAns(symptoms, 'bc_q13_cocoon')
  applyYesNo(scores, maxes, cocoon, { RPW: 40, RBB: 2 })
  if (cocoon === 'yes') evidence.push('Fibrous cocoons at bases of leaf stalks')

  // Q14 V-cuts
  const vcuts = getAns(symptoms, 'bc_q14_vcuts')
  applyYesNo(scores, maxes, vcuts, { RPW: 3, RBB: 40, PLB: 7, PHY: 2 })
  if (vcuts === 'yes') evidence.push('V-shaped / geometric cuts on newly opened leaves')

  // Q15 bud-base frass
  const budFrass = getAns(symptoms, 'bc_q15_bud_frass')
  applyYesNo(scores, maxes, budFrass, { RPW: 10, RBB: 35, PLB: 2 })
  if (budFrass === 'yes') evidence.push('Fresh frass around an entry hole at base of the bud')

  // Q16 crooked leaves
  const crooked = getAns(symptoms, 'bc_q16_crooked')
  applyYesNo(scores, maxes, crooked, { BR: 5, RPW: 8, RBB: 28, PLB: 15, PHY: 8 })
  if (crooked === 'yes') evidence.push('New leaves crooked or malformed')

  // Q17 flag leaf broken
  const flagLeaf = getAns(symptoms, 'bc_q17_flag')
  applyYesNo(scores, maxes, flagLeaf, { BR: 7, RPW: 12, RBB: 25, PLB: 8, PHY: 15 })
  if (flagLeaf === 'yes') evidence.push('Flag / young central leaf broken')

  // Q18 brown patches young leaves
  const brownPatches = getAns(symptoms, 'bc_q18_brown_patches')
  applyYesNo(scores, maxes, brownPatches, { BR: 7, RPW: 3, RBB: 8, PLB: 35, PHY: 2 })
  if (brownPatches === 'yes') evidence.push('Brown patches mainly on very young / unopened crown leaves')

  // Q19 superficial
  const superficial = getAns(symptoms, 'bc_q19_superficial')
  applyYesNo(scores, maxes, superficial, { BR: 3, RBB: 4, PLB: 25, PHY: 5 })
  if (superficial === 'yes') evidence.push('Damage looks superficial rather than a deep hole')

  // Q20 small insects on young leaves
  const insects = getAns(symptoms, 'bc_q20_insects')
  applyYesNo(scores, maxes, insects, { RPW: 2, RBB: 8, PLB: 30 })
  if (insects === 'yes') evidence.push('Small beetles/larvae on damaged young bud leaves')

  // Q21 bud tilting
  const tilt = getAns(symptoms, 'bc_q21_tilt')
  applyYesNo(scores, maxes, tilt, { BR: 12, RPW: 30, RBB: 12, PLB: 3, PHY: 12 })
  if (tilt === 'yes') evidence.push('Bud tilting / slanting')

  // Q22 nearby fronds wilting
  const fronds = getAns(symptoms, 'bc_q22_fronds')
  applySingleChoice(scores, maxes, fronds === 'none' ? '' : fronds, {
    few: { BR: 10, RPW: 7, RBB: 5, PLB: 5, PHY: 3 },
    several: { BR: 20, RPW: 12, RBB: 8, PLB: 7, PHY: 5 },
    most: { BR: 28, RPW: 20, RBB: 12, PLB: 10, PHY: 10 },
  })
  if (fronds === 'several' || fronds === 'most') {
    evidence.push('Nearby crown fronds wilting')
  }

  // Q23 lower leaves green
  const lowerGreen = getAns(symptoms, 'bc_q23_lower_green')
  applyYesNo(scores, maxes, lowerGreen, { BR: 25, RPW: 8, RBB: 5, PLB: 5, PHY: 5 })
  if (lowerGreen === 'yes') evidence.push('Lower / older leaves still healthy green while crown dies')

  // Q24 nut fall
  const nutFall = getAns(symptoms, 'bc_q24_nut_fall')
  applyYesNo(scores, maxes, nutFall, { BR: 15, RPW: 7, RBB: 4, PLB: 2, PHY: 4 })
  if (nutFall === 'yes') evidence.push('Immature nuts falling unusually')

  // Q25 inflorescence dry
  const infloresc = getAns(symptoms, 'bc_q25_infloresc')
  applyYesNo(scores, maxes, infloresc, { BR: 15, RPW: 5, RBB: 3, PLB: 1, PHY: 3 })
  if (infloresc === 'yes') evidence.push('Inflorescences / flower structures drying')

  // Q26 humidity
  const humidity = getAns(symptoms, 'bc_q26_humidity')
  applyYesNo(scores, maxes, humidity, { BR: 15, RPW: 1, RBB: 1, PLB: 2, PHY: 3 })
  if (humidity === 'yes') evidence.push('Recent prolonged wet / high-humidity weather')

  // Q27 flooding
  const flood = getAns(symptoms, 'bc_q27_flood')
  applyYesNo(scores, maxes, flood, { BR: 12, RPW: 2, RBB: 1, PLB: 1, PHY: 10 })
  if (flood === 'yes') evidence.push('Palm in frequently flooded / waterlogged area')

  // Q28 shade
  const shade = getAns(symptoms, 'bc_q28_shade')
  applyYesNo(scores, maxes, shade, { BR: 10, RPW: 1, RBB: 1, PLB: 2, PHY: 2 })
  if (shade === 'yes') evidence.push('Young palm heavily shaded by older palms')

  // Q29 fresh wound
  const wound = getAns(symptoms, 'bc_q29_wound')
  applyYesNo(scores, maxes, wound, { BR: 2, RPW: 20, RBB: 5, PLB: 1, PHY: 20 })
  if (wound === 'yes') evidence.push('Recent fresh wound on the palm')

  // Q30 physical event
  const physical = getAns(symptoms, 'bc_q30_physical')
  applyYesNo(scores, maxes, physical, { BR: 2, RPW: 5, RBB: 3, PLB: 1, PHY: 35 })
  if (physical === 'yes') {
    evidence.push('Crown recently broken or damaged by wind, objects, pruning, or force')
  }

  // ========== Signature rules ==========
  const spearWilting = spear === 'wilting' || spear === 'brown'
  if (spearWilting && pullable === 'yes' && foul === 'yes') {
    scores.BR += 40
    evidence.push('Signature: wilting spear + pullable spear + foul smell')
    if (softRot === 'yes') scores.BR += 15
  }

  const rpwIndicators = [
    holes === 'one' || holes === 'several',
    frass === 'yes',
    viscous === 'yes',
    crunch === 'yes',
    cocoon === 'yes',
    tilt === 'yes',
  ]
  const rpwCount = rpwIndicators.filter(Boolean).length
  if (rpwCount >= 4) scores.RPW += 40
  else if (rpwCount >= 3) scores.RPW += 25
  else if (rpwCount >= 2) scores.RPW += 15

  const budHole =
    (holes === 'one' || holes === 'several') &&
    (holeLoc === 'bud_base' || holeLoc === 'inside_crown' || holeLoc === 'petiole' || holeLoc === 'multiple')
  if (budHole && (frass === 'yes' || budFrass === 'yes') && vcuts === 'yes') {
    scores.RBB += 40
    if (crooked === 'yes') scores.RBB += 10
  }

  const deepHole = holes === 'one' || holes === 'several'
  if (brownPatches === 'yes' && superficial === 'yes' && !deepHole) {
    scores.PLB += 30
  }

  if (
    physical === 'yes' &&
    softRot !== 'yes' &&
    foul !== 'yes' &&
    rpwCount < 2 &&
    !(budHole && vcuts === 'yes')
  ) {
    scores.PHY += 35
  }

  // ========== Negative evidence ==========
  if (spear !== 'wilting' && spear !== 'brown' && softRot !== 'yes' && foul !== 'yes') {
    scores.BR *= 0.45
  }
  if (
    holes !== 'one' &&
    holes !== 'several' &&
    frass !== 'yes' &&
    crunch !== 'yes' &&
    cocoon !== 'yes'
  ) {
    scores.RPW *= 0.4
  }
  if (
    !budHole &&
    frass !== 'yes' &&
    budFrass !== 'yes' &&
    vcuts !== 'yes'
  ) {
    scores.RBB *= 0.4
  }
  if (brownPatches !== 'yes' && superficial !== 'yes') {
    scores.PLB *= 0.4
  }

  // Normalize
  const matchPct = emptyScores()
  for (const code of BUD_CONDITION_CODES) {
    const max = maxes[code]
    if (max <= 0) matchPct[code] = 0
    else matchPct[code] = Math.min(100, Math.round((scores[code] / max) * 1000) / 10)
  }

  const rankings: BudRankedCondition[] = BUD_CONDITION_CODES.map((code) => ({
    code,
    name: BUD_CONDITION_PROFILES[code].name,
    category: BUD_CONDITION_PROFILES[code].category,
    matchScore: matchPct[code],
  })).sort((a, b) => b.matchScore - a.matchScore)

  let top = rankings[0]!
  let second = rankings[1]!
  let margin = top.matchScore - second.matchScore
  let differentiation = differentiationFromMargin(margin)

  const signatureHit: Record<BudConditionCode, boolean> = {
    BR: spearWilting && pullable === 'yes' && foul === 'yes',
    RPW: rpwCount >= 3,
    RBB: Boolean(budHole && (frass === 'yes' || budFrass === 'yes') && vcuts === 'yes'),
    PLB: brownPatches === 'yes' && superficial === 'yes' && !deepHole,
    PHY: physical === 'yes' && softRot !== 'yes' && foul !== 'yes',
  }

  const minEvidenceOk =
    (signatureHit[top.code] && evidence.length >= 3) ||
    evidence.length >= 4 ||
    top.matchScore < 50

  let inconclusive =
    differentiation === 'ambiguous' ||
    top.matchScore < 50 ||
    (top.matchScore < 70 && !signatureHit[top.code]) ||
    !minEvidenceOk

  if (margin < 8 && top.matchScore >= 40) inconclusive = true

  // Severity
  let severityScore = 0
  if (spear === 'dull' || spear === 'yellow') severityScore += 3
  if (spear === 'wilting') severityScore += 8
  if (spear === 'brown') severityScore += 12
  if (pullable === 'yes') severityScore += 18
  if (spearBase === 'yellow' || spearBase === 'brown') severityScore += 5
  if (softRot === 'yes') severityScore += 15
  if (foul === 'yes') severityScore += 20
  if (budFall === 'yes') severityScore += 30
  if (holes === 'one') severityScore += 5
  if (holes === 'several') severityScore += 12
  if (frass === 'yes' || budFrass === 'yes') severityScore += 8
  if (crunch === 'yes') severityScore += 15
  if (cocoon === 'yes') severityScore += 15
  if (fronds === 'few') severityScore += 5
  if (fronds === 'several') severityScore += 12
  if (fronds === 'most') severityScore += 18
  if (tilt === 'yes') severityScore += 20
  if (budFall === 'yes') severityScore += 10
  const severity = severityLabel(severityScore)

  const code: BudConditionCode | 'INC' = inconclusive ? 'INC' : top.code
  const profile = inconclusive ? null : BUD_CONDITION_PROFILES[top.code]

  let officerAlert: string | undefined
  if (!inconclusive && profile?.officerReferral) {
    if (profile.referralPriority === 'urgent') {
      officerAlert = 'Urgent agricultural inspection recommended'
    } else if (profile.referralPriority === 'high') {
      officerAlert = 'High-priority agricultural inspection recommended'
    } else if (severity === 'severe' || severity === 'critical') {
      officerAlert = 'Professional inspection should be arranged soon'
    } else if (profile.conservative) {
      officerAlert = 'Seek agricultural advice if damage continues or spreads'
    }
  }

  const secondaryConditions = rankings
    .slice(1)
    .filter((r) => r.matchScore >= 45 && r.matchScore >= top.matchScore - 25)
    .map((r) => r.name)
    .slice(0, 2)

  if (top.code === 'RBB' && !inconclusive) {
    secondaryConditions.unshift(
      'Also check for Red Palm Weevil (Black Beetle wounds can attract weevils)',
    )
  }

  const leafletSurfaceDamage = getAns(symptoms, 'bc_leaflet_surface') === 'yes'
  const suggestLeafModule =
    leafletSurfaceDamage ||
    (!deepHole &&
      foul !== 'yes' &&
      softRot !== 'yes' &&
      pullable !== 'yes' &&
      brownPatches !== 'yes' &&
      getAns(symptoms, 'bc_q_leaf_redirect') === 'yes')

  const predictions = rankings.map((r) => ({
    label: r.name,
    probability: r.matchScore / 100,
  }))

  const typeLabel = inconclusive
    ? 'Inconclusive'
    : profile!.category === 'disease'
      ? 'Fungal disease'
      : profile!.category === 'pest'
        ? 'Pest infestation'
        : 'Physical / environmental damage'

  return {
    predictions,
    finalResult: inconclusive
      ? 'Inconclusive — symptoms are not specific enough'
      : profile!.name,
    confidence: inconclusive ? Math.min(0.49, top.matchScore / 100) : top.matchScore / 100,
    matchLevel: matchLevelFromScore(top.matchScore, differentiation, inconclusive),
    secondaryConditions,
    officerAlert,
    symptomMatches: Object.fromEntries(BUD_CONDITION_CODES.map((c) => [c, matchPct[c]])),
    inconclusive,
    differentiation,
    severity,
    severityScore,
    evidence: evidence.slice(0, 12),
    rankings,
    code,
    typeLabel,
    cause: inconclusive
      ? 'Reported signs overlap several bud/crown conditions. Check spear pull-out, foul smell, holes, frass, crunching, V-cuts, and brown patches on young leaves—or request a field inspection.'
      : profile!.causes,
    riskFactors: inconclusive ? [] : profile!.riskFactors,
    whatHappensIfWorse: inconclusive
      ? 'Without a clearer pattern, growing-point pests or rot may progress unnoticed.'
      : profile!.whatHappensIfWorse,
    whatToDoNow: inconclusive
      ? 'Re-check spear pull-out, bud softness/smell, crown holes, fibres, internal feeding, geometric leaf cuts, and brown patches limited to young bud leaves. Then resubmit or contact an officer.'
      : profile!.whatToDoNow,
    prevention: inconclusive ? [] : profile!.prevention,
    management: inconclusive ? [] : profile!.management,
    officerReferral: inconclusive ? true : Boolean(profile!.officerReferral),
    referralPriority: inconclusive ? 'standard' : profile!.referralPriority,
    disclaimer: BUD_DISCLAIMER,
    matchBandLabel: matchBand(top.matchScore),
    rbbCrossCheckRpw: top.code === 'RBB' && !inconclusive,
    suggestLeafModule,
  }
}
