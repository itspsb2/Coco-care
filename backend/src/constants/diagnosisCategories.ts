export const DIAGNOSIS_CATEGORIES = [
  'leaves',
  'stem',
  'bud',
  'fruit',
  'whole-tree',
] as const

export type DiagnosisCategory = (typeof DIAGNOSIS_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<DiagnosisCategory, string> = {
  leaves: 'Coconut Leaves & Leaflets',
  stem: 'Coconut Stem & Trunk',
  bud: 'Coconut Bud & Crown',
  fruit: 'Coconut Fruit',
  'whole-tree': 'Whole Tree',
}

export interface CategoryDisease {
  name: string
  symptoms: string[]
}

export const CATEGORY_DISEASES: Record<Exclude<DiagnosisCategory, 'leaves'>, CategoryDisease[]> = {
  stem: [
    {
      name: 'Stem Bleeding Disease',
      symptoms: [
        'Dark reddish brown liquid from trunk',
        'Cracked bark',
        'Stem wounds',
        'Internal rotting',
      ],
    },
    {
      name: 'Ganoderma Butt Rot',
      symptoms: [
        'Wilting despite adequate water',
        'Ganoderma conks at tree base',
        'Discolored lower fronds',
        'Softening trunk base',
      ],
    },
  ],
  bud: [
    {
      name: 'Bud Rot Disease',
      symptoms: [
        'Rotting crown region',
        'Foul smell',
        'Young leaf decay',
        'Blackened bud',
      ],
    },
    {
      name: 'Crown Wilt',
      symptoms: [
        'Crown leaves wilting',
        'Young leaves drying',
        'Stunted new frond growth',
        'Brown discoloration at crown',
      ],
    },
  ],
  fruit: [
    {
      name: 'Coconut Mite Damage',
      symptoms: [
        'Scarred nuts',
        'Distorted fruit shape',
        'Bronze or russet patches on husk',
        'Reduced nut size',
      ],
    },
    {
      name: 'Fruit Rot',
      symptoms: [
        'Premature nut drop',
        'Discolored husk',
        'Soft rotting nuts',
        'Foul odor from fallen nuts',
      ],
    },
  ],
  'whole-tree': [
    {
      name: 'Weligama Coconut Leaf Wilt Disease',
      symptoms: [
        'Yellowing leaves',
        'Flaccid leaf appearance',
        'Reduced nut production',
        'Drooping leaflets',
      ],
    },
    {
      name: 'Lethal Yellowing',
      symptoms: [
        'Progressive yellowing from older fronds',
        'Premature nut drop',
        'Crown collapse',
        'Blackened inflorescence',
      ],
    },
    {
      name: 'Coconut Caterpillar Damage',
      symptoms: [
        'Damaged leaf surface',
        'Brown dried leaves',
        'Holes in leaflets',
        'Visible caterpillars',
      ],
    },
  ],
}
