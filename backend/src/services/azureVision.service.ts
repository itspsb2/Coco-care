const DISEASES = [
  'Weligama Coconut Leaf Wilt Disease',
  'Stem Bleeding Disease',
  'Bud Rot Disease',
  'Coconut Caterpillar Damage',
] as const

export interface VisionResult {
  disease: string
  confidence: number
}

export async function classifyImage(_imageUrl: string): Promise<VisionResult> {
  const index = Math.floor(Math.random() * DISEASES.length)
  return {
    disease: DISEASES[index],
    confidence: 0.82 + Math.random() * 0.1,
  }
}
