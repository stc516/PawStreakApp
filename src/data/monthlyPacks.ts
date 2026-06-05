import type { AdventureCategory, AdventureEntry, VibeArchetype } from '../types'
import type { ChallengeIllustrationKey } from '../components/challenges/CategoryIllustration'

export type PackEnvironment =
  | 'coastal'
  | 'urban'
  | 'suburban'
  | 'trail'
  | 'evening'
  | 'park'
  | 'social'

export type ChallengeSeason = 'evergreen' | 'spring' | 'summer' | 'fall' | 'winter'

export interface MonthlyPack {
  id: string
  title: string
  identity: string
  description: string
  region: string
  atmosphere: string
  icon: string
  illustration: ChallengeIllustrationKey
  requiredCount: number
  xpBonusLabel: string
  category?: AdventureCategory
  environment?: PackEnvironment
  season: ChallengeSeason
  seasonal?: string
  lockedHint: string
  completedFlavor: string
  matches: (entry: AdventureEntry) => boolean
}

const SUNSET_HOUR_START = 17
const SUNSET_HOUR_END = 21
const EARLY_HOUR_END = 9

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

function hintIncludes(entry: AdventureEntry, needle: string): boolean {
  return (entry.locationHint ?? '').toLowerCase().includes(needle)
}

function anyTextIncludes(entry: AdventureEntry, ...needles: string[]): boolean {
  return needles.some((needle) => titleIncludes(entry, needle) || hintIncludes(entry, needle))
}

export function seasonForDate(date = new Date()): ChallengeSeason {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

export function isPackInSeason(pack: MonthlyPack, date = new Date()): boolean {
  return pack.season === 'evergreen' || pack.season === seasonForDate(date)
}

export function visibleMonthlyPacks(date = new Date()): MonthlyPack[] {
  return MONTHLY_PACKS.filter((pack) => isPackInSeason(pack, date))
}

/** Evergreen challenge lineup. Seasonal challenges may exist in data, but
 *  only render when their season is active. */
export const MONTHLY_PACKS: MonthlyPack[] = [
  {
    id: 'beach-explorer',
    title: 'Beach Explorer',
    identity: 'Beach Explorer',
    description: 'Salt air, wide horizons, and adventures that feel bigger than the block.',
    region: 'Coastal challenge',
    atmosphere: 'Low tide, soft light, wind in the ears.',
    icon: '🌊',
    illustration: 'beach',
    requiredCount: 4,
    xpBonusLabel: 'Premium badge progress',
    category: 'exploration',
    environment: 'coastal',
    season: 'evergreen',
    lockedHint: 'Complete beach, shore, or salt-air adventures to earn this coastal badge.',
    completedFlavor: 'Beach Explorer earned. Your dog knows the coast now.',
    matches: (entry) => vibeIs(entry, 'salt') || anyTextIncludes(entry, 'beach', 'shore', 'coast', 'ocean'),
  },
  {
    id: 'trail-scout',
    title: 'Trail Scout',
    identity: 'Trail Scout',
    description: 'Dirt paths, green edges, and routes with a little more mystery.',
    region: 'Trail challenge',
    atmosphere: 'Pine shade, loose-leash curiosity, deeper miles.',
    icon: '🥾',
    illustration: 'trail',
    requiredCount: 5,
    xpBonusLabel: 'Premium badge progress',
    category: 'exploration',
    environment: 'trail',
    season: 'evergreen',
    lockedHint: 'Log trail, hike, canyon, or wild-edge adventures.',
    completedFlavor: 'Trail Scout earned. The map has paw prints now.',
    matches: (entry) => vibeIs(entry, 'wander') || anyTextIncludes(entry, 'trail', 'hike', 'canyon', 'wild'),
  },
  {
    id: 'coffee-walk-champion',
    title: 'Coffee Walk Champion',
    identity: 'Coffee Walk Champion',
    description: 'Warm cups, steady blocks, and the joy of becoming a regular.',
    region: 'Coffee challenge',
    atmosphere: 'Espresso steam, sidewalk rhythm, polite admiration.',
    icon: '☕',
    illustration: 'coffee',
    requiredCount: 4,
    xpBonusLabel: 'Premium badge progress',
    category: 'social',
    environment: 'urban',
    season: 'evergreen',
    lockedHint: 'Choose coffee walks or cafe loops to build this ritual.',
    completedFlavor: 'Coffee Walk Champion earned. The barista knows the leash jingle.',
    matches: (entry) => anyTextIncludes(entry, 'coffee', 'café', 'cafe'),
  },
  {
    id: 'patio-pup',
    title: 'Patio Pup',
    identity: 'Patio Pup',
    description: 'Courtyards, shade, and dog-friendly stops that make errands feel social.',
    region: 'Patio challenge',
    atmosphere: 'Chair shade, water bowls, friendly passersby.',
    icon: '🪑',
    illustration: 'patio',
    requiredCount: 4,
    xpBonusLabel: 'Premium badge progress',
    category: 'social',
    environment: 'urban',
    season: 'evergreen',
    lockedHint: 'Complete patio, cafe, or dog-friendly hangout adventures.',
    completedFlavor: 'Patio Pup earned. You have a favorite table now.',
    matches: (entry) => anyTextIncludes(entry, 'patio', 'courtyard', 'hangout'),
  },
  {
    id: 'brewery-buddy',
    title: 'Brewery Buddy',
    identity: 'Brewery Buddy',
    description: 'Laid-back social outings with room to settle in and people-watch.',
    region: 'Brewery challenge',
    atmosphere: 'Long benches, patio chatter, golden-hour ease.',
    icon: '🍺',
    illustration: 'brewery',
    requiredCount: 3,
    xpBonusLabel: 'Premium badge progress',
    category: 'social',
    environment: 'social',
    season: 'evergreen',
    lockedHint: 'Brewery or beer-garden adventures count toward this badge.',
    completedFlavor: 'Brewery Buddy earned. Your pup has excellent patio manners.',
    matches: (entry) => anyTextIncludes(entry, 'brewery', 'beer garden', 'brew'),
  },
  {
    id: 'park-hopper',
    title: 'Park Hopper',
    identity: 'Park Hopper',
    description: 'Grass loops, shade trees, and the small triumph of finding a new favorite bench.',
    region: 'Park challenge',
    atmosphere: 'Open lawns, soft shade, familiar squirrels.',
    icon: '🌳',
    illustration: 'park',
    requiredCount: 5,
    xpBonusLabel: 'Premium badge progress',
    category: 'routine',
    environment: 'park',
    season: 'evergreen',
    lockedHint: 'Park and green-space adventures fill this track.',
    completedFlavor: 'Park Hopper earned. Your dog has opinions about every bench.',
    matches: (entry) => anyTextIncludes(entry, 'park', 'green space') || (vibeIs(entry, 'wander') && anyTextIncludes(entry, 'loop', 'day')),
  },
  {
    id: 'scenic-sniffer',
    title: 'Scenic Sniffer',
    identity: 'Scenic Sniffer',
    description: 'Views, overlooks, and the routes your dog experiences nose-first.',
    region: 'Scenic challenge',
    atmosphere: 'Skyline moments, long shadows, slow pauses.',
    icon: '🌄',
    illustration: 'scenic',
    requiredCount: 4,
    xpBonusLabel: 'Premium badge progress',
    category: 'exploration',
    environment: 'evening',
    season: 'evergreen',
    lockedHint: 'Scenic walks, overlooks, and view-first routes count.',
    completedFlavor: 'Scenic Sniffer earned. The view was nice. The smells were better.',
    matches: (entry) => anyTextIncludes(entry, 'scenic', 'view', 'overlook', 'sunset'),
  },
  {
    id: 'dog-park-regular',
    title: 'Dog Park Regular',
    identity: 'Dog Park Regular',
    description: 'Social laps, familiar faces, and a dog who knows exactly where the gate is.',
    region: 'Dog park challenge',
    atmosphere: 'Gate excitement, new friends, satisfied naps.',
    icon: '🐕',
    illustration: 'dog-park',
    requiredCount: 4,
    xpBonusLabel: 'Premium badge progress',
    category: 'social',
    environment: 'park',
    season: 'evergreen',
    lockedHint: 'Dog park and off-leash social adventures count here.',
    completedFlavor: 'Dog Park Regular earned. The regulars noticed.',
    matches: (entry) => anyTextIncludes(entry, 'dog park', 'off-leash', 'meetup') || (vibeIs(entry, 'wild') && anyTextIncludes(entry, 'social', 'friend')),
  },
  {
    id: 'weekend-explorer',
    title: 'Weekend Explorer',
    identity: 'Weekend Explorer',
    description: 'The bigger outings that happen when the calendar finally opens up.',
    region: 'Weekend challenge',
    atmosphere: 'Open schedule, longer routes, extra curiosity.',
    icon: '🗺️',
    illustration: 'adventure',
    requiredCount: 4,
    xpBonusLabel: 'Premium badge progress',
    category: 'exploration',
    environment: 'suburban',
    season: 'evergreen',
    lockedHint: 'Saturday and Sunday adventures count toward this badge.',
    completedFlavor: 'Weekend Explorer earned. Free time became field notes.',
    matches: (entry) => {
      const day = new Date(entry.completedAt).getDay()
      return day === 0 || day === 6
    },
  },
  {
    id: 'sunset-stroller',
    title: 'Sunset Stroller',
    identity: 'Sunset Stroller',
    description: 'Evening walks that turn the end of the day into a shared ritual.',
    region: 'Sunset challenge',
    atmosphere: 'Long shadows, warm light, slower goodbyes.',
    icon: '🌅',
    illustration: 'scenic',
    requiredCount: 3,
    xpBonusLabel: 'Premium badge progress',
    environment: 'evening',
    season: 'evergreen',
    lockedHint: 'Complete adventures between 5pm and 9pm.',
    completedFlavor: 'Sunset Stroller earned. The day ends better this way.',
    matches: (entry) => {
      const hour = hourOf(entry)
      return hour >= SUNSET_HOUR_START && hour <= SUNSET_HOUR_END
    },
  },
  {
    id: 'early-bird-walker',
    title: 'Early Bird Walker',
    identity: 'Early Bird Walker',
    description: 'Quiet morning loops before the neighborhood fully wakes up.',
    region: 'Morning challenge',
    atmosphere: 'Cool air, empty sidewalks, first-light focus.',
    icon: '🌤️',
    illustration: 'neighborhood',
    requiredCount: 3,
    xpBonusLabel: 'Premium badge progress',
    category: 'routine',
    environment: 'suburban',
    season: 'evergreen',
    lockedHint: 'Complete adventures before 9am to earn this early badge.',
    completedFlavor: 'Early Bird Walker earned. You owned the morning.',
    matches: (entry) => {
      const hour = hourOf(entry)
      return hour >= 5 && hour < EARLY_HOUR_END
    },
  },
  {
    id: 'neighborhood-navigator',
    title: 'Neighborhood Navigator',
    identity: 'Neighborhood Navigator',
    description: 'Familiar streets, new smells, and the confidence of knowing home turf.',
    region: 'Neighborhood challenge',
    atmosphere: 'Mailbox corners, porch light, the regular route with new details.',
    icon: '🏡',
    illustration: 'neighborhood',
    requiredCount: 6,
    xpBonusLabel: 'Premium badge progress',
    category: 'routine',
    environment: 'suburban',
    season: 'evergreen',
    lockedHint: 'Routine loops and neighborhood walks build this badge.',
    completedFlavor: 'Neighborhood Navigator earned. Home turf, fully charted.',
    matches: (entry) => anyTextIncludes(entry, 'neighborhood', 'home loop', 'block', 'routine'),
  },
  {
    id: 'holiday-adventure',
    title: 'Holiday Adventure Challenge',
    identity: 'Holiday Adventurer',
    description: 'Festive lights, winter routes, and seasonal memories worth saving.',
    region: 'Holiday challenge',
    atmosphere: 'Twinkle lights, chilly air, special routes.',
    icon: '✨',
    illustration: 'adventure',
    requiredCount: 3,
    xpBonusLabel: 'Seasonal badge progress',
    environment: 'evening',
    season: 'winter',
    seasonal: 'Winter seasonal',
    lockedHint: 'This seasonal challenge returns in winter.',
    completedFlavor: 'Holiday Adventure earned. A seasonal memory sealed.',
    matches: (entry) => anyTextIncludes(entry, 'holiday', 'lights') || vibeIs(entry, 'pulse'),
  },
]
