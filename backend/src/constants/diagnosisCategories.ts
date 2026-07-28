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
        'Reddish-brown liquid from trunk',
        'Vertical cracks on trunk',
        'Soft or rotten tissue under bark',
        'Dark stain running downward',
      ],
    },
    {
      name: 'Red Palm Weevil Infestation',
      symptoms: [
        'Round holes on trunk or leaf bases',
        'Chewed fibres from holes',
        'Sawdust-like frass',
        'Crown bending or collapsing',
      ],
    },
    {
      name: 'Basal Stem Rot—Ganoderma',
      symptoms: [
        'Damage near soil level',
        'Soft or rotten trunk base',
        'Mushroom-like fungal brackets',
        'Palm leaning or unstable',
      ],
    },
    {
      name: 'Termite Damage',
      symptoms: [
        'Mud tubes on trunk',
        'Live termites under bark',
        'Soil-like material on trunk',
        'Eaten outer trunk tissue',
      ],
    },
    {
      name: 'Mechanical Trunk Injury',
      symptoms: [
        'Visible cut or climbing wound',
        'Damage limited to one area',
        'Clean wound edges',
        'Wound dry and healing',
      ],
    },
    {
      name: 'Healthy Coconut Trunk',
      symptoms: [
        'Trunk firm and dry',
        'No bleeding patches',
        'No holes or chewed fibres',
        'No fungal brackets or mud tubes',
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
