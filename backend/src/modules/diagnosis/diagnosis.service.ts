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
  getStemAdvice,
  getStemMatchLevelLabel,
  scoreStemQuestionnaire,
} from '../../services/stemQuestionnaire.service.js'
import { fuseDiagnosis } from '../../services/fusion.service.js'
import { env } from '../../config/env.js'
import { notFound, forbidden, badRequest } from '../../utils/errors.js'

function resolveStatus(confidence: number): 'verified' | 'pending' {
  return confidence >= env.fusionConfidenceThreshold ? 'verified' : 'pending'
}

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

    const status = resolveStatus(finalConfidence)

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
    const hasAnswers = Object.values(payload.symptoms).some(
      (v) => v === true || (typeof v === 'string' && v.trim().length > 0),
    )
    if (!hasAnswers) {
      throw badRequest('Complete the stem and trunk symptom form before submitting')
    }

    const scored = scoreStemQuestionnaire(payload.symptoms)
    const matchLabel = getStemMatchLevelLabel(scored.matchLevel)
    const secondaryNote =
      scored.secondaryConditions.length > 0
        ? ` Also consider: ${scored.secondaryConditions.join('; ')}.`
        : ''
    const safetyNote = scored.safetyWarning ? ` ${scored.safetyWarning}` : ''
    const advice = `${matchLabel}. Most likely condition: ${scored.finalResult}. Symptom match: ${Math.round(scored.symptomMatch)}%.${secondaryNote}${safetyNote} ${getStemAdvice(scored.finalResult)} Contact a coconut cultivation officer for confirmation. Never treat this as a confirmed disease.`

    const status = resolveStatus(scored.confidence)

    const report = await reportRepo.createReport({
      farmId: payload.farmId,
      userId,
      imageUrl: imageUrl?.startsWith('data:')
        ? await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
        : imageUrl,
      symptoms: payload.symptoms,
      imageResult: 'Symptom questionnaire only',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      advice,
      status,
    })

    return {
      id: report.id,
      category,
      imageResult: 'Symptom questionnaire only',
      symptomResult: scored.finalResult,
      finalResult: scored.finalResult,
      confidence: scored.confidence,
      status,
      advice,
      predictions: scored.predictions,
      matchLevel: scored.matchLevel,
      secondaryConditions: scored.secondaryConditions,
      officerAlert: scored.safetyWarning,
      symptomMatch: scored.symptomMatch,
      symptomMatches: scored.symptomMatches,
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
    status: fused.status,
  })

  return {
    id: report.id,
    category,
    imageResult: 'Symptom questionnaire only',
    symptomResult: symptom.disease,
    finalResult: fused.finalResult,
    confidence: fused.confidence,
    status: fused.status === 'verified' ? 'verified' : 'pending',
    advice,
  }
}
