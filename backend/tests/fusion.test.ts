import { fuseDiagnosis } from '../src/services/fusion.service.js'
import { classifySymptoms } from '../src/services/symptom.service.js'

describe('symptom.service', () => {
  it('classifies bud rot symptoms', () => {
    const result = classifySymptoms(
      {
        'Rotting crown region': true,
        'Foul smell': true,
      },
      'bud',
    )
    expect(result.disease).toBe('Bud Rot Disease')
    expect(result.confidence).toBeGreaterThan(0.5)
  })
})

describe('fusion.service', () => {
  it('verifies when image and symptom match with high confidence', () => {
    const result = fuseDiagnosis(
      'Bud Rot Disease',
      0.9,
      'Bud Rot Disease',
      0.85,
    )
    expect(result.status).toBe('verified')
    expect(result.finalResult).toBe('Bud Rot Disease')
  })

  it('pending when results mismatch', () => {
    const result = fuseDiagnosis(
      'Bud Rot Disease',
      0.9,
      'Stem Bleeding Disease',
      0.85,
    )
    expect(result.status).toBe('pending')
  })
})
