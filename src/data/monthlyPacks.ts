import type { AdventureCategory, AdventureEntry, VibeArchetype } from '../types'

export type PackEnvironment = 'coastal' | 'urban' | 'suburban' | 'trail' | 'evening'

export interface MonthlyPack {
  id: string
  title: string
  /** Identity label users grow into ("Shore Dog", "Patio Pup"). */
  identity: string
  description: string
  /** Emotional world framing for cards; display-only. */
  region: string
  atmosphere: string
  icon: string
  requiredCount: number
  /** Display-only XP nudge — no XP math is changed by completion. */
  xpBonusLabel: string
  /** Optional metadata for grouping/labels. Not used for matching. */
  category?: AdventureCategory
  environment?: PackEnvironment
  /** Optional "vibe" hint shown in the seasonal label area. */
  seasonal?: string
  /** Tiny copy shown when a pack is freshly completed. */
  completedFlavor: string
  /** Lightweight predicate that decides if an adventure entry counts.
   *  Kept inline to avoid building a heavy achievement engine. */
  matches: (entry: AdventureEntry) => boolean
}

const SUNSET_HOUR_START = 17
const SUNSET_HOUR_END = 21

function hourOf(entry: AdventureEntry): number {
  const date = new Date(entry.completedAt)
  return Number.isFinite(date.getTime()) ? date.getHours() : -1
}

function vibeIs(entry: AdventureEntry, vibe: VibeArchetype): boolean {
  return entry.vibe === vibe
}

function titleIncludes(entry: AdventureEntry, needle: string): boolean {
  return entry.missionTitle.toLowerCase().includes(needle)
}

/** Curated launch lineup. Predicates derive completion entirely from the
 *  existing AdventureEntry shape — no new persisted fields required. */
export const MONTHLY_PACKS: MonthlyPack[] = [
  {
    id: 'coastal-dog',
    title: 'Coastal Dog',
    identity: 'Coastal Dog',
    description: 'Salt-air walks where the horizon becomes part of your dog’s day.',
    region: 'Coastline region',
    atmosphere: 'Low tide, wide sky, wind in the ears.',
    icon: '🌊',
    requiredCount: 5,
    xpBonusLabel: 'Supporting progress only',
    category: 'chill',
    environment: 'coastal',
    seasonal: 'Year-round vibe',
    completedFlavor: 'Officially Coastal Dog. The ocean knows your name.',
    matches: (entry) => vibeIs(entry, 'salt'),
  },
  {
    id: 'patio-pup',
    title: 'Patio Socialite',
    identity: 'Patio Socialite',
    description: 'Cafes, courtyards, and the polite art of becoming a regular.',
    region: 'Cafe-and-courtyard region',
    atmosphere: 'Warm pavement, chair shade, passing admirers.',
    icon: '🪴',
    requiredCount: 4,
    xpBonusLabel: 'Supporting progress only',
    category: 'social',
    environment: 'urban',
    seasonal: 'Most popular this month',
    completedFlavor: 'Certified Patio Socialite. Greet the regulars.',
    matches: (entry) => vibeIs(entry, 'pulse'),
  },
  {
    id: 'sunset-chaser',
    title: 'Sunset Chaser',
    identity: 'Sunset Chaser',
    description: 'Evening adventures that turn the end of the day into a ritual.',
    region: 'Golden-hour region',
    atmosphere: 'Long shadows, warm light, slower goodbyes.',
    icon: '🌅',
    requiredCount: 3,
    xpBonusLabel: 'Supporting progress only',
    environment: 'evening',
    seasonal: 'Community favorite',
    completedFlavor: 'You chase the sun. The sun knows.',
    matches: (entry) => {
      const hour = hourOf(entry)
      return hour >= SUNSET_HOUR_START && hour <= SUNSET_HOUR_END
    },
  },
  {
    id: 'neighborhood-explorer',
    title: 'City Explorer',
    identity: 'City Explorer',
    description: 'Side streets, murals, storefronts, and the corners your dog remembers.',
    region: 'Block-by-block region',
    atmosphere: 'Sidewalk rhythm, strange doors, confident paws.',
    icon: '🧭',
    requiredCount: 6,
    xpBonusLabel: 'Supporting progress only',
    category: 'exploration',
    environment: 'suburban',
    completedFlavor: 'City Explorer unlocked. Your dog knows the blocks now.',
    matches: (entry) => vibeIs(entry, 'wander'),
  },
  {
    id: 'chaos-agent',
    title: 'Trail Pup',
    identity: 'Trail Pup',
    description: 'Wilder edges, dirt paths, and routes that feel bigger than the block.',
    region: 'Green-edge region',
    atmosphere: 'Dirt, leaves, loose-leash curiosity.',
    icon: '🥾',
    requiredCount: 5,
    xpBonusLabel: 'Supporting progress only',
    category: 'exploration',
    environment: 'trail',
    seasonal: 'Trail identity',
    completedFlavor: 'Trail Pup unlocked. The squirrels filed a complaint.',
    matches: (entry) => vibeIs(entry, 'wild') || vibeIs(entry, 'wander'),
  },
  {
    id: 'coffee-crawl',
    title: 'Fog Walker',
    identity: 'Fog Walker',
    description: 'Soft mornings, quiet blocks, and walks that feel like a secret.',
    region: 'Morning-mist region',
    atmosphere: 'Cool air, quiet paws, softened edges.',
    icon: '🌫️',
    requiredCount: 4,
    xpBonusLabel: 'Supporting progress only',
    category: 'chill',
    environment: 'urban',
    completedFlavor: 'Fog Walker unlocked. The morning knows your route.',
    matches: (entry) => titleIncludes(entry, 'coffee') || titleIncludes(entry, 'café') || titleIncludes(entry, 'cafe') || vibeIs(entry, 'pulse'),
  },
]
