import {
  STEM_CONDITION_CODES,
  STEM_CONDITION_PROFILES,
  STEM_DISCLAIMER,
  type StemConditionCode,
} from '../constants/stemTrunkDiseases.js'

export type MatchLevel = 'high' | 'moderate' | 'uncertain'
export type Differentiation = 'strong' | 'good' | 'some_uncertainty' | 'ambiguous'
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical'

export interface StemRankedCondition {
  code: StemConditionCode
  name: string
  category: 'disease' | 'pest' | 'environmental'
  matchScore: number
}

export interface StemQuestionnaireResult {
  predictions: Array<{ label: string; probability: number }>
  finalResult: string
  /** Match score 0–1 for Fusion/report compatibility (top condition / 100) */
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
  rankings: StemRankedCondition[]
  code: StemConditionCode | 'INC'
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
}

type ScoreMap = Record<StemConditionCode, number>
type MaxMap = Record<StemConditionCode, number>

function emptyScores(): ScoreMap {
  return { STB: 0, GAN: 0, RPW: 0, RBB: 0, TER: 0, ENV: 0 }
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

/**
 * Single-choice: each disease max = max weight across options; obtained only for selected answer.
 */
function applySingleChoice(
  scores: ScoreMap,
  maxes: MaxMap,
  answer: string,
  table: Record<string, Partial<ScoreMap>>,
): void {
  if (!isApplicable(answer)) return

  // max applicable for each disease on this question = max option weight for that disease
  for (const code of STEM_CONDITION_CODES) {
    let qMax = 0
    for (const opt of Object.values(table)) {
      qMax = Math.max(qMax, opt[code] ?? 0)
    }
    maxes[code] += qMax
  }

  const row = table[answer]
  if (!row) return
  for (const code of STEM_CONDITION_CODES) {
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
  for (const code of STEM_CONDITION_CODES) {
    maxes[code] += yesWeights[code] ?? 0
  }
  if (answer === 'yes') {
    for (const code of STEM_CONDITION_CODES) {
      scores[code] += yesWeights[code] ?? 0
    }
  }
}

function applyMultiFlag(
  scores: ScoreMap,
  maxes: MaxMap,
  active: boolean,
  weights: Partial<ScoreMap>,
): void {
  // multi-select: question is applicable if farmer answered the section (any tissue flag exists)
  for (const code of STEM_CONDITION_CODES) {
    maxes[code] += weights[code] ?? 0
  }
  if (active) {
    for (const code of STEM_CONDITION_CODES) {
      scores[code] += weights[code] ?? 0
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

function matchLevelFromScore(scorePct: number, differentiation: Differentiation, inconclusive: boolean): MatchLevel {
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

export function getMatchLevelLabel(level: MatchLevel): string {
  if (level === 'high') return 'High symptom-supported match'
  if (level === 'moderate') return 'Moderate match — review carefully'
  return 'Uncertain / low specificity'
}

export function scoreStemQuestionnaire(
  symptoms: Record<string, string | boolean>,
): StemQuestionnaireResult {
  const scores = emptyScores()
  const maxes = emptyScores()
  const evidence: string[] = []

  // —— Q1 age ——
  applySingleChoice(scores, maxes, getAns(symptoms, 'q1_age'), {
    lt3: { STB: 2, RPW: 2, RBB: 10, TER: 10, ENV: 2 },
    '3to5': { STB: 4, GAN: 1, RPW: 10, RBB: 8, TER: 6, ENV: 2 },
    '6to15': { STB: 5, GAN: 3, RPW: 10, RBB: 6, TER: 3, ENV: 2 },
    gt15: { STB: 5, GAN: 7, RPW: 3, RBB: 2, TER: 3, ENV: 3 },
  })

  // —— Q2 liquid ——
  const liquid = getAns(symptoms, 'q2_liquid')
  applySingleChoice(scores, maxes, liquid === 'no' ? '' : liquid, {
    clear: { STB: 2, GAN: 1, RPW: 2, ENV: 4 },
    yellowish: { STB: 5, GAN: 2, RPW: 3, ENV: 3 },
    reddish: { STB: 25, GAN: 7, RPW: 10, RBB: 1, TER: 1, ENV: 8 },
    dark: { STB: 18, GAN: 8, RPW: 12, RBB: 2, TER: 2, ENV: 7 },
  })
  if (liquid === 'reddish') evidence.push('Reddish-brown / rust-coloured fluid from the trunk')
  if (liquid === 'dark') evidence.push('Dark brown / black fluid from the trunk')

  // —— Q3 longitudinal cracks ——
  const cracks = getAns(symptoms, 'q3_longitudinal')
  applyYesNo(scores, maxes, cracks, { STB: 22, GAN: 5, RPW: 4, RBB: 1, TER: 2, ENV: 6 })
  if (cracks === 'yes') evidence.push('Liquid from vertical / longitudinal bark cracks')

  // —— Q4 dried black patches ——
  const blackPatches = getAns(symptoms, 'q4_black_patches')
  applyYesNo(scores, maxes, blackPatches, { STB: 18, GAN: 6, RPW: 4, RBB: 1, TER: 2, ENV: 4 })
  if (blackPatches === 'yes') evidence.push('Dried dark / black patches where bleeding previously occurred')

  // —— Q5 tissue under bark (multi) ——
  const tissueKeys: Array<{ key: string; label: string; w: Partial<ScoreMap> }> = [
    { key: 'q5_yellow', label: 'Yellow tissue under bark', w: { STB: 12, GAN: 5, RPW: 4, RBB: 1, TER: 3, ENV: 3 } },
    { key: 'q5_brown', label: 'Brown tissue under bark', w: { STB: 12, GAN: 8, RPW: 7, RBB: 2, TER: 5, ENV: 4 } },
    {
      key: 'q5_fibrous',
      label: 'Brown fibrous decayed tissue',
      w: { STB: 18, GAN: 12, RPW: 10, RBB: 3, TER: 8, ENV: 4 },
    },
    { key: 'q5_soft', label: 'Soft / rotten tissue', w: { STB: 10, GAN: 15, RPW: 12, RBB: 4, TER: 8, ENV: 4 } },
    {
      key: 'q5_peeling',
      label: 'Bark peeling off',
      w: { STB: 5, GAN: 10, RPW: 5, RBB: 2, TER: 18, ENV: 6 },
    },
  ]
  const anyTissueAnswered = tissueKeys.some((t) => getAns(symptoms, t.key) === 'yes' || getAns(symptoms, t.key) === 'no')
  // If user toggled any multi-select, count section: only selected yes contribute, max sums of each item when applicable
  const tissueSectionTouched =
    anyTissueAnswered ||
    tissueKeys.some((t) => symptoms[t.key] === true) ||
    getAns(symptoms, 'q5_answered') === 'yes'
  if (tissueSectionTouched || tissueKeys.some((t) => isYes(symptoms, t.key))) {
    for (const t of tissueKeys) {
      const active = isYes(symptoms, t.key) || symptoms[t.key] === true
      // only apply max for items that were considered — if section used multi-select UI, all options are applicable
      applyMultiFlag(scores, maxes, active, t.w)
      if (active) evidence.push(t.label)
    }
  }

  // —— Q6 location ——
  applySingleChoice(scores, maxes, getAns(symptoms, 'q6_location'), {
    base: { STB: 6, GAN: 20, RPW: 5, RBB: 1, TER: 10, ENV: 5 },
    lower: { STB: 10, GAN: 15, RPW: 9, RBB: 1, TER: 10, ENV: 5 },
    middle: { STB: 12, GAN: 4, RPW: 12, RBB: 2, TER: 8, ENV: 5 },
    upper: { STB: 8, GAN: 2, RPW: 15, RBB: 12, TER: 6, ENV: 4 },
    crown: { STB: 2, GAN: 0, RPW: 20, RBB: 22, TER: 2, ENV: 2 },
    multiple: { STB: 10, GAN: 8, RPW: 12, RBB: 7, TER: 10, ENV: 6 },
  })
  const loc = getAns(symptoms, 'q6_location')
  if (loc === 'base') evidence.push('Damage concentrated at palm base')
  if (loc === 'crown') evidence.push('Damage concentrated at bud / crown area')

  // —— Q7 bracket fungus ——
  const bracket = getAns(symptoms, 'q7_bracket')
  applyYesNo(scores, maxes, bracket, { STB: 2, GAN: 40 })
  if (bracket === 'yes') evidence.push('Hard shelf / bracket / mushroom-like growth at the base')

  // —— Q8 holes ——
  const holes = getAns(symptoms, 'q8_holes')
  applySingleChoice(scores, maxes, holes === 'no' ? '' : holes, {
    one: { STB: 2, GAN: 1, RPW: 15, RBB: 12, TER: 3, ENV: 3 },
    several: { STB: 2, GAN: 1, RPW: 25, RBB: 15, TER: 5, ENV: 4 },
  })
  if (holes === 'one') evidence.push('One hole in trunk or crown')
  if (holes === 'several') evidence.push('Several holes in trunk or crown')

  // —— Q9 hole location ——
  const holeLoc = getAns(symptoms, 'q9_hole_location')
  if (holes === 'one' || holes === 'several') {
    applySingleChoice(scores, maxes, holeLoc, {
      trunk: { STB: 1, GAN: 1, RPW: 20, RBB: 5, TER: 4, ENV: 2 },
      base: { STB: 1, GAN: 2, RPW: 12, RBB: 2, TER: 8, ENV: 2 },
      crown: { STB: 1, GAN: 0, RPW: 18, RBB: 22, TER: 1, ENV: 2 },
    })
  }

  // —— Q10 frass ——
  const frass = getAns(symptoms, 'q10_frass')
  applyYesNo(scores, maxes, frass, { STB: 1, RPW: 22, RBB: 20, TER: 4, ENV: 1 })
  if (frass === 'yes') evidence.push('Chewed fibres / frass from a hole')

  // —— Q11 viscous fluid from hole ——
  const viscous = getAns(symptoms, 'q11_viscous')
  applyYesNo(scores, maxes, viscous, { STB: 8, GAN: 3, RPW: 22, RBB: 3, TER: 1, ENV: 2 })
  if (viscous === 'yes') evidence.push('Thick brown sticky / viscous fluid from a hole')

  // —— Q12 crunching ——
  const crunch = getAns(symptoms, 'q12_crunch')
  applyYesNo(scores, maxes, crunch, { RPW: 35, RBB: 4, TER: 2 })
  if (crunch === 'yes') evidence.push('Feeding / crunching noise inside trunk or crown')

  // —— Q13 cocoons ——
  const cocoon = getAns(symptoms, 'q13_cocoon')
  applyYesNo(scores, maxes, cocoon, { RPW: 35, RBB: 1 })
  if (cocoon === 'yes') evidence.push('Fibrous cocoons around petiole bases or under bark')

  // —— Q14 V-cuts ——
  const vcuts = getAns(symptoms, 'q14_vcuts')
  applyYesNo(scores, maxes, vcuts, { RPW: 3, RBB: 35, ENV: 1 })
  if (vcuts === 'yes') evidence.push('V-shaped / geometric cuts on newly opened leaves')

  // —— Q15 fresh frass near bud ——
  const budFrass = getAns(symptoms, 'q15_bud_frass')
  applyYesNo(scores, maxes, budFrass, { RPW: 8, RBB: 30 })
  if (budFrass === 'yes') evidence.push('Fresh fibrous material around a feeding hole near the bud')

  // —— Q16 malformed leaves ——
  const malformed = getAns(symptoms, 'q16_malformed')
  applyYesNo(scores, maxes, malformed, { STB: 2, GAN: 2, RPW: 10, RBB: 24, TER: 3, ENV: 2 })
  if (malformed === 'yes') evidence.push('Youngest leaves crooked, malformed, or damaged')

  // —— Q17 flag leaf ——
  const flagLeaf = getAns(symptoms, 'q17_flag_leaf')
  applyYesNo(scores, maxes, flagLeaf, { STB: 2, GAN: 2, RPW: 13, RBB: 25, TER: 3, ENV: 3 })
  if (flagLeaf === 'yes') evidence.push('Central / flag leaf broken or seriously damaged')

  // —— Q18 mud tunnels ——
  const mud = getAns(symptoms, 'q18_mud')
  applyYesNo(scores, maxes, mud, { GAN: 1, TER: 40 })
  if (mud === 'yes') evidence.push('Mud / soil / earth tunnels along the trunk')

  // —— Q19 termites ——
  const termites = getAns(symptoms, 'q19_termites')
  applyYesNo(scores, maxes, termites, { TER: 40 })
  if (termites === 'yes') evidence.push('Termites visible on trunk, under bark, or at base')

  // —— Q20 bark eaten ——
  const barkEaten = getAns(symptoms, 'q20_bark_eaten')
  applyYesNo(scores, maxes, barkEaten, { STB: 5, GAN: 10, RPW: 5, RBB: 2, TER: 25, ENV: 5 })
  if (barkEaten === 'yes') evidence.push('Bark being eaten or peeling with damaged tissue beneath')

  // —— Q21 yellowing ——
  applySingleChoice(scores, maxes, getAns(symptoms, 'q21_yellowing'), {
    few: { STB: 2, GAN: 4, RPW: 4, RBB: 2, TER: 2, ENV: 2 },
    many: { STB: 4, GAN: 8, RPW: 8, RBB: 5, TER: 5, ENV: 4 },
    severe: { STB: 5, GAN: 12, RPW: 12, RBB: 8, TER: 8, ENV: 6 },
  })

  // —— Q22 crown weak ——
  const crownWeak = getAns(symptoms, 'q22_crown_weak')
  applyYesNo(scores, maxes, crownWeak, { STB: 3, GAN: 5, RPW: 25, RBB: 15, TER: 6, ENV: 5 })
  if (crownWeak === 'yes') evidence.push('Bud / crown weak, withered, tilted, or collapsing')

  // —— Q23 injury ——
  const injury = getAns(symptoms, 'q23_injury')
  if (isApplicable(injury) && injury !== 'none') {
    applyYesNo(scores, maxes, 'yes', { STB: 5, GAN: 2, RPW: 15, RBB: 5, TER: 3, ENV: 15 })
    evidence.push('Recent trunk injury or wound')
  } else if (injury === 'none') {
    // answered none — contribute 0 / 0 for that max? skip
  }

  // —— Q24 fire ——
  const fire = getAns(symptoms, 'q24_fire')
  applyYesNo(scores, maxes, fire, { ENV: 40 })
  if (fire === 'yes') evidence.push('Palm recently affected by fire')

  // —— Q25 lightning ——
  const lightning = getAns(symptoms, 'q25_lightning')
  applyYesNo(scores, maxes, lightning, { ENV: 40 })
  if (lightning === 'yes') evidence.push('Recent lightning strike on this or nearby palms')

  // —— Q26 flooding ——
  applySingleChoice(scores, maxes, getAns(symptoms, 'q26_flooding'), {
    occasional: { STB: 2, GAN: 2, ENV: 7 },
    frequent: { STB: 4, GAN: 4, ENV: 15 },
    severe: { STB: 5, GAN: 5, ENV: 25 },
  })
  if (getAns(symptoms, 'q26_flooding') === 'severe') {
    evidence.push('Severe flooding / waterlogging recently')
  }

  // —— Q27 fertiliser ——
  const fert = getAns(symptoms, 'q27_fertiliser')
  applyYesNo(scores, maxes, fert, { STB: 2, ENV: 20 })
  if (fert === 'yes') evidence.push('Unusually high fertiliser application recently')

  // —— Visible beetle (optional) ——
  const beetle = getAns(symptoms, 'q_visible_beetle')
  applyYesNo(scores, maxes, beetle, { RBB: 20 })
  if (beetle === 'yes') evidence.push('Visible black / rhinoceros beetle')

  // ========== Signature rules (bonus to obtained only) ==========
  const reddishBleed = liquid === 'reddish'
  if (reddishBleed && cracks === 'yes') {
    scores.STB += 25
    evidence.push('Signature: rust bleeding + longitudinal cracks')
    if (blackPatches === 'yes' || isYes(symptoms, 'q5_fibrous')) {
      scores.STB += 10
    }
  }

  if (bracket === 'yes') {
    scores.GAN += 40
    if (loc === 'base') scores.GAN += 10
  }

  const rpwIndicators = [
    holes === 'one' || holes === 'several',
    frass === 'yes',
    viscous === 'yes',
    crunch === 'yes',
    cocoon === 'yes',
  ]
  const rpwCount = rpwIndicators.filter(Boolean).length
  if (rpwCount >= 4) scores.RPW += 35
  else if (rpwCount >= 3) scores.RPW += 25
  else if (rpwCount >= 2) scores.RPW += 15

  const crownHole = holes !== 'no' && holes !== '' && (holeLoc === 'crown' || loc === 'crown')
  if (crownHole && budFrass === 'yes' && vcuts === 'yes') {
    scores.RBB += 35
  } else if ((holes === 'one' || holes === 'several') && frass === 'yes' && vcuts === 'yes' && (holeLoc === 'crown' || loc === 'crown')) {
    scores.RBB += 35
  }
  if (beetle === 'yes') scores.RBB += 20

  if (mud === 'yes' && termites === 'yes') {
    scores.TER += 40
    if (barkEaten === 'yes' || isYes(symptoms, 'q5_peeling')) scores.TER += 15
  }

  // ENV override soft boost
  if (fire === 'yes' || lightning === 'yes') {
    scores.ENV += 15
  }

  // ========== Negative evidence ==========
  if (bracket === 'no') scores.GAN *= 0.85

  if (
    holes !== 'one' &&
    holes !== 'several' &&
    frass !== 'yes' &&
    crunch !== 'yes' &&
    cocoon !== 'yes'
  ) {
    scores.RPW *= 0.45
  }

  if (mud !== 'yes' && termites !== 'yes' && barkEaten !== 'yes') {
    scores.TER *= 0.4
  }

  if (
    !(holeLoc === 'crown' || loc === 'crown') &&
    frass !== 'yes' &&
    budFrass !== 'yes' &&
    vcuts !== 'yes'
  ) {
    scores.RBB *= 0.45
  }

  // ========== Normalize match % ==========
  const matchPct: ScoreMap = emptyScores()
  for (const code of STEM_CONDITION_CODES) {
    const max = maxes[code]
    if (max <= 0) {
      matchPct[code] = 0
    } else {
      matchPct[code] = Math.min(100, Math.round((scores[code] / max) * 1000) / 10)
    }
    // Also include signature points somewhat when max is tiny but score high
    if (max > 0 && scores[code] > max) {
      matchPct[code] = Math.min(100, Math.round((scores[code] / (max + (scores[code] - max) * 0.5)) * 1000) / 10)
    }
  }

  // Recompute match as obtained/max with signature already in obtained; when obtained > max, clamp
  for (const code of STEM_CONDITION_CODES) {
    const max = Math.max(maxes[code], 1)
    matchPct[code] = Math.min(100, Math.round((scores[code] / max) * 1000) / 10)
  }

  const rankings: StemRankedCondition[] = STEM_CONDITION_CODES.map((code) => ({
    code,
    name: STEM_CONDITION_PROFILES[code].name,
    category: STEM_CONDITION_PROFILES[code].category,
    matchScore: matchPct[code],
  })).sort((a, b) => b.matchScore - a.matchScore)

  const top = rankings[0]!
  const second = rankings[1]!
  const margin = top.matchScore - second.matchScore
  let differentiation = differentiationFromMargin(margin)

  // Minimum evidence
  const signatureHit = {
    STB: reddishBleed && cracks === 'yes',
    GAN: bracket === 'yes',
    RPW: rpwCount >= 2,
    RBB:
      (vcuts === 'yes' && (budFrass === 'yes' || frass === 'yes')) ||
      beetle === 'yes',
    TER: mud === 'yes' && termites === 'yes',
    ENV: fire === 'yes' || lightning === 'yes' || fert === 'yes' || getAns(symptoms, 'q26_flooding') === 'severe',
  }

  const supportingCount = evidence.length
  const minEvidenceOk =
    (signatureHit[top.code] && supportingCount >= 3) || supportingCount >= 4 || top.matchScore < 50

  let inconclusive =
    differentiation === 'ambiguous' ||
    (top.matchScore < 50) ||
    (top.matchScore < 70 && !signatureHit[top.code]) ||
    !minEvidenceOk

  // ENV environmental override when fire/lightning strongly present and no strong fungal/pest signatures
  if ((fire === 'yes' || lightning === 'yes') && !signatureHit.GAN && rpwCount < 2 && !(mud === 'yes' && termites === 'yes')) {
    const envRank = rankings.find((r) => r.code === 'ENV')!
    if (envRank.matchScore >= 40 && envRank.matchScore + 5 >= top.matchScore) {
      // boost ENV to top if competitive
      rankings.sort((a, b) => {
        if (a.code === 'ENV') return -1
        if (b.code === 'ENV') return 1
        return b.matchScore - a.matchScore
      })
      if (rankings[0]!.code !== 'ENV') {
        rankings.unshift(rankings.splice(rankings.findIndex((r) => r.code === 'ENV'), 1)[0]!)
      }
      rankings[0]!.matchScore = Math.max(rankings[0]!.matchScore, matchPct.ENV)
      inconclusive = false
      differentiation = 'strong'
    }
  }

  const finalTop = rankings[0]!
  const finalSecond = rankings[1]!
  const finalMargin = finalTop.matchScore - finalSecond.matchScore
  differentiation = differentiationFromMargin(finalMargin)
  if (finalMargin < 8 && finalTop.matchScore >= 40) inconclusive = true

  // Severity
  let severityScore = 0
  if (isYes(symptoms, 'q5_fibrous') || isYes(symptoms, 'q5_soft')) severityScore += 12
  if (holes === 'one') severityScore += 5
  if (holes === 'several') severityScore += 12
  if (crownWeak === 'yes') severityScore += 15
  const yellow = getAns(symptoms, 'q21_yellowing')
  if (yellow === 'few') severityScore += 3
  if (yellow === 'many') severityScore += 7
  if (yellow === 'severe') severityScore += 12
  if (getAns(symptoms, 'q22_collapse') === 'yes') severityScore += 25
  if (flagLeaf === 'yes') severityScore += 10
  const severity = severityLabel(severityScore)

  const code: StemConditionCode | 'INC' = inconclusive ? 'INC' : finalTop.code
  const profile = inconclusive ? null : STEM_CONDITION_PROFILES[finalTop.code]

  let officerAlert: string | undefined
  if (!inconclusive && profile?.officerReferral) {
    if (profile.referralPriority === 'urgent') {
      officerAlert = 'Urgent agricultural inspection recommended'
    } else if (profile.referralPriority === 'high') {
      officerAlert = 'High-priority officer inspection strongly recommended'
    } else if (severity === 'severe' || severity === 'critical') {
      officerAlert = 'Professional inspection should be arranged soon'
    }
  }

  const secondaryConditions = rankings
    .slice(1)
    .filter((r) => r.matchScore >= 45 && r.matchScore >= finalTop.matchScore - 25)
    .map((r) => r.name)
    .slice(0, 2)

  if (finalTop.code === 'RBB' && !inconclusive) {
    secondaryConditions.unshift('Also check for Red Palm Weevil (wounds can attract weevils)')
  }

  const predictions = rankings.map((r) => ({
    label: r.name,
    probability: r.matchScore / 100,
  }))

  const typeLabel = inconclusive
    ? 'Inconclusive'
    : profile!.category === 'disease'
      ? 'Disease / stem condition'
      : profile!.category === 'pest'
        ? 'Pest infestation'
        : 'Physical / environmental damage'

  return {
    predictions,
    finalResult: inconclusive
      ? 'Inconclusive — symptoms are not specific enough'
      : profile!.name,
    confidence: inconclusive ? Math.min(0.49, finalTop.matchScore / 100) : finalTop.matchScore / 100,
    matchLevel: matchLevelFromScore(finalTop.matchScore, differentiation, inconclusive),
    secondaryConditions,
    officerAlert,
    symptomMatches: Object.fromEntries(
      STEM_CONDITION_CODES.map((c) => [c, matchPct[c]]),
    ),
    inconclusive,
    differentiation,
    severity,
    severityScore,
    evidence: evidence.slice(0, 12),
    rankings,
    code,
    typeLabel,
    cause: inconclusive
      ? 'Reported signs overlap several conditions. Gather more specific evidence or request a field inspection.'
      : profile!.causes,
    riskFactors: inconclusive ? [] : profile!.riskFactors,
    whatHappensIfWorse: inconclusive
      ? 'Without a clearer pattern, delayed professional care may allow hidden pests or decay to progress.'
      : profile!.whatHappensIfWorse,
    whatToDoNow: inconclusive
      ? 'Re-check for fibres at holes, internal feeding sounds, longitudinal cracks, black dried patches, fungal brackets, mud runways, and recent injury/fire/lightning. Then resubmit or contact an officer.'
      : profile!.whatToDoNow,
    prevention: inconclusive ? [] : profile!.prevention,
    management: inconclusive ? [] : profile!.management,
    officerReferral: inconclusive ? true : Boolean(profile!.officerReferral),
    referralPriority: inconclusive ? 'standard' : profile!.referralPriority,
    disclaimer: STEM_DISCLAIMER,
    matchBandLabel: matchBand(finalTop.matchScore),
    rbbCrossCheckRpw: finalTop.code === 'RBB' && !inconclusive,
  }
}
