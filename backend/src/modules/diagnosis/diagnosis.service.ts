import type { DiagnosisPayload, DiagnosisResult } from '../../types/index.js'
import type { DiagnosisCategory } from '../../constants/diagnosisCategories.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import * as reportRepo from '../../repositories/report.repository.js'
import { uploadImage } from '../../services/s3.service.js'
import { classifyImage, getLeafAdvice } from '../../services/azureVision.service.js'
import { classifySymptoms, getAdviceForDisease } from '../../services/symptom.service.js'
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

    const advice = getLeafAdvice(vision.disease)
    const status = resolveStatus(vision.confidence)

    const report = await reportRepo.createReport({
      farmId: payload.farmId,
      userId,
      imageUrl,
      symptoms: payload.symptoms,
      imageResult: vision.disease,
      symptomResult: 'ML classification only',
      finalResult: vision.disease,
      confidence: vision.confidence,
      advice,
      status,
    })

    return {
      id: report.id,
      category,
      imageResult: vision.disease,
      symptomResult: 'ML classification only',
      finalResult: vision.disease,
      confidence: vision.confidence,
      status,
      advice,
      predictions: vision.predictions,
      detectedEvidence: vision.detectedEvidence,
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
