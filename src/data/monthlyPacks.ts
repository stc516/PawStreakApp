import type { AdventureCategory, AdventureEntry, VibeArchetype } from '../types'

export type PackEnvironment = 'coastal' | 'urban' | 'suburban' | 'trail' | 'evening'

export interface MonthlyPack {
  id: string
  title: string
  /** Identity label users grow into ("Shore Dog", "Patio Pup"). */
  identity: string
  description: string
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
    title: 'Coastal Dog Pack',
    identity: 'Shore Dog',
    description: 'Salt-air, big-sky walks. Low tide, long horizon, wind in the ears.',
    icon: '🌊',
    requiredCount: 5,
    xpBonusLabel: '+25 XP bonus on completion',
    category: 'chill',
    environment: 'coastal',
    seasonal: 'Year-round vibe',
    completedFlavor: 'Officially a Shore Dog. The ocean knows your name.',
    matches: (entry) => vibeIs(entry, 'salt'),
  },
  {
    id: 'patio-pup',
    title: 'Patio Pup Pack',
    identity: 'Patio Pup',
    description: 'Cafés, courtyards, and the polite art of lying under a chair.',
    icon: '🪴',
    requiredCount: 4,
    xpBonusLabel: '+20 XP bonus on completion',
    category: 'social',
    environment: 'urban',
    seasonal: 'Most popular this month',
    completedFlavor: 'Certified Patio Pup. Greet the regulars.',
    matches: (entry) => vibeIs(entry, 'pulse'),
  },
  {
    id: 'sunset-chaser',
    title: 'Sunset Chaser Pack',
    identity: 'Sunset Chaser',
    description: 'Three evening adventures, golden hour optional but encouraged.',
    icon: '🌅',
    requiredCount: 3,
    xpBonusLabel: '+15 XP bonus on completion',
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
    title: 'Neighborhood Explorer Pack',
    identity: 'Pathfinder',
    description: 'Six exploration walks. Wrong turns welcome.',
    icon: '🧭',
    requiredCount: 6,
    xpBonusLabel: '+30 XP bonus on completion',
    category: 'exploration',
    environment: 'suburban',
    completedFlavor: 'You and your dog mapped the neighborhood — by smell.',
    matches: (entry) => vibeIs(entry, 'wander'),
  },
  {
    id: 'chaos-agent',
    title: 'Chaos Agent Pack',
    identity: 'Chaos Agent',
    description: 'Five wildcard rolls. Plans are mid. Vibes only.',
    icon: '🎲',
    requiredCount: 5,
    xpBonusLabel: '+25 XP bonus on completion',
    category: 'chaos',
    seasonal: 'Wildcards welcome',
    completedFlavor: 'Chaos Agent unlocked. The squirrels filed a complaint.',
    matches: (entry) => vibeIs(entry, 'wild'),
  },
  {
    id: 'coffee-crawl',
    title: 'Coffee Crawl Pack',
    identity: 'Coffee Crawler',
    description: 'Four café-route adventures. Bring an extra napkin.',
    icon: '☕',
    requiredCount: 4,
    xpBonusLabel: '+20 XP bonus on completion',
    category: 'social',
    environment: 'urban',
    completedFlavor: 'You and your dog have a coffee shop now.',
    matches: (entry) => titleIncludes(entry, 'coffee') || titleIncludes(entry, 'café') || titleIncludes(entry, 'cafe'),
  },
]
