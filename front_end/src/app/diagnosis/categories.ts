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
    description: 'Answer the guided stem and trunk form to identify likely conditions.',
    icon: TreePine,
    usesMl: false,
    accent: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-50 text-amber-700',
  },
  bud: {
    label: 'Coconut Bud & Crown',
    description: 'Use the symptom questionnaire for bud and crown issues.',
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

export function isDiagnosisCategory(value: string): value is DiagnosisCategory {
  return DIAGNOSIS_CATEGORIES.includes(value as DiagnosisCategory)
}

export function getCategoryPath(category: DiagnosisCategory): string {
  if (category === 'leaves') return '/app/disease-detection/leaves'
  if (category === 'stem') return '/app/disease-detection/stem'
  return `/app/disease-detection/symptoms/${category}`
}
