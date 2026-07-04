/** English agricultural term expansions for keyword boost / fallback (BERT remains primary). */

const STOP_WORDS = new Set([
  'what', 'how', 'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your',
  'about', 'when', 'where', 'which', 'best', 'ideal', 'signs', 'treat', 'prevent',
  'does', 'have', 'been', 'into', 'than', 'then', 'them', 'they', 'were', 'been',
  'much', 'many', 'amount', 'using',
])

const ALIASES: Record<string, string[]> = {
  caterpillar: ['caterpillar', 'opisina', 'nephantis', 'serinopa'],
  miner: ['miner', 'leaf', 'promecotheca', 'cumingi'],
  weevil: ['weevil', 'red', 'rhynchophorus', 'ferrugineus'],
  red: ['red', 'weevil', 'rhynchophorus'],
  beetle: ['beetle', 'black', 'rhinoceros', 'oryctes'],
  black: ['black', 'beetle', 'rhinoceros', 'oryctes'],
  rhinoceros: ['rhinoceros', 'black', 'beetle', 'oryctes'],
  fertilizer: [
    'fertilizer',
    'fertiliser',
    'nutrient',
    'manure',
    'dolomite',
    'erp',
    'mop',
    'sop',
    'organic',
  ],
  fertiliser: ['fertilizer', 'fertiliser', 'nutrient', 'manure'],
  manure: ['manure', 'cow', 'goat', 'poultry', 'dung', 'organic'],
  dung: ['dung', 'cow', 'manure'],
  goat: ['goat', 'manure'],
  poultry: ['poultry', 'manure', 'cured'],
  gliricidia: ['gliricidia', 'green', 'manure'],
  compost: ['compost', 'agricultural'],
  dolomite: ['dolomite', 'magnesium', 'mg'],
  erp: ['erp', 'eppawala', 'rock', 'phosphate'],
  eppawala: ['eppawala', 'erp', 'rock', 'phosphate'],
  mop: ['mop', 'muriate', 'potash', 'potassium'],
  muriate: ['muriate', 'mop', 'potash'],
  potash: ['potash', 'mop', 'muriate', 'potassium'],
  sop: ['sop', 'sulphate', 'sulfate', 'potassium'],
  seedling: ['seedling', 'seedlings', 'young', 'months', 'year'],
  adult: ['adult', 'bearing', 'mature', 'tree'],
  basal: ['basal', 'planting', 'pit', 'husk'],
  organic: ['organic', 'manure', 'compost', 'gliricidia'],
  nutrient: ['nutrient', 'nitrogen', 'phosphorus', 'potassium', 'magnesium'],
  rot: ['rot', 'bud', 'phytophthora', 'crown', 'bordeaux'],
  bud: ['bud', 'rot', 'phytophthora', 'crown'],
  wilt: ['wilt', 'weligama', 'phytoplasma', 'leaf'],
  weligama: ['weligama', 'wilt', 'phytoplasma'],
  disease: ['disease', 'pest', 'fungus', 'infection'],
  pest: ['pest', 'disease', 'insect', 'beetle', 'weevil'],
  pheromone: ['pheromone', 'trap', 'bait'],
  trap: ['trap', 'pheromone', 'bait'],
  injection: ['injection', 'trunk', 'monocrotophos'],
  monocrotophos: ['monocrotophos', 'trunk', 'injection', 'insecticide'],
  bordeaux: ['bordeaux', 'copper', 'fungicide'],
  parasitoid: ['parasitoid', 'parasitoids', 'biological', 'control'],
}

export function queryTerms(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

export function expandTerms(terms: string[]): string[] {
  const expanded = new Set(terms)
  for (const term of terms) {
    for (const [key, values] of Object.entries(ALIASES)) {
      if (term.includes(key) || key.includes(term)) {
        values.forEach((v) => expanded.add(v))
      }
    }
  }
  return [...expanded]
}

export function expandQueryTerms(message: string): string[] {
  return expandTerms(queryTerms(message))
}
