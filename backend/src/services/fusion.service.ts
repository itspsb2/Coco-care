import { env } from '../config/env.js'

export interface FusionResult {
  finalResult: string
  confidence: number
  status: 'verified' | 'pending'
}

export function fuseDiagnosis(
  imageResult: string,
  imageConfidence: number,
  symptomResult: string,
  symptomConfidence: number,
): FusionResult {
  const match = imageResult.toLowerCase() === symptomResult.toLowerCase()
  const avgConfidence = (imageConfidence + symptomConfidence) / 2
  const threshold = env.fusionConfidenceThreshold

  if (match && avgConfidence >= threshold) {
    return {
      finalResult: imageResult,
      confidence: avgConfidence,
      status: 'verified',
    }
  }

  if (avgConfidence >= threshold) {
    return {
      finalResult: imageResult,
      confidence: avgConfidence,
      status: 'pending',
    }
  }

  return {
    finalResult: imageResult,
    confidence: avgConfidence,
    status: 'pending',
  }
}
