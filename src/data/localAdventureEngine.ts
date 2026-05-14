import type {
  AdventureCategory,
  AdventureRarity,
  DogMood,
  GeneratedMission,
  PawstreakState,
  VibeArchetype,
  ZipLocale,
} from '../types'

import { flavorForMission, hashString } from './missions'
import { resolveUserEnvironment } from '../lib/resolveUserEnvironment'

// --- ZIP → locale (no APIs; heuristic groups & prefixes) ---

/** Normalize to 5-digit string or '' */
export function normalizeZip(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 5)
  return d.length === 5 ? d : ''
}

/**
 * Infers a local “vibe” from ZIP for mission pools.
 * Order matters: first match wins.
 */
export function localeFromZip(zip: string): ZipLocale {
  const z = normalizeZip(zip)
  if (!z) return 'generic'

  // San Diego County & nearby coast — product’s “home” coastal profile
  if (z.startsWith('921') || ['92037', '92014', '92075', '92008', '92009', '92011', '91932', '91931', '91942'].includes(z)) {
    return 'coastal'
  }

  // Foothills / trail towns (example set)
  if (['92025', '92026', '92027', '92029', '92082', '92084', '92065', '92060'].includes(z)) {
    return 'trail'
  }

  // Dense urban cores (prefix samples)
  if (
    z.startsWith('100') ||
    z.startsWith('101') ||
    z.startsWith('102') ||
    z.startsWith('104') ||
    z.startsWith('112') ||
    z.startsWith('900') ||
    z.startsWith('902') ||
    z.startsWith('941') ||
    z.startsWith('606') ||
    z.startsWith('303') ||
    z.startsWith('021') ||
    z.startsWith('981')
  ) {
    return 'urban'
  }

  // Typical suburban residential prefixes
  if (
    z.startsWith('920') ||
    z.startsWith('923') ||
    z.startsWith('928') ||
    z.startsWith('906') ||
    z.startsWith('927') ||
    z.startsWith('930')
  ) {
    return 'suburban'
  }

  return 'generic'
}

export function localeLabel(locale: ZipLocale): string {
  const labels: Record<ZipLocale, string> = {
    generic: 'neighborhood',
    coastal: 'salt-air',
    urban: 'city',
    suburban: 'home turf',
    trail: 'trail-side',
  }
  return labels[locale]
}

function pickFrom<T>(list: T[], seed: string): T {
  if (list.length === 0) {
    throw new Error('mission pool empty')
  }
  return list[hashString(seed) % list.length]
}

export function rollRarity(seed: string, streak: number, streakMomentumBonus: boolean): AdventureRarity {
  const roll = (hashString(`${seed}|rarity`) % 100) + (streak >= 5 ? 4 : 0) + (streakMomentumBonus ? 5 : 0)
  if (roll >= 93) return 'rare'
  if (roll >= 73) return 'uncommon'
  return 'common'
}

/** Weighted vibe roll biased by locale — still deterministic from nonce */
export function rollVibeForLocale(nonce: string, locale: ZipLocale): VibeArchetype {
  const weights: Record<ZipLocale, [VibeArchetype, number][]> = {
    generic: [
      ['pulse', 1],
      ['wander', 1],
      ['salt', 1],
      ['wild', 1],
    ],
    coastal: [
      ['salt', 4],
      ['pulse', 2],
      ['wander', 2],
      ['wild', 1],
    ],
    urban: [
      ['pulse', 3],
      ['wander', 2],
      ['wild', 2],
      ['salt', 1],
    ],
    suburban: [
      ['wander', 3],
      ['pulse', 2],
      ['salt', 1],
      ['wild', 1],
    ],
    trail: [
      ['wander', 3],
      ['wild', 2],
      ['pulse', 1],
      ['salt', 1],
    ],
  }
  const table = weights[locale]
  const total = table.reduce((s, [, w]) => s + w, 0)
  const n = hashString(`${nonce}|vibe`) % total
  let acc = 0
  for (const [v, w] of table) {
    acc += w
    if (n < acc) return v
  }
  return 'pulse'
}

type Template = {
  title: string
  emoji: string
  category: AdventureCategory
  vibe: VibeArchetype
  estMin: number
  estMax: number
  locationHint: string
  idealMoods: DogMood[]
}

const GENERIC: Template[] = [
  { title: 'Coffee Crawl', emoji: '☕', category: 'social', vibe: 'pulse', estMin: 15, estMax: 30, locationHint: 'Café loop · your blocks', idealMoods: ['chill', 'social', 'curious'] },
  { title: 'Brewery Run', emoji: '🍺', category: 'social', vibe: 'pulse', estMin: 20, estMax: 36, locationHint: 'Patio-to-patio energy', idealMoods: ['social', 'restless'] },
  { title: 'Patio Hang', emoji: '🪑', category: 'social', vibe: 'pulse', estMin: 18, estMax: 34, locationHint: 'People watching optional', idealMoods: ['social', 'chill'] },
  { title: 'Farmers Market Morning', emoji: '🥕', category: 'social', vibe: 'pulse', estMin: 25, estMax: 42, locationHint: 'Fresh smells in every lane', idealMoods: ['social', 'curious'] },
  { title: 'Dog Park Meetup', emoji: '🐕‍🦺', category: 'social', vibe: 'pulse', estMin: 18, estMax: 34, locationHint: 'Familiar faces, new stories', idealMoods: ['social', 'zoomie'] },
  { title: 'Bring-a-Friend Walk', emoji: '👫', category: 'social', vibe: 'pulse', estMin: 22, estMax: 38, locationHint: 'Shared route, shared laughs', idealMoods: ['social', 'chill'] },
  { title: 'Somewhere New', emoji: '🗺️', category: 'exploration', vibe: 'wander', estMin: 26, estMax: 45, locationHint: 'A street you usually skip', idealMoods: ['curious', 'explorer'] },
  { title: 'Sunset Adventure', emoji: '🌅', category: 'exploration', vibe: 'salt', estMin: 25, estMax: 40, locationHint: 'Sky-first stroll', idealMoods: ['chill', 'social'] },
  { title: 'Scenic Walk', emoji: '🌄', category: 'exploration', vibe: 'wander', estMin: 24, estMax: 42, locationHint: 'Views before speed', idealMoods: ['explorer', 'chill'] },
  { title: 'New Neighborhood Night', emoji: '🌙', category: 'exploration', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Different lights, different vibes', idealMoods: ['curious', 'explorer'] },
  { title: 'Slow Sunday', emoji: '☁️', category: 'chill', vibe: 'wander', estMin: 18, estMax: 30, locationHint: 'Low pace, high connection', idealMoods: ['chill'] },
  { title: 'Picnic Adventure', emoji: '🧺', category: 'chill', vibe: 'pulse', estMin: 20, estMax: 36, locationHint: 'Bench break and soft vibes', idealMoods: ['chill', 'social'] },
  { title: 'Window Shopping Walk', emoji: '🪟', category: 'chill', vibe: 'pulse', estMin: 15, estMax: 28, locationHint: 'Gentle loop, curious stops', idealMoods: ['chill', 'curious'] },
  { title: 'Let the Dog Choose', emoji: '🐾', category: 'chaos', vibe: 'wild', estMin: 18, estMax: 34, locationHint: 'Follow the nose, no notes', idealMoods: ['zoomie', 'curious'] },
  { title: 'Random Direction Walk', emoji: '🧭', category: 'chaos', vibe: 'wild', estMin: 20, estMax: 40, locationHint: 'Left-right coin flip rules', idealMoods: ['restless', 'explorer'] },
  { title: 'Sniffari Mode', emoji: '👃', category: 'chaos', vibe: 'wild', estMin: 22, estMax: 42, locationHint: 'Scent quests only', idealMoods: ['curious', 'zoomie'] },
  { title: 'Neighborhood Patrol', emoji: '🏡', category: 'routine', vibe: 'pulse', estMin: 15, estMax: 28, locationHint: 'Familiar streets, fresh intent', idealMoods: ['curious', 'social'] },
  { title: 'Treat Run', emoji: '🍖', category: 'routine', vibe: 'pulse', estMin: 10, estMax: 18, locationHint: 'Quick win near home', idealMoods: ['restless', 'zoomie'] },
  { title: 'Long Way Home', emoji: '🚶', category: 'routine', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Extra blocks, same door', idealMoods: ['chill', 'explorer'] },
]

const COASTAL: Template[] = [
  { title: 'Harbor Patrol', emoji: '⚓', category: 'exploration', vibe: 'salt', estMin: 22, estMax: 38, locationHint: 'Marina air · gulls overhead', idealMoods: ['curious', 'social'] },
  { title: 'Ocean Air Adventure', emoji: '🌊', category: 'exploration', vibe: 'salt', estMin: 25, estMax: 42, locationHint: 'Salt mist · big horizon', idealMoods: ['chill', 'explorer'] },
  { title: 'Sunset Adventure', emoji: '🌅', category: 'exploration', vibe: 'salt', estMin: 28, estMax: 40, locationHint: 'Best before sunset', idealMoods: ['chill', 'social'] },
  { title: 'Boardwalk Glow', emoji: '🛼', category: 'social', vibe: 'salt', estMin: 20, estMax: 34, locationHint: 'People watching optional', idealMoods: ['social', 'zoomie'] },
  { title: 'Coronado Loop', emoji: '🏝️', category: 'exploration', vibe: 'pulse', estMin: 35, estMax: 55, locationHint: 'Island pace · wide sidewalks', idealMoods: ['explorer', 'chill'] },
  { title: 'Coffee Crawl', emoji: '☕', category: 'social', vibe: 'pulse', estMin: 14, estMax: 26, locationHint: 'Coastal café orbit', idealMoods: ['chill', 'social'] },
  { title: 'Beach Access Bypass', emoji: '🦀', category: 'exploration', vibe: 'wander', estMin: 25, estMax: 45, locationHint: 'Sand nearby · paws decide', idealMoods: ['explorer', 'curious'] },
  { title: 'Scenic Walk', emoji: '🌄', category: 'exploration', vibe: 'wander', estMin: 28, estMax: 42, locationHint: 'Tide-line curiosity', idealMoods: ['curious', 'explorer'] },
  { title: 'Let the Dog Choose', emoji: '🐾', category: 'chaos', vibe: 'wild', estMin: 18, estMax: 32, locationHint: 'Seagull chaos tolerated', idealMoods: ['zoomie', 'restless'] },
]

const URBAN: Template[] = [
  { title: 'Coffee Crawl', emoji: '☕', category: 'social', vibe: 'pulse', estMin: 12, estMax: 22, locationHint: 'Espresso blocks · quick loops', idealMoods: ['chill', 'social'] },
  { title: 'Mural Hunt', emoji: '🎨', category: 'exploration', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Color corners · slow rolls', idealMoods: ['curious', 'explorer'] },
  { title: 'People-Watch Stroll', emoji: '👀', category: 'social', vibe: 'pulse', estMin: 18, estMax: 30, locationHint: 'Sidewalk theater', idealMoods: ['social', 'curious'] },
  { title: 'Neighborhood Patrol', emoji: '🚶', category: 'routine', vibe: 'pulse', estMin: 16, estMax: 28, locationHint: 'Your grid · confident pace', idealMoods: ['restless', 'social'] },
  { title: 'Somewhere New', emoji: '🗺️', category: 'exploration', vibe: 'wander', estMin: 24, estMax: 40, locationHint: 'Alley chemistry', idealMoods: ['curious', 'explorer'] },
  { title: 'Window Shopping Walk', emoji: '🪟', category: 'chill', vibe: 'wander', estMin: 26, estMax: 42, locationHint: 'One extra avenue', idealMoods: ['explorer', 'chill'] },
  { title: 'Random Direction Walk', emoji: '🧭', category: 'chaos', vibe: 'wild', estMin: 15, estMax: 28, locationHint: 'Crosswalk sprints (safely)', idealMoods: ['zoomie', 'restless'] },
]

const SUBURBAN: Template[] = [
  { title: 'Park Loop', emoji: '🌳', category: 'routine', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Grass edges · kid chaos optional', idealMoods: ['social', 'chill'] },
  { title: 'Quiet Street Sniffari', emoji: '🍃', category: 'chill', vibe: 'wander', estMin: 22, estMax: 36, locationHint: 'Cul-de-sac chemistry', idealMoods: ['chill', 'curious'] },
  { title: 'Long Way Home', emoji: '🏡', category: 'routine', vibe: 'wander', estMin: 24, estMax: 40, locationHint: 'Subdivision scenic route', idealMoods: ['explorer', 'chill'] },
  { title: 'Golden Hour Adventure', emoji: '🌇', category: 'exploration', vibe: 'pulse', estMin: 18, estMax: 32, locationHint: 'Porch-light glow era', idealMoods: ['chill', 'social'] },
  { title: 'Treat Run', emoji: '🦴', category: 'routine', vibe: 'pulse', estMin: 10, estMax: 20, locationHint: 'Mailbox lap bonus', idealMoods: ['zoomie', 'restless'] },
  { title: 'Slow Sunday', emoji: '☁️', category: 'chill', vibe: 'pulse', estMin: 16, estMax: 30, locationHint: 'HOA-approved mischief', idealMoods: ['curious', 'social'] },
]

const TRAIL: Template[] = [
  { title: 'Trail Pup Challenge', emoji: '🥾', category: 'exploration', vibe: 'wander', estMin: 35, estMax: 65, locationHint: 'Dirt under paws', idealMoods: ['explorer', 'restless'] },
  { title: 'Hill Climb', emoji: '⛰️', category: 'exploration', vibe: 'wander', estMin: 30, estMax: 55, locationHint: 'Elevation as drama', idealMoods: ['restless', 'zoomie'] },
  { title: 'Nature Sniffari', emoji: '🌲', category: 'exploration', vibe: 'wander', estMin: 32, estMax: 55, locationHint: 'Live oak gossip', idealMoods: ['curious', 'explorer'] },
  { title: 'Summit Chaos', emoji: '🌄', category: 'chaos', vibe: 'wild', estMin: 28, estMax: 50, locationHint: 'Reward views · loose leash energy', idealMoods: ['zoomie', 'explorer'] },
  { title: 'Coffee Crawl', emoji: '☕', category: 'social', vibe: 'pulse', estMin: 14, estMax: 24, locationHint: 'Trailhead café orbit', idealMoods: ['chill'] },
]

const RARE_CORE: Template[] = [
  { title: 'Secret Sniffari', emoji: '🤫', category: 'exploration', vibe: 'wander', estMin: 30, estMax: 50, locationHint: 'Off-script smells only', idealMoods: ['curious', 'explorer'] },
  { title: 'Full Moon Loop', emoji: '🌕', category: 'chaos', vibe: 'wild', estMin: 25, estMax: 45, locationHint: 'Tonight counts double', idealMoods: ['explorer', 'social'] },
  { title: 'Hidden Park Adventure', emoji: '🗺️', category: 'exploration', vibe: 'wander', estMin: 28, estMax: 48, locationHint: 'That gate you never opened', idealMoods: ['explorer', 'curious'] },
  { title: 'Farmers Market Morning', emoji: '🥕', category: 'social', vibe: 'pulse', estMin: 25, estMax: 40, locationHint: 'Snacks in the air · polite sniffing', idealMoods: ['social', 'curious'] },
]

const RARE_COASTAL_EXTRA: Template[] = [
  { title: 'Sunrise Ocean Reset', emoji: '🌅', category: 'exploration', vibe: 'salt', estMin: 30, estMax: 50, locationHint: 'Pink sky · salt lungs', idealMoods: ['chill', 'explorer'] },
]

const ALL_CATEGORIES: AdventureCategory[] = ['social', 'exploration', 'chill', 'chaos', 'routine']

function categoryWeightsForEnvironment(params: {
  tags: string[]
  locale: ZipLocale
}): Record<AdventureCategory, number> {
  const weights: Record<AdventureCategory, number> = {
    social: 1,
    exploration: 1,
    chill: 1,
    chaos: 1,
    routine: 1,
  }

  const joined = params.tags.join(' ').toLowerCase()
  if (/brew|patio|social|market|caf[ée]/.test(joined)) weights.social += 3
  if (/beach|cliff|coast|harbor|ocean|boardwalk|bluff/.test(joined)) weights.exploration += 3
  if (/hiking|nature|trail|canyon|park/.test(joined)) weights.exploration += 2
  if (/quiet|residential|neighborhood|routine|daily/.test(joined)) {
    weights.routine += 2
    weights.chill += 2
  }

  if (params.locale === 'coastal') weights.exploration += 2
  if (params.locale === 'trail') weights.exploration += 2
  if (params.locale === 'suburban') weights.routine += 1

  return weights
}

function rollCategoryForEnvironment(seed: string, weights: Record<AdventureCategory, number>): AdventureCategory {
  const total = ALL_CATEGORIES.reduce((acc, c) => acc + Math.max(1, weights[c]), 0)
  const roll = hashString(`${seed}|category`) % total
  let acc = 0
  for (const c of ALL_CATEGORIES) {
    acc += Math.max(1, weights[c])
    if (roll < acc) return c
  }
  return 'routine'
}

function poolForLocale(locale: ZipLocale): Template[] {
  switch (locale) {
    case 'coastal':
      return [...COASTAL, ...GENERIC]
    case 'urban':
      return [...URBAN, ...GENERIC]
    case 'suburban':
      return [...SUBURBAN, ...GENERIC]
    case 'trail':
      return [...TRAIL, ...GENERIC]
    default:
      return [...GENERIC]
  }
}

function rarePoolForLocale(locale: ZipLocale): Template[] {
  const base = [...RARE_CORE]
  if (locale === 'coastal') base.push(...RARE_COASTAL_EXTRA)
  return base
}

function buildDescription(params: {
  dogName: string
  dogMood: DogMood
  template: Template
  rarity: AdventureRarity
  locale: ZipLocale
  moodMatches: boolean
}): string {
  void params
  return ''
}

export function missionTimeLabel(m: Pick<GeneratedMission, 'estimatedMinutesMin' | 'estimatedMinutesMax'>): string {
  return `${m.estimatedMinutesMin}–${m.estimatedMinutesMax} min`
}

export type GenerateMissionParams = {
  zipCode: string
  dogName: string
  dogMood: DogMood
  streak: number
  nonce: string
  /** When set (manual vibe pick), non-rare pulls stay in this vibe; rare prefers matching vibe when possible */
  fixedVibe?: VibeArchetype
}

/**
 * Localized daily mission — deterministic from nonce + inputs.
 */
export function generateLocalizedMission(params: GenerateMissionParams): GeneratedMission {
  const { zipCode, dogName, dogMood, streak, nonce, fixedVibe } = params
  const locale = localeFromZip(zipCode)
  const envResolution = resolveUserEnvironment(zipCode)
  const environmentTags =
    envResolution.source === 'handcrafted'
      ? envResolution.environment.environmentTags
      : envResolution.environment.environmentTags
  const categoryWeights = categoryWeightsForEnvironment({ tags: environmentTags, locale })
  const preferredCategory = rollCategoryForEnvironment(nonce, categoryWeights)
  const pool = poolForLocale(locale)

  const rarity = rollRarity(`${nonce}|roll`, streak, Boolean(fixedVibe && fixedVibe === 'wild'))

  let template: Template

  if (rarity === 'rare') {
    let rarePool = rarePoolForLocale(locale)
    const categoryRare = rarePool.filter((t) => t.category === preferredCategory)
    if (categoryRare.length > 0) rarePool = categoryRare
    if (fixedVibe) {
      const byVibe = rarePool.filter((t) => t.vibe === fixedVibe)
      if (byVibe.length > 0) rarePool = byVibe
    }
    template = pickFrom(rarePool, `${nonce}|rare`)
  } else {
    const vibe = fixedVibe ?? rollVibeForLocale(`${nonce}|pick`, locale)
    const categoryPool = pool.filter((t) => t.category === preferredCategory)
    const filtered = categoryPool.filter((t) => t.vibe === vibe)
    const fallbackByVibe = pool.filter((t) => t.vibe === vibe)
    const usePool = filtered.length > 0 ? filtered : fallbackByVibe.length > 0 ? fallbackByVibe : pool.filter((t) => t.vibe === 'pulse')
    template = pickFrom(usePool.length > 0 ? usePool : pool, `${nonce}|${vibe}|${rarity}`)
  }

  const moodMatchesToday = template.idealMoods.includes(dogMood)
  const description = buildDescription({
    dogName,
    dogMood,
    template,
    rarity,
    locale,
    moodMatches: moodMatchesToday,
  })

  const flavor = flavorForMission({
    mood: dogMood,
    title: template.title,
    dogName,
    rarity,
  })

  return {
    title: template.title,
    emoji: template.emoji,
    category: template.category,
    estimatedMinutesMin: template.estMin,
    estimatedMinutesMax: template.estMax,
    locationHint: template.locationHint,
    idealMoods: template.idealMoods,
    moodMatchesToday,
    rarity,
    description,
    flavor,
    vibe: template.vibe,
  }
}

/** Flatten generated mission to legacy selected fields */
export function flattenMission(m: GeneratedMission): Pick<
  PawstreakState,
  'selectedVibe' | 'selectedMissionTitle' | 'selectedEmoji' | 'selectedRarity' | 'selectedFlavor'
> {
  return {
    selectedVibe: m.vibe,
    selectedMissionTitle: m.title,
    selectedEmoji: m.emoji,
    selectedRarity: m.rarity,
    selectedFlavor: m.flavor,
  }
}

export function refreshTomorrowTease(input: { dogName: string; zipCode: string; rareTomorrow?: boolean }): string {
  const { dogName } = input
  const variant = hashString(`${dogName}|${input.zipCode}|tease2`) % 3
  const lines = [
    `New picks at midnight.`,
    `Tomorrow: fresh route for ${dogName}.`,
    `See you tomorrow for the next walk.`,
  ]
  return lines[variant] ?? lines[0]
}

export interface QuickAdventurePick {
  id: string
  title: string
  emoji: string
  place: string
  vibe: VibeArchetype
  category: AdventureCategory
  estMin: number
  estMax: number
  idealMoods: DogMood[]
}

const SD_COASTAL_QUICK: QuickAdventurePick[] = [
  { id: 'sd-sunset', title: 'Sunset Walk', emoji: '🌅', place: 'Mission Bay', vibe: 'salt', category: 'exploration', estMin: 20, estMax: 40, idealMoods: ['chill', 'social'] },
  { id: 'sd-cafe', title: 'Coffee Run', emoji: '☕', place: 'Better Buzz', vibe: 'pulse', category: 'social', estMin: 12, estMax: 22, idealMoods: ['chill', 'curious'] },
  { id: 'sd-patio', title: 'Patio Hang', emoji: '🍺', place: 'Ballast Point', vibe: 'pulse', category: 'social', estMin: 18, estMax: 32, idealMoods: ['social', 'chill'] },
  { id: 'sd-trail', title: 'Trail Walk', emoji: '🥾', place: 'Cowles Mountain', vibe: 'wander', category: 'exploration', estMin: 28, estMax: 50, idealMoods: ['explorer', 'restless'] },
  { id: 'sd-beach', title: 'Dog Beach', emoji: '🏖', place: 'Coronado Dog Beach', vibe: 'salt', category: 'exploration', estMin: 25, estMax: 45, idealMoods: ['explorer', 'social'] },
  { id: 'sd-pb', title: 'Beach Walk', emoji: '🌊', place: 'Pacific Beach', vibe: 'salt', category: 'routine', estMin: 18, estMax: 36, idealMoods: ['chill', 'curious'] },
]

const GENERIC_QUICK: QuickAdventurePick[] = [
  { id: 'g-sunset', title: 'Sunset Walk', emoji: '🌅', place: 'Near you', vibe: 'salt', category: 'exploration', estMin: 18, estMax: 35, idealMoods: ['chill'] },
  { id: 'g-park', title: 'Park Day', emoji: '🌳', place: 'Local park', vibe: 'wander', category: 'routine', estMin: 20, estMax: 38, idealMoods: ['social', 'chill'] },
  { id: 'g-coffee', title: 'Coffee Run', emoji: '☕', place: 'Your block', vibe: 'pulse', category: 'social', estMin: 12, estMax: 24, idealMoods: ['chill', 'curious'] },
  { id: 'g-neighborhood', title: 'Neighborhood Loop', emoji: '🏡', place: 'Home loop', vibe: 'pulse', category: 'routine', estMin: 15, estMax: 28, idealMoods: ['curious'] },
  { id: 'g-explore', title: 'Explore Somewhere New', emoji: '🗺️', place: 'A new street', vibe: 'wander', category: 'exploration', estMin: 22, estMax: 40, idealMoods: ['explorer', 'curious'] },
  { id: 'g-golden', title: 'Golden Hour Walk', emoji: '🌇', place: 'Around dusk', vibe: 'salt', category: 'chill', estMin: 18, estMax: 32, idealMoods: ['chill', 'social'] },
]

const URBAN_QUICK: QuickAdventurePick[] = [
  { id: 'u-coffee', title: 'Coffee Run', emoji: '☕', place: 'Downtown', vibe: 'pulse', category: 'social', estMin: 12, estMax: 22, idealMoods: ['chill', 'social'] },
  { id: 'u-park', title: 'Park Day', emoji: '🌳', place: 'City park', vibe: 'wander', category: 'routine', estMin: 18, estMax: 34, idealMoods: ['social'] },
  { id: 'u-loop', title: 'Neighborhood Loop', emoji: '🚶', place: 'Sidewalk loop', vibe: 'pulse', category: 'routine', estMin: 16, estMax: 30, idealMoods: ['restless'] },
  { id: 'u-sunset', title: 'Sunset Walk', emoji: '🌅', place: 'Waterfront', vibe: 'salt', category: 'exploration', estMin: 20, estMax: 38, idealMoods: ['chill'] },
  { id: 'u-new', title: 'Explore Somewhere New', emoji: '🗺️', place: 'New block', vibe: 'wander', category: 'exploration', estMin: 22, estMax: 40, idealMoods: ['explorer'] },
  { id: 'u-patio', title: 'Patio Hang', emoji: '🍺', place: 'Sidewalk café', vibe: 'pulse', category: 'social', estMin: 16, estMax: 30, idealMoods: ['social', 'chill'] },
]

const TRAIL_QUICK: QuickAdventurePick[] = [
  { id: 't-hike', title: 'Trail Walk', emoji: '🥾', place: 'Local trailhead', vibe: 'wander', category: 'exploration', estMin: 30, estMax: 55, idealMoods: ['explorer', 'restless'] },
  { id: 't-ridge', title: 'Ridge Walk', emoji: '⛰️', place: 'Hills nearby', vibe: 'wander', category: 'exploration', estMin: 32, estMax: 58, idealMoods: ['explorer'] },
  { id: 't-coffee', title: 'Coffee Run', emoji: '☕', place: 'Trail town', vibe: 'pulse', category: 'social', estMin: 12, estMax: 22, idealMoods: ['chill'] },
  { id: 't-park', title: 'Park Day', emoji: '🌳', place: 'Open space', vibe: 'wander', category: 'routine', estMin: 20, estMax: 38, idealMoods: ['social'] },
  { id: 't-loop', title: 'Neighborhood Loop', emoji: '🏡', place: 'Quiet roads', vibe: 'pulse', category: 'routine', estMin: 15, estMax: 28, idealMoods: ['curious'] },
  { id: 't-sunset', title: 'Sunset Walk', emoji: '🌅', place: 'Viewpoint', vibe: 'salt', category: 'exploration', estMin: 22, estMax: 40, idealMoods: ['chill'] },
]

const SUBURBAN_QUICK: QuickAdventurePick[] = [
  { id: 's-park', title: 'Park Day', emoji: '🌳', place: 'Neighborhood park', vibe: 'wander', category: 'routine', estMin: 18, estMax: 36, idealMoods: ['social', 'chill'] },
  { id: 's-loop', title: 'Neighborhood Loop', emoji: '🏡', place: 'Familiar blocks', vibe: 'pulse', category: 'routine', estMin: 14, estMax: 28, idealMoods: ['curious'] },
  { id: 's-coffee', title: 'Coffee Run', emoji: '☕', place: 'Corner café', vibe: 'pulse', category: 'social', estMin: 12, estMax: 22, idealMoods: ['chill'] },
  { id: 's-sunset', title: 'Sunset Walk', emoji: '🌅', place: 'Quiet streets', vibe: 'salt', category: 'exploration', estMin: 18, estMax: 34, idealMoods: ['chill'] },
  { id: 's-explore', title: 'Explore Somewhere New', emoji: '🗺️', place: 'Next block over', vibe: 'wander', category: 'exploration', estMin: 20, estMax: 38, idealMoods: ['explorer'] },
  { id: 's-treat', title: 'Treat Run', emoji: '🍖', place: 'Quick loop', vibe: 'pulse', category: 'routine', estMin: 10, estMax: 18, idealMoods: ['zoomie', 'restless'] },
]

export function quickAdventurePicksForZip(zip: string): QuickAdventurePick[] {
  const locale = localeFromZip(zip)
  if (locale === 'coastal') return SD_COASTAL_QUICK
  if (locale === 'urban') return URBAN_QUICK
  if (locale === 'trail') return TRAIL_QUICK
  if (locale === 'suburban') return SUBURBAN_QUICK
  return GENERIC_QUICK
}

export function missionFromQuickPick(params: {
  pick: QuickAdventurePick
  dogName: string
  dogMood: DogMood
  streak: number
  nonce: string
}): GeneratedMission {
  const { pick, dogName, dogMood, streak, nonce } = params
  const rarity = rollRarity(`${nonce}|r`, streak, false)
  const moodMatchesToday = pick.idealMoods.includes(dogMood)
  const flavor = flavorForMission({ mood: dogMood, title: pick.title, dogName, rarity })
  return {
    title: pick.title,
    emoji: pick.emoji,
    category: pick.category,
    estimatedMinutesMin: pick.estMin,
    estimatedMinutesMax: pick.estMax,
    locationHint: pick.place,
    idealMoods: pick.idealMoods,
    moodMatchesToday,
    rarity,
    description: '',
    flavor,
    vibe: pick.vibe,
  }
}
