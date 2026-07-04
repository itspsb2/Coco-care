/** English agricultural term expansions for keyword boost / fallback (BERT remains primary). */

const STOP_WORDS = new Set([
  'what', 'how', 'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your',
  'about', 'when', 'where', 'which', 'best', 'ideal', 'signs', 'treat', 'prevent',
  'does', 'have', 'been', 'into', 'than', 'then', 'them', 'they', 'were', 'been',
])

const ALIASES: Record<string, string[]> = {
  caterpillar: ['caterpillar', 'opisina', 'dalabuwa', 'nephantis'],
  watering: ['water', 'watering', 'moisture', 'irrigation', 'rainfall', 'mulch'],
  water: ['water', 'watering', 'moisture', 'irrigation', 'rainfall'],
  yield: ['yield', 'nuts', 'production', 'harvest', 'bearing'],
  fertilizer: ['fertilizer', 'fertiliser', 'npk', 'urea', 'nutrient', 'manure', 'dolomite'],
  fertiliser: ['fertilizer', 'fertiliser', 'npk', 'urea', 'nutrient'],
  rot: ['rot', 'bud', 'phytophthora', 'crown', 'bordeaux'],
  bud: ['bud', 'rot', 'phytophthora', 'crown'],
  bleeding: ['bleeding', 'stem', 'trunk', 'ooze'],
  stem: ['stem', 'bleeding', 'trunk'],
  wilt: ['wilt', 'weligama', 'phytoplasma', 'leaf'],
  weligama: ['weligama', 'wilt', 'phytoplasma'],
  disease: ['disease', 'pest', 'fungus', 'infection'],
  nursery: ['nursery', 'seedling', 'seed'],
  planting: ['planting', 'seedling', 'plantation', 'establishment'],
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
