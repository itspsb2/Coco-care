export const STEM_DISPLAY_DISEASES = [
  'Stem Bleeding Disease',
  'Red Palm Weevil Infestation',
  'Basal Stem Rot—Ganoderma',
  'Termite Damage',
  'Mechanical Trunk Injury',
  'Healthy Coconut Trunk',
] as const

export type StemDisplayDisease = (typeof STEM_DISPLAY_DISEASES)[number]

export interface StemPrediction {
  label: string
  probability: number
}
