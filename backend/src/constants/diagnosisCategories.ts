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
        'Reddish-brown rust liquid',
        'Longitudinal bark cracks',
        'Black dried patches',
        'Brown fibrous decay',
      ],
    },
    {
      name: 'Ganoderma / Basal Stem Rot',
      symptoms: [
        'Bracket fungus at base',
        'Basal bleeding',
        'Basal tissue decay',
        'General palm decline',
      ],
    },
    {
      name: 'Red Palm Weevil Infestation',
      symptoms: [
        'Circular trunk/crown holes',
        'Chewed fibres / frass',
        'Brown viscous fluid',
        'Internal crunching sounds',
      ],
    },
    {
      name: 'Black / Rhinoceros Beetle Damage',
      symptoms: [
        'Bud/crown entry hole',
        'Fresh frass at entrance',
        'V-shaped leaf cuts',
        'Malformed young leaves',
      ],
    },
    {
      name: 'Termite Infestation',
      symptoms: [
        'Mud runways on trunk',
        'Visible termites',
        'Bark peeling / eaten',
        'Weak tissue beneath bark',
      ],
    },
  ],
  bud: [
    {
      name: 'Bud Rot Disease',
      symptoms: [
        'Wilting / pullable spear leaf',
        'Soft rotten bud tissue',
        'Foul smell from crown',
        'Lower leaves still green',
      ],
    },
    {
      name: 'Red Palm Weevil Infestation',
      symptoms: [
        'Crown holes with frass',
        'Brown viscous fluid',
        'Internal crunching',
        'Fibrous cocoons / tilting bud',
      ],
    },
    {
      name: 'Black / Rhinoceros Beetle Damage',
      symptoms: [
        'Bud entry hole with frass',
        'V-shaped leaf cuts',
        'Crooked young leaves',
        'Broken flag leaf',
      ],
    },
    {
      name: 'Plesispa Beetle Infestation',
      symptoms: [
        'Brown patches on bud leaves',
        'Superficial young-leaf feeding',
        'Primarily seedlings / young palms',
        'No deep crown boring',
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
