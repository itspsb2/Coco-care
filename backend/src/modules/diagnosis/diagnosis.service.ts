import type { DiagnosisPayload, DiagnosisResult } from '../../types/index.js'
import * as farmRepo from '../../repositories/farm.repository.js'
import * as reportRepo from '../../repositories/report.repository.js'
import { uploadImage } from '../../services/s3.service.js'
import { classifyImage } from '../../services/azureVision.service.js'
import { classifySymptoms, getAdviceForDisease } from '../../services/symptom.service.js'
import { fuseDiagnosis } from '../../services/fusion.service.js'
import { notFound, forbidden } from '../../utils/errors.js'

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

  let imageUrl = payload.imageUrl
  if (imageUrl?.startsWith('data:')) {
    imageUrl = await uploadImage(imageUrl, `diagnosis/${userId}/${Date.now()}.jpg`)
  }

  const vision = await classifyImage(imageUrl ?? '')
  const symptom = classifySymptoms(payload.symptoms)
  const fused = fuseDiagnosis(
    vision.disease,
    vision.confidence,
    symptom.disease,
    symptom.confidence,
  )

  const advice = getAdviceForDisease(fused.finalResult)

  const report = await reportRepo.createReport({
    farmId: payload.farmId,
    userId,
    imageUrl,
    symptoms: payload.symptoms,
    imageResult: vision.disease,
    symptomResult: symptom.disease,
    finalResult: fused.finalResult,
    confidence: fused.confidence,
    advice,
    status: fused.status,
  })

  return {
    id: report.id,
    imageResult: vision.disease,
    symptomResult: symptom.disease,
    finalResult: fused.finalResult,
    confidence: fused.confidence,
    status: fused.status === 'verified' ? 'verified' : 'pending',
    advice,
  }
}
