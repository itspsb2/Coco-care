import {
  buildLeafPredictions,
  mapTagToDisplayLabel,
} from '../src/constants/leafDiseaseLabels.js'

/** Real tag names returned by Azure CocoCareMLLeaves Iteration2 (verified via API). */
const AZURE_SAMPLE_RESPONSE = [
  { tagName: 'CCI_Leaflets', probability: 0.38652804 },
  { tagName: 'Gray_Leaf_Spot', probability: 0.27534986 },
  { tagName: 'Leaf_Rot', probability: 0.14949529 },
  { tagName: 'Healthy Leaves', probability: 0.085886784 },
  { tagName: 'WCLWD_Flaccidity', probability: 0.06599499 },
  { tagName: 'CCI_Caterpiller', probability: 0.028198836 },
  { tagName: 'WCLWD_Yellowing', probability: 0.0050212243 },
  { tagName: 'WCLWD_DryingofLeaflets', probability: 0.0035250175 },
]

describe('leafDiseaseLabels', () => {
  it('maps Azure underscore tag names to user-facing labels', () => {
    expect(mapTagToDisplayLabel('CCI_Leaflets')).toBe('Coconut Caterpillar Infestation (CCI)')
    expect(mapTagToDisplayLabel('CCI_Caterpiller')).toBe('Coconut Caterpillar Infestation (CCI)')
    expect(mapTagToDisplayLabel('WCLWD_Yellowing')).toBe(
      'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)',
    )
    expect(mapTagToDisplayLabel('WCLWD_Flaccidity')).toBe(
      'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)',
    )
    expect(mapTagToDisplayLabel('WCLWD_DryingofLeaflets')).toBe(
      'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)',
    )
    expect(mapTagToDisplayLabel('Leaf_Rot')).toBe('Leaf Rot')
    expect(mapTagToDisplayLabel('Gray_Leaf_Spot')).toBe('Gray Leaf Spot')
    expect(mapTagToDisplayLabel('Healthy Leaves')).toBe('Healthy Coconut Leaf')
  })

  it('builds display predictions from real Azure response shape', () => {
    const predictions = buildLeafPredictions(AZURE_SAMPLE_RESPONSE)

    const caterpillar = predictions.find((p) => p.label === 'Coconut Caterpillar Infestation (CCI)')
    expect(caterpillar?.probability).toBeCloseTo(0.38652804, 4)

    expect(predictions.find((p) => p.label === 'Gray Leaf Spot')?.probability).toBeCloseTo(
      0.27534986,
      4,
    )
    expect(predictions.find((p) => p.label === 'Leaf Rot')?.probability).toBeCloseTo(0.14949529, 4)
    expect(predictions.find((p) => p.label === 'Healthy Coconut Leaf')?.probability).toBeCloseTo(
      0.085886784,
      4,
    )
    expect(predictions).toHaveLength(7)
  })

  it('merges CCI tags using max probability', () => {
    const predictions = buildLeafPredictions([
      { tagName: 'CCI_Caterpiller', probability: 0.61 },
      { tagName: 'CCI_Leaflets', probability: 0.42 },
    ])

    expect(
      predictions.find((p) => p.label === 'Coconut Caterpillar Infestation (CCI)')?.probability,
    ).toBe(0.61)
  })
})
