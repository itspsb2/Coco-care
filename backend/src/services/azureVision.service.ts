import { env } from '../config/env.js'
import {
  buildLeafPredictions,
  getCciDetectedEvidence,
  LEAF_DISEASE_ADVICE,
  mapTagToDisplayLabel,
  type LeafDisplayDisease,
  type LeafPrediction,
} from '../constants/leafDiseaseLabels.js'

export interface VisionResult {
  disease: string
  confidence: number
  predictions: LeafPrediction[]
  detectedEvidence?: string
}

interface AzurePrediction {
  probability: number
  tagName: string
}

interface AzureClassifyResponse {
  predictions: AzurePrediction[]
}

function parseDataUrl(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s)
  if (!match) throw new Error('Invalid image data URL')
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

async function imageToBuffer(imageUrl: string): Promise<{ buffer: Buffer; mime: string }> {
  if (imageUrl.startsWith('data:')) {
    return parseDataUrl(imageUrl)
  }

  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image for classification: ${response.status}`)
  }

  const mime = response.headers.get('content-type') ?? 'application/octet-stream'
  return {
    mime,
    buffer: Buffer.from(await response.arrayBuffer()),
  }
}

function imageClassifyUrl(predictionUrl: string): string {
  return predictionUrl.replace(/\/url\/?$/i, '/image')
}

export async function classifyImage(imageUrl: string): Promise<VisionResult> {
  if (!imageUrl) {
    throw new Error('Image is required for leaf disease classification')
  }

  if (!env.azureCvKey || !env.azureCvPredictionUrl) {
    throw new Error(
      'Azure Custom Vision is not configured. Set AZURE_CV_KEY and AZURE_CV_PREDICTION_URL in backend/.env',
    )
  }

  const { buffer } = await imageToBuffer(imageUrl)
  const classifyUrl = imageClassifyUrl(env.azureCvPredictionUrl)

  const response = await fetch(classifyUrl, {
    method: 'POST',
    headers: {
      'Prediction-Key': env.azureCvKey,
      'Content-Type': 'application/octet-stream',
    },
    body: new Uint8Array(buffer),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Azure Custom Vision classification failed (${response.status}): ${detail}`)
  }

  const data = (await response.json()) as AzureClassifyResponse
  const raw = data.predictions ?? []
  if (raw.length === 0) {
    throw new Error('Azure Custom Vision returned no predictions')
  }

  const predictions = buildLeafPredictions(raw)

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      'Azure leaf predictions:',
      raw.map((p) => `${p.tagName}: ${(p.probability * 100).toFixed(1)}%`).join(', '),
    )
  }

  const top = [...predictions].sort((a, b) => b.probability - a.probability)[0]

  const cciEvidence = getCciDetectedEvidence(raw)
  const detectedEvidence =
    top?.label === 'Coconut Caterpillar Infestation (CCI)' && cciEvidence
      ? `Detected Evidence: ${cciEvidence}`
      : undefined

  if (!top || top.probability <= 0) {
    const fallback = raw.sort((a, b) => b.probability - a.probability)[0]
    const mapped = mapTagToDisplayLabel(fallback.tagName)
    const disease = mapped ?? fallback.tagName
    return {
      disease,
      confidence: fallback.probability,
      predictions,
      detectedEvidence:
        disease === ('Coconut Caterpillar Infestation (CCI)' as LeafDisplayDisease) && cciEvidence
          ? `Detected Evidence: ${cciEvidence}`
          : undefined,
    }
  }

  return {
    disease: top.label,
    confidence: top.probability,
    predictions,
    detectedEvidence,
  }
}

export function getLeafAdvice(disease: string): string {
  return (
    LEAF_DISEASE_ADVICE[disease as keyof typeof LEAF_DISEASE_ADVICE] ??
    'Consult your agriculture officer for verified treatment guidance.'
  )
}
