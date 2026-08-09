import {
  FRUIT_CONDITION_CODES,
  FRUIT_CONDITION_PROFILES,
  FRUIT_DISCLAIMER,
  type FruitConditionCode,
} from '../constants/fruitNutDiseases.js'

export type MatchLevel = 'high' | 'moderate' | 'uncertain'
export type Differentiation = 'strong' | 'good' | 'some_uncertainty' | 'ambiguous'
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical'

export interface FruitRankedCondition {
  code: FruitConditionCode
  name: string
  category: 'pest' | 'physiological' | 'environmental'
  matchScore: number
}

export interface FruitQuestionnaireResult {
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
  rankings: FruitRankedCondition[]
  code: FruitConditionCode | 'INC'
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
  suggestLeafModule?: boolean
}

type ScoreMap = Record<FruitConditionCode, number>
type MaxMap = Record<FruitConditionCode, number>

function emptyScores(): ScoreMap {
  return { CM: 0, CS: 0, CC: 0, RAT: 0, PNF: 0, PHY: 0 }
}

function getAns(symptoms: Record<string, string | boolean>, key: string): string {
  const v = symptoms[key]
  if (v === true) return 'yes'
  if (v === false) return 'no'
  if (typeof v === 'string') return v.trim().toLowerCase()
  return ''
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
  for (const code of FRUIT_CONDITION_CODES) {
    let qMax = 0
    for (const opt of Object.values(table)) {
      qMax = Math.max(qMax, opt[code] ?? 0)
    }
    maxes[code] += qMax
  }
  const row = table[answer]
  if (!row) return
  for (const code of FRUIT_CONDITION_CODES) {
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
  for (const code of FRUIT_CONDITION_CODES) {
    maxes[code] += yesWeights[code] ?? 0
  }
  if (answer === 'yes') {
    for (const code of FRUIT_CONDITION_CODES) {
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

export function getFruitMatchLevelLabel(level: MatchLevel): string {
  if (level === 'high') return 'High symptom-supported match'
  if (level === 'moderate') return 'Moderate match — review carefully'
  return 'Uncertain / low specificity'
}

export function scoreFruitQuestionnaire(
  symptoms: Record<string, string | boolean>,
): FruitQuestionnaireResult {
  const scores = emptyScores()
  const maxes = emptyScores()
  const evidence: string[] = []

  // Q1 nut age
  applySingleChoice(scores, maxes, getAns(symptoms, 'fr_q1_age'), {
    button: { CM: 7, CS: 2, CC: 1, RAT: 3, PNF: 12, PHY: 2 },
    '1to2': { CM: 10, CS: 3, CC: 2, RAT: 5, PNF: 10, PHY: 2 },
    '3to6': { CM: 20, CS: 5, CC: 3, RAT: 15, PNF: 8, PHY: 2 },
    '7to8': { CM: 10, CS: 5, CC: 3, RAT: 15, PNF: 7, PHY: 2 },
    mature: { CM: 2, CS: 5, CC: 4, RAT: 8, PNF: 2, PHY: 3 },
  })
  const nutAge = getAns(symptoms, 'fr_q1_age')
  if (nutAge === '3to6') evidence.push('Affected nut around 3–6 months (high mite vulnerability window)')
  if (nutAge === '7to8') evidence.push('Affected nut around 7–8 months (notable for rat susceptibility)')

  // Q2 damage origin
  const origin = getAns(symptoms, 'fr_q2_origin')
  applySingleChoice(scores, maxes, origin, {
    below_perianth: { CM: 30, CS: 5, CC: 2, RAT: 2, PNF: 1, PHY: 2 },
    middle: { CM: 5, CS: 7, CC: 8, RAT: 8, PNF: 1, PHY: 8 },
    bottom: { CM: 3, CS: 5, CC: 5, RAT: 5, PNF: 1, PHY: 8 },
    entire: { CM: 10, CS: 15, CC: 8, RAT: 4, PNF: 1, PHY: 5 },
    random: { CM: 2, CS: 4, CC: 5, RAT: 15, PNF: 1, PHY: 15 },
  })
  if (origin === 'below_perianth') evidence.push('Visible damage begins immediately below the floral cap / perianth')
  if (origin === 'random') evidence.push('Damage appears at a random point (not a classic perianth pattern)')

  // Q3–Q5 mite progression
  const triangle = getAns(symptoms, 'fr_q3_triangle')
  applyYesNo(scores, maxes, triangle, { CM: 40, CS: 4, CC: 2, RAT: 0, PNF: 0, PHY: 1 })
  if (triangle === 'yes') {
    evidence.push('Pale yellow / cream / white triangular patch beginning below the perianth')
  }

  const corky = getAns(symptoms, 'fr_q4_corky')
  applyYesNo(scores, maxes, corky, { CM: 30, CS: 7, CC: 10, RAT: 1, PNF: 1, PHY: 5 })
  if (corky === 'yes') evidence.push('Patch has become brown, dry, corky or necrotic')

  const downward = getAns(symptoms, 'fr_q5_downward')
  applyYesNo(scores, maxes, downward, { CM: 30, CS: 3, CC: 3, RAT: 0, PNF: 0, PHY: 2 })
  if (downward === 'yes') evidence.push('Damaged patch expands downward from the perianth')

  // Q6–Q10 deformation
  const smallNut = getAns(symptoms, 'fr_q6_small')
  applyYesNo(scores, maxes, smallNut, { CM: 25, CS: 5, CC: 3, RAT: 5, PNF: 15, PHY: 3 })
  if (smallNut === 'yes') evidence.push('Nut noticeably smaller than others of the same age')

  const deformed = getAns(symptoms, 'fr_q7_deformed')
  applyYesNo(scores, maxes, deformed, { CM: 30, CS: 4, CC: 4, RAT: 6, PNF: 7, PHY: 10 })
  if (deformed === 'yes') evidence.push('Nut deformed or irregular in shape')

  const cracks = getAns(symptoms, 'fr_q8_cracks')
  applyYesNo(scores, maxes, cracks, { CM: 28, CS: 3, CC: 2, RAT: 5, PNF: 3, PHY: 12 })
  if (cracks === 'yes') evidence.push('Deep cracks or fissures in the nut surface')

  const yCrack = getAns(symptoms, 'fr_q9_y_crack')
  applyYesNo(scores, maxes, yCrack, { CM: 40, CS: 1, CC: 1, RAT: 0, PNF: 0, PHY: 2 })
  if (yCrack === 'yes') evidence.push('Y-shaped cracking pattern near the perianth')

  const gummy = getAns(symptoms, 'fr_q10_gummy')
  applyYesNo(scores, maxes, gummy, { CM: 25, CS: 3, CC: 2, RAT: 3, PNF: 2, PHY: 6 })
  if (gummy === 'yes') evidence.push('Sticky or gummy material from cracks')

  // Q11–Q13 scale
  const scaleInsects = getAns(symptoms, 'fr_q11_scale')
  applyYesNo(scores, maxes, scaleInsects, { CM: 2, CS: 35, CC: 2, RAT: 0, PNF: 0, PHY: 1 })
  if (scaleInsects === 'yes') evidence.push('Many tiny scale-like spots attached to the nut surface')

  const encrust = getAns(symptoms, 'fr_q12_encrust')
  applyYesNo(scores, maxes, encrust, { CM: 3, CS: 40, CC: 2, RAT: 0, PNF: 0, PHY: 1 })
  if (encrust === 'yes') evidence.push('Yellowish-white crust / encrustation with tiny insects')

  const leafScale = getAns(symptoms, 'fr_q13_leaf_scale')
  applyYesNo(scores, maxes, leafScale, { CM: 2, CS: 30, CC: 4, RAT: 0, PNF: 2, PHY: 0 })
  if (leafScale === 'yes') evidence.push('Nearby leaves also show yellow spots or scale insects')

  // Q14–Q17 rats
  const gnaw = getAns(symptoms, 'fr_q14_gnaw')
  applyYesNo(scores, maxes, gnaw, { CM: 0, CS: 0, CC: 1, RAT: 45, PNF: 0, PHY: 8 })
  if (gnaw === 'yes') evidence.push('Clear bite or gnaw marks on the nut')

  const huskHole = getAns(symptoms, 'fr_q15_hole')
  applyYesNo(scores, maxes, huskHole, { CM: 0, CS: 0, CC: 1, RAT: 40, PNF: 0, PHY: 10 })
  if (huskHole === 'yes') evidence.push('Hole through the husk into the nut')

  const kernel = getAns(symptoms, 'fr_q16_kernel')
  applyYesNo(scores, maxes, kernel, { CM: 0, CS: 0, CC: 0, RAT: 40, PNF: 0, PHY: 2 })
  if (kernel === 'yes') evidence.push('Kernel eaten and/or nut water missing')

  const rodents = getAns(symptoms, 'fr_q17_rodents')
  applyYesNo(scores, maxes, rodents, { CM: 0, CS: 0, CC: 0, RAT: 25, PNF: 0, PHY: 0 })
  if (rodents === 'yes') evidence.push('Rats, nests, or rodent activity observed around palms')

  // Q18–Q20 caterpillar
  const scrape = getAns(symptoms, 'fr_q18_scrape')
  applyYesNo(scores, maxes, scrape, { CM: 8, CS: 5, CC: 25, RAT: 2, PNF: 0, PHY: 15 })
  if (scrape === 'yes') evidence.push('Mainly shallow / superficial scraping of the outer nut skin')

  const brownLeaves = getAns(symptoms, 'fr_q19_brown_leaves')
  applyYesNo(scores, maxes, brownLeaves, { CM: 2, CS: 8, CC: 30, RAT: 0, PNF: 4, PHY: 0 })
  if (brownLeaves === 'yes') evidence.push('Many lower leaves brown and dried')

  const galleries = getAns(symptoms, 'fr_q20_galleries')
  applyYesNo(scores, maxes, galleries, { CM: 0, CS: 1, CC: 40, RAT: 0, PNF: 0, PHY: 0 })
  if (galleries === 'yes') evidence.push('Caterpillar galleries / webbing on lower surfaces of damaged leaves')

  // Q21 nut fall
  const nutFall = getAns(symptoms, 'fr_q21_fall')
  applySingleChoice(scores, maxes, nutFall, {
    few: { CM: 7, CS: 3, CC: 2, RAT: 5, PNF: 10, PHY: 4 },
    many: { CM: 15, CS: 5, CC: 3, RAT: 7, PNF: 20, PHY: 5 },
    severe: { CM: 20, CS: 5, CC: 3, RAT: 8, PNF: 30, PHY: 7 },
    no: {},
  })
  if (nutFall === 'many' || nutFall === 'severe') {
    evidence.push(
      nutFall === 'severe' ? 'Severe immature nut fall' : 'Many immature nuts falling before maturity',
    )
  } else if (nutFall === 'few') {
    evidence.push('A few immature nuts falling')
  }

  // Q22 fallen nuts mite scars (yes & no both score)
  const fallenMite = getAns(symptoms, 'fr_q22_fallen_mite')
  applySingleChoice(scores, maxes, fallenMite, {
    yes: { CM: 35, PNF: 2 },
    no: { CM: 0, PNF: 15 },
  })
  if (fallenMite === 'yes') evidence.push('Fallen nuts show characteristic mite scars')
  if (fallenMite === 'no' && (nutFall === 'few' || nutFall === 'many' || nutFall === 'severe')) {
    evidence.push('Fallen nuts lack characteristic mite scars')
  }

  // Q23 fallen nuts gnaw
  const fallenGnaw = getAns(symptoms, 'fr_q23_fallen_gnaw')
  applySingleChoice(scores, maxes, fallenGnaw, {
    yes: { RAT: 35, PNF: 2 },
    no: { RAT: 0, PNF: 5 },
  })
  if (fallenGnaw === 'yes') evidence.push('Fallen nuts show bite / gnaw damage')

  // Q24–Q26 environment
  const dry = getAns(symptoms, 'fr_q24_dry')
  applyYesNo(scores, maxes, dry, { CM: 10, CS: 15, CC: 5, RAT: 2, PNF: 12, PHY: 2 })
  if (dry === 'yes') evidence.push('Prolonged dry period recently')

  const drought = getAns(symptoms, 'fr_q25_drought')
  applyYesNo(scores, maxes, drought, { CM: 5, CS: 5, CC: 3, RAT: 0, PNF: 25, PHY: 5 })
  if (drought === 'yes') evidence.push('Recent serious drought or water stress')

  const mechanical = getAns(symptoms, 'fr_q26_mechanical')
  applyYesNo(scores, maxes, mechanical, { CM: 1, CS: 1, CC: 2, RAT: 2, PNF: 5, PHY: 35 })
  if (mechanical === 'yes') {
    evidence.push('Recent tool, harvest, branch, or wind mechanical injury')
  }

  // —— Signature rules ——
  const miteSig =
    triangle === 'yes' && corky === 'yes'
  if (miteSig) {
    scores.CM += 30
    if (yCrack === 'yes' || deformed === 'yes') scores.CM += 15
  }

  const scaleSig =
    scaleInsects === 'yes' && encrust === 'yes' && leafScale === 'yes'
  if (scaleSig) scores.CS += 35

  const ratSig = gnaw === 'yes' && huskHole === 'yes'
  if (ratSig) {
    scores.RAT += 35
    if (kernel === 'yes') scores.RAT += 20
  }

  const catSig =
    scrape === 'yes' && galleries === 'yes' && brownLeaves === 'yes'
  if (catSig) scores.CC += 30

  const immatureFall =
    nutFall === 'few' || nutFall === 'many' || nutFall === 'severe'
  if (
    immatureFall &&
    !miteSig &&
    !ratSig &&
    !scaleSig &&
    !catSig
  ) {
    scores.PNF += 25
    if (drought === 'yes' || dry === 'yes') scores.PNF += 15
  }

  // Physical damage should not outcompete clear pest signatures
  if (ratSig || miteSig || scaleSig || catSig) {
    scores.PHY *= 0.4
  }
  if (ratSig) {
    scores.PHY *= 0.5
  }
  // Corky scars alone should not inflate caterpillar match without leaf outbreak signs
  if (miteSig && galleries !== 'yes' && brownLeaves !== 'yes') {
    scores.CC *= 0.35
  }
  if (catSig && triangle !== 'yes' && corky !== 'yes') {
    scores.CM *= 0.4
  }

  // —— Negative evidence ——
  if (triangle !== 'yes' && corky !== 'yes' && deformed !== 'yes') {
    scores.CM *= 0.35
  }
  if (gnaw !== 'yes' && huskHole !== 'yes' && kernel !== 'yes') {
    scores.RAT *= 0.3
  }
  if (scaleInsects !== 'yes' && encrust !== 'yes' && leafScale !== 'yes') {
    scores.CS *= 0.3
  }

  // Normalize
  const matchPct = emptyScores()
  for (const code of FRUIT_CONDITION_CODES) {
    const max = maxes[code]
    matchPct[code] = max > 0 ? Math.min(100, (scores[code] / max) * 100) : 0
  }

  const rankings: FruitRankedCondition[] = FRUIT_CONDITION_CODES.map((code) => ({
    code,
    name: FRUIT_CONDITION_PROFILES[code].name,
    category: FRUIT_CONDITION_PROFILES[code].category,
    matchScore: Math.round(matchPct[code] * 10) / 10,
  })).sort((a, b) => b.matchScore - a.matchScore)

  const top = rankings[0]!
  const second = rankings[1]!
  const margin = top.matchScore - second.matchScore
  const differentiation = differentiationFromMargin(margin)

  const signatureHit: Record<FruitConditionCode, boolean> = {
    CM: miteSig || (triangle === 'yes' && (yCrack === 'yes' || downward === 'yes')),
    CS: scaleSig || (scaleInsects === 'yes' && encrust === 'yes'),
    CC: catSig,
    RAT: ratSig || (gnaw === 'yes' && kernel === 'yes'),
    PNF:
      immatureFall &&
      !miteSig &&
      !ratSig &&
      triangle !== 'yes' &&
      gnaw !== 'yes',
    PHY: mechanical === 'yes' && triangle !== 'yes' && gnaw !== 'yes',
  }

  const minEvidenceOk =
    (signatureHit[top.code] && evidence.length >= 2) ||
    evidence.length >= 4 ||
    top.matchScore < 50

  let inconclusive =
    differentiation === 'ambiguous' ||
    top.matchScore < 50 ||
    (top.matchScore < 70 && !signatureHit[top.code]) ||
    !minEvidenceOk

  if (margin < 8 && top.matchScore >= 40) {
    // Keep a confident signature diagnosis even if a secondary score is close
    if (!(signatureHit[top.code] && top.matchScore >= 70)) {
      inconclusive = true
    }
  }

  // Severity (separate from match)
  let severityScore = 0
  if (triangle === 'yes') severityScore += 3
  if (corky === 'yes') severityScore += 12
  if (origin === 'entire') severityScore += 20
  else if (downward === 'yes') severityScore += 7
  if (deformed === 'yes') severityScore += 12
  if (smallNut === 'yes') severityScore += 5
  if (yCrack === 'yes') severityScore += 12
  else if (cracks === 'yes') severityScore += 5
  if (gummy === 'yes') severityScore += 5
  if (nutFall === 'few') severityScore += 5
  if (nutFall === 'many') severityScore += 15
  if (nutFall === 'severe') severityScore += 25
  if (gnaw === 'yes') severityScore += 7
  if (huskHole === 'yes') severityScore += 12
  if (kernel === 'yes') severityScore += 8
  if (scaleInsects === 'yes' && leafScale === 'yes') severityScore += 10
  if (catSig) severityScore += 10
  const severity = severityLabel(severityScore)

  const code: FruitConditionCode | 'INC' = inconclusive ? 'INC' : top.code
  const profile = inconclusive ? null : FRUIT_CONDITION_PROFILES[top.code]

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

  const suggestLeafModule =
    (!inconclusive && (top.code === 'CC' || Boolean(profile?.suggestLeafModule))) ||
    catSig ||
    (galleries === 'yes' && brownLeaves === 'yes')

  const predictions = rankings.map((r) => ({
    label: r.name,
    probability: r.matchScore / 100,
  }))

  let typeLabel = 'Inconclusive'
  if (!inconclusive && profile) {
    if (profile.category === 'pest') typeLabel = 'Pest infestation'
    else if (profile.category === 'physiological') typeLabel = 'Physiological / developmental'
    else typeLabel = 'Physical / environmental damage'
  }

  return {
    predictions,
    finalResult: inconclusive
      ? 'Inconclusive — symptoms are not specific enough'
      : profile!.name,
    confidence: inconclusive ? Math.min(0.49, top.matchScore / 100) : top.matchScore / 100,
    matchLevel: matchLevelFromScore(top.matchScore, differentiation, inconclusive),
    secondaryConditions,
    officerAlert,
    symptomMatches: Object.fromEntries(FRUIT_CONDITION_CODES.map((c) => [c, matchPct[c]])),
    inconclusive,
    differentiation,
    severity,
    severityScore,
    evidence: evidence.slice(0, 12),
    rankings,
    code,
    typeLabel,
    cause: inconclusive
      ? 'Reported fruit signs overlap several conditions. Re-check pale triangular scars below the perianth, corky lesions, scale crusts, gnaw marks, leaf caterpillar galleries, and whether nut fall lacks pest scars—or request a field inspection.'
      : profile!.causes,
    riskFactors: inconclusive ? [] : profile!.riskFactors,
    whatHappensIfWorse: inconclusive
      ? 'Without a clearer pattern, mite damage, rodents, or palm-level stress may continue unnoticed.'
      : profile!.whatHappensIfWorse,
    whatToDoNow: inconclusive
      ? 'Inspect fallen nuts for mite scars and gnaw marks, re-check young nuts near the perianth, scale crusts, and leaf outbreaks, then resubmit or contact an officer.'
      : profile!.whatToDoNow,
    prevention: inconclusive ? [] : profile!.prevention,
    management: inconclusive ? [] : profile!.management,
    officerReferral: inconclusive ? true : Boolean(profile!.officerReferral),
    referralPriority: inconclusive ? 'standard' : profile!.referralPriority,
    disclaimer: FRUIT_DISCLAIMER,
    matchBandLabel: matchBand(top.matchScore),
    suggestLeafModule,
  }
}
