import type { DiagnosisPayload, DiagnosisResult } from '../../types/index.js'
import type { DiagnosisCategory } from '../../constants/diagnosisCategories.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import * as reportRepo from '../../repositories/report.repository.js'
import { uploadImage } from '../../services/s3.service.js'
import { classifyImage, getLeafAdvice } from '../../services/azureVision.service.js'
import { classifySymptoms, getAdviceForDisease } from '../../services/symptom.service.js'
import {
  getMatchLevelLabel,
  scoreLeafQuestionnaire,
} from '../../services/leafQuestionnaire.service.js'
import {
  getMatchLevelLabel as getStemMatchLevelLabel,
  scoreStemQuestionnaire,
} from '../../services/stemQuestionnaire.service.js'
import {
  getBudMatchLevelLabel,
  scoreBudQuestionnaire,
} from '../../services/budQuestionnaire.service.js'
import {
  getFruitMatchLevelLabel,
  scoreFruitQuestionnaire,
} from '../../services/fruitQuestionnaire.service.js'
import { fuseDiagnosis } from '../../services/fusion.service.js'
import * as diseaseMapService from '../diseaseMap/diseaseMap.service.js'
import { notFound, forbidden, badRequest } from '../../utils/errors.js'

export async function submitDiagnosis(
  userId: string,
  payload: DiagnosisPayload,
): Promise<DiagnosisResult> {
  const farm = await farmRepo.findFarmById(payload.farmId)
  if (!farm) throw notFound('Farm not found')

  const farms = await farmRepo.findFarmsByUserId(userId)
  if (!farms.some((f) => f.id === payload.farmId)) {
    throw forbidden('You can only submit diagnosis for your own farms')
  }

  const category: DiagnosisCategory = payload.category ?? 'leaves'
  let imageUrl = payload.imageUrl

  if (category === 'leaves') {
    if (!imageUrl) {
      throw badRequest('An image is required for coconut leaf disease diagnosis')
    }

    const vision = await classifyImage(imageUrl)

    if (imageUrl.startsWith('data:')) {
      imageUrl = await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
    }

    const hasSymptomAnswers = Object.values(payload.symptoms).some(
      (v) => v === true || (typeof v === 'string' && v.trim().length > 0),
    )

    let finalResult = vision.disease
    let finalConfidence = vision.confidence
    let symptomResult = 'ML classification only'
    let refinedPredictions = vision.predictions
    let matchLevel: 'high' | 'moderate' | 'uncertain' | undefined
    let secondaryConditions: string[] | undefined
    let officerAlert: string | undefined
    let advice = getLeafAdvice(finalResult)

    if (hasSymptomAnswers) {
      const scored = scoreLeafQuestionnaire(payload.symptoms, vision.predictions ?? [])
      refinedPredictions = scored.predictions
      finalResult = scored.finalResult
      finalConfidence = scored.confidence
      symptomResult = scored.finalResult
      matchLevel = scored.matchLevel
      secondaryConditions = scored.secondaryConditions
      officerAlert = scored.officerAlert

      const matchLabel = getMatchLevelLabel(scored.matchLevel)
      const secondaryNote =
        scored.secondaryConditions.length > 0
          ? ` Also consider: ${scored.secondaryConditions.join('; ')}.`
          : ''
      const officerNote = scored.officerAlert ? ` ${scored.officerAlert}.` : ''
      advice = `${matchLabel}. Most likely condition: ${scored.finalResult}.${secondaryNote}${officerNote} ${getLeafAdvice(scored.finalResult)} Never treat this as a confirmed disease until an agriculture officer verifies it.`
    } else if (vision.confidence < 0.8) {
      matchLevel = vision.confidence >= 0.6 ? 'moderate' : 'uncertain'
      advice = `${getMatchLevelLabel(matchLevel)}. Complete the symptom questionnaire to improve accuracy. ${advice}`
    } else {
      matchLevel = 'high'
    }

    const status = 'pending' as const

    const report = await reportRepo.createReport({
      farmId: payload.farmId,
      userId,
      imageUrl,
      symptoms: payload.symptoms,
      imageResult: vision.disease,
      symptomResult,
      finalResult,
      confidence: finalConfidence,
      advice,
      status,
    })

    await diseaseMapService.createAlertsForSuspectedReport(report.id)

    return {
      id: report.id,
      category,
      imageResult: vision.disease,
      symptomResult,
      finalResult,
      confidence: finalConfidence,
      status,
      advice,
      predictions: refinedPredictions,
      detectedEvidence: vision.detectedEvidence,
      matchLevel,
      secondaryConditions,
      officerAlert,
    }
  }

  if (category === 'stem') {
    const answered = Object.values(payload.symptoms).some(
      (v) => v === true || (typeof v === 'string' && v.trim().length > 0 && v !== 'unsure'),
    )
    if (!answered) {
      throw badRequest('Answer the stem & trunk symptom questions before submitting')
    }

    const scored = scoreStemQuestionnaire(payload.symptoms)
    const status = 'pending' as const
    const matchLabel = getStemMatchLevelLabel(scored.matchLevel)
    const advice = scored.inconclusive
      ? `${matchLabel}. ${scored.finalResult}. ${scored.whatToDoNow} ${scored.disclaimer}`
      : `${matchLabel}. Most likely: ${scored.finalResult} (${Math.round(scored.confidence * 100)}% symptom match, ${scored.severity} severity). ${scored.whatToDoNow} ${scored.disclaimer}`

    if (imageUrl?.startsWith('data:')) {
      imageUrl = await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
    }

    const report = await reportRepo.createReport({
      farmId: payload.farmId,
      userId,
      imageUrl,
      symptoms: payload.symptoms,
      imageResult: 'Stem & trunk questionnaire',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      advice,
      status,
    })

    await diseaseMapService.createAlertsForSuspectedReport(report.id)

    return {
      id: report.id,
      category,
      imageResult: 'Stem & trunk questionnaire',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      status,
      advice,
      predictions: scored.predictions,
      matchLevel: scored.matchLevel,
      secondaryConditions: scored.secondaryConditions,
      officerAlert: scored.officerAlert,
      stemDetail: {
        code: scored.code,
        typeLabel: scored.typeLabel,
        matchScore: Math.round(scored.confidence * 1000) / 10,
        matchBandLabel: scored.matchBandLabel,
        differentiation: scored.differentiation,
        severity: scored.severity,
        severityScore: scored.severityScore,
        inconclusive: scored.inconclusive,
        evidence: scored.evidence,
        rankings: scored.rankings,
        cause: scored.cause,
        riskFactors: scored.riskFactors,
        whatHappensIfWorse: scored.whatHappensIfWorse,
        whatToDoNow: scored.whatToDoNow,
        prevention: scored.prevention,
        management: scored.management,
        officerReferral: scored.officerReferral,
        referralPriority: scored.referralPriority,
        disclaimer: scored.disclaimer,
        rbbCrossCheckRpw: scored.rbbCrossCheckRpw,
      },
    }
  }

  if (category === 'bud') {
    const answered = Object.values(payload.symptoms).some(
      (v) => v === true || (typeof v === 'string' && v.trim().length > 0 && v !== 'unsure'),
    )
    if (!answered) {
      throw badRequest('Answer the bud & crown symptom questions before submitting')
    }

    const scored = scoreBudQuestionnaire(payload.symptoms)
    const status = 'pending' as const
    const matchLabel = getBudMatchLevelLabel(scored.matchLevel)
    const leafHint = scored.suggestLeafModule
      ? ' If damage is mainly on older leaflets rather than the spear/bud, also try the Leaf diagnosis module.'
      : ''
    const advice = scored.inconclusive
      ? `${matchLabel}. ${scored.finalResult}. ${scored.whatToDoNow}${leafHint} ${scored.disclaimer}`
      : `${matchLabel}. Most likely: ${scored.finalResult} (${Math.round(scored.confidence * 100)}% symptom match, ${scored.severity} severity). ${scored.whatToDoNow}${leafHint} ${scored.disclaimer}`

    if (imageUrl?.startsWith('data:')) {
      imageUrl = await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
    }

    const report = await reportRepo.createReport({
      farmId: payload.farmId,
      userId,
      imageUrl,
      symptoms: payload.symptoms,
      imageResult: 'Bud & crown questionnaire',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      advice,
      status,
    })

    await diseaseMapService.createAlertsForSuspectedReport(report.id)

    return {
      id: report.id,
      category,
      imageResult: 'Bud & crown questionnaire',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      status,
      advice,
      predictions: scored.predictions,
      matchLevel: scored.matchLevel,
      secondaryConditions: scored.secondaryConditions,
      officerAlert: scored.officerAlert,
      budDetail: {
        code: scored.code,
        typeLabel: scored.typeLabel,
        matchScore: Math.round(scored.confidence * 1000) / 10,
        matchBandLabel: scored.matchBandLabel,
        differentiation: scored.differentiation,
        severity: scored.severity,
        severityScore: scored.severityScore,
        inconclusive: scored.inconclusive,
        evidence: scored.evidence,
        rankings: scored.rankings,
        cause: scored.cause,
        riskFactors: scored.riskFactors,
        whatHappensIfWorse: scored.whatHappensIfWorse,
        whatToDoNow: scored.whatToDoNow,
        prevention: scored.prevention,
        management: scored.management,
        officerReferral: scored.officerReferral,
        referralPriority: scored.referralPriority,
        disclaimer: scored.disclaimer,
        rbbCrossCheckRpw: scored.rbbCrossCheckRpw,
        suggestLeafModule: scored.suggestLeafModule,
      },
    }
  }

  if (category === 'fruit') {
    const answered = Object.values(payload.symptoms).some(
      (v) => v === true || (typeof v === 'string' && v.trim().length > 0 && v !== 'unsure'),
    )
    if (!answered) {
      throw badRequest('Answer the fruit / nut symptom questions before submitting')
    }

    const scored = scoreFruitQuestionnaire(payload.symptoms)
    const status = 'pending' as const
    const matchLabel = getFruitMatchLevelLabel(scored.matchLevel)
    const leafHint = scored.suggestLeafModule
      ? ' Main caterpillar signs are usually on leaves—also use the Leaf diagnosis module.'
      : ''
    const advice = scored.inconclusive
      ? `${matchLabel}. ${scored.finalResult}. ${scored.whatToDoNow}${leafHint} ${scored.disclaimer}`
      : `${matchLabel}. Most likely: ${scored.finalResult} (${Math.round(scored.confidence * 100)}% symptom match, ${scored.severity} severity). ${scored.whatToDoNow}${leafHint} ${scored.disclaimer}`

    if (imageUrl?.startsWith('data:')) {
      imageUrl = await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
    }

    const report = await reportRepo.createReport({
      farmId: payload.farmId,
      userId,
      imageUrl,
      symptoms: payload.symptoms,
      imageResult: 'Fruit / nut questionnaire',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      advice,
      status,
    })

    await diseaseMapService.createAlertsForSuspectedReport(report.id)

    return {
      id: report.id,
      category,
      imageResult: 'Fruit / nut questionnaire',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      status,
      advice,
      predictions: scored.predictions,
      matchLevel: scored.matchLevel,
      secondaryConditions: scored.secondaryConditions,
      officerAlert: scored.officerAlert,
      fruitDetail: {
        code: scored.code,
        typeLabel: scored.typeLabel,
        matchScore: Math.round(scored.confidence * 1000) / 10,
        matchBandLabel: scored.matchBandLabel,
        differentiation: scored.differentiation,
        severity: scored.severity,
        severityScore: scored.severityScore,
        inconclusive: scored.inconclusive,
        evidence: scored.evidence,
        rankings: scored.rankings,
        cause: scored.cause,
        riskFactors: scored.riskFactors,
        whatHappensIfWorse: scored.whatHappensIfWorse,
        whatToDoNow: scored.whatToDoNow,
        prevention: scored.prevention,
        management: scored.management,
        officerReferral: scored.officerReferral,
        referralPriority: scored.referralPriority,
        disclaimer: scored.disclaimer,
        suggestLeafModule: scored.suggestLeafModule,
      },
    }
  }

  const symptom = classifySymptoms(payload.symptoms, category)
  if (!Object.values(payload.symptoms).some((v) => v === true)) {
    throw badRequest('Select at least one symptom before submitting')
  }

  const fused = fuseDiagnosis(
    symptom.disease,
    symptom.confidence,
    symptom.disease,
    symptom.confidence,
  )
  const advice = getAdviceForDisease(fused.finalResult)

  const report = await reportRepo.createReport({
    farmId: payload.farmId,
    userId,
    imageUrl: imageUrl?.startsWith('data:')
      ? await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
      : imageUrl,
    symptoms: payload.symptoms,
    imageResult: 'Symptom questionnaire only',
    symptomResult: symptom.disease,
    finalResult: fused.finalResult,
    confidence: fused.confidence,
    advice,
    status: 'pending',
  })

  await diseaseMapService.createAlertsForSuspectedReport(report.id)

  return {
    id: report.id,
    category,
    imageResult: 'Symptom questionnaire only',
    symptomResult: symptom.disease,
    finalResult: fused.finalResult,
    confidence: fused.confidence,
    status: 'pending',
    advice,
  }
}
