import { Leaf, TreePine, Sprout, Apple, Trees } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const DIAGNOSIS_CATEGORIES = [
  'leaves',
  'stem',
  'bud',
  'fruit',
  'whole-tree',
] as const

export type DiagnosisCategory = (typeof DIAGNOSIS_CATEGORIES)[number]

export const CATEGORY_META: Record<
  DiagnosisCategory,
  {
    label: string
    description: string
    icon: LucideIcon
    usesMl: boolean
    accent: string
    iconBg: string
  }
> = {
  leaves: {
    label: 'Coconut Leaves & Leaflets',
    description: 'Upload a leaf photo for AI-powered disease classification.',
    icon: Leaf,
    usesMl: true,
    accent: 'from-emerald-500 to-[#2d5f2e]',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
  stem: {
    label: 'Coconut Stem & Trunk',
    description:
      'Guided CRI-aligned symptom questionnaire for bleeding, beetles, weevils, termites, and basal rot.',
    icon: TreePine,
    usesMl: false,
    accent: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-50 text-amber-700',
  },
  bud: {
    label: 'Coconut Bud & Crown',
    description:
      'Guided CRI-aligned questionnaire for bud rot, weevil, beetle, and Plesispa damage.',
    icon: Sprout,
    usesMl: false,
    accent: 'from-lime-500 to-green-600',
    iconBg: 'bg-lime-50 text-lime-700',
  },
  fruit: {
    label: 'Coconut Fruit',
    description: 'Identify fruit-related diseases through guided symptoms.',
    icon: Apple,
    usesMl: false,
    accent: 'from-yellow-500 to-amber-600',
    iconBg: 'bg-yellow-50 text-yellow-700',
  },
  'whole-tree': {
    label: 'Whole Tree',
    description: 'Assess tree-wide symptoms affecting the entire palm.',
    icon: Trees,
    usesMl: false,
    accent: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-50 text-teal-700',
  },
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

export function isDiagnosisCategory(value: string): value is DiagnosisCategory {
  return DIAGNOSIS_CATEGORIES.includes(value as DiagnosisCategory)
}

export function getCategoryPath(category: DiagnosisCategory): string {
  if (category === 'leaves') return '/app/disease-detection/leaves'
  if (category === 'stem') return '/app/disease-detection/stem'
  if (category === 'bud') return '/app/disease-detection/bud'
  return `/app/disease-detection/symptoms/${category}`
}
