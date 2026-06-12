import type {
  AdventureCategory,
  AdventureRarity,
  DogMood,
  GeneratedMission,
} from '../../types'

import { LOCAL_SPOT_CATEGORIES } from './categories'
import { currentBestTimeBucket, spotVibeForSpot } from './localSpotSelectors'
import type { LocalMarketId, LocalSpot, LocalSpotBestTime, LocalSpotCategory } from './types'

export interface MissionFromLocalSpotParams {
  spot: LocalSpot
  dogName: string
  dogMood: DogMood
  streak: number
  nonce: string
  zipCode: string
  rarity: AdventureRarity
  now?: Date
}

const MINUTES_BY_CATEGORY: Record<LocalSpotCategory, { min: number; max: number }> = {
  beach: { min: 25, max: 45 },
  trail: { min: 30, max: 55 },
  coffee: { min: 15, max: 28 },
  brewery: { min: 20, max: 40 },
  park: { min: 20, max: 38 },
  patio: { min: 18, max: 35 },
  sunset: { min: 22, max: 40 },
  weekend: { min: 25, max: 42 },
  social: { min: 20, max: 38 },
}

const LEGAL_NAME_SUFFIXES = [
  ' Natural Park',
  ' State Park',
  ' State Beach',
  ' Nature Preserve',
  ' Trailhead',
  ' & Seaport Village',
  ' Beer Co Block',
  ' Mercato Loop',
  ' Prado Walk',
] as const

/** Spots where the full name is already the right editorial hook. */
const ICONIC_SHORT_NAMES: Partial<Record<string, string>> = {
  'sd-fiesta-island': 'Fiesta Island',
  'sd-ntc-park': 'NTC Park',
  'oc-heisler-park': 'Heisler Park',
  'oc-crystal-cove': 'Crystal Cove',
  'oc-top-of-the-world': 'Top of the World',
}

const BANNED_TITLE_PATTERN = /\b(quest|sacred|magical|embark|journey|sniff quest)\b/i
const LEGAL_NOISE_IN_TITLE = /Natural Park|State Beach|State Park|Trailhead|Nature Preserve/

const FIESTA_ISLAND_ID = 'sd-fiesta-island'

type TitleBuildContext = {
  spot: LocalSpot
  shortName: string
  area: string
  timeBucket: LocalSpotBestTime
  offLeash: boolean
}

function isGoldenTime(bucket: LocalSpotBestTime): boolean {
  return bucket === 'golden-hour' || bucket === 'sunset' || bucket === 'evening'
}

function isMorningTime(bucket: LocalSpotBestTime): boolean {
  return bucket === 'early-morning' || bucket === 'morning' || bucket === 'weekend-morning'
}

function isWeekendTime(bucket: LocalSpotBestTime): boolean {
  return bucket === 'weekend-morning' || bucket === 'weekend-afternoon'
}

function isPatioEvening(bucket: LocalSpotBestTime): boolean {
  return bucket === 'weekday-evening' || bucket === 'evening' || bucket === 'golden-hour'
}

function isOffLeashSpot(spot: LocalSpot): boolean {
  return spot.vibeTags.includes('off-leash') || spot.vibeTags.includes('dog-beach')
}

/** Strip legal/tourism naming noise — keep iconic place names intact. */
export function spotShortName(spot: LocalSpot): string {
  const iconic = ICONIC_SHORT_NAMES[spot.id]
  if (iconic) return iconic

  let name = spot.name
  if (name.endsWith(' Dog Beach')) {
    return name.slice(0, -' Dog Beach'.length)
  }

  for (const suffix of LEGAL_NAME_SUFFIXES) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length)
      break
    }
  }

  return name
}

function spotAreaName(spot: LocalSpot): string {
  return spot.neighborhood ?? spot.city
}

function buildBeachTitle(ctx: TitleBuildContext): string {
  if (ctx.offLeash) {
    if (isGoldenTime(ctx.timeBucket)) return `Golden hour at ${ctx.shortName}`
    if (isMorningTime(ctx.timeBucket)) return `Beach morning at ${ctx.shortName}`
    return `Off-leash energy at ${ctx.shortName}`
  }
  if (isGoldenTime(ctx.timeBucket)) return `Golden hour at ${ctx.shortName}`
  if (isMorningTime(ctx.timeBucket)) return `Beach morning at ${ctx.shortName}`
  return `Beach time at ${ctx.shortName}`
}

function buildSunsetTitle(ctx: TitleBuildContext): string {
  return `Golden hour at ${ctx.shortName}`
}

function buildBreweryTitle(ctx: TitleBuildContext): string {
  if (isPatioEvening(ctx.timeBucket)) return `${ctx.area} patio night`
  return `Patio hang in ${ctx.area}`
}

function buildCoffeeTitle(ctx: TitleBuildContext): string {
  if (isMorningTime(ctx.timeBucket)) return `Coffee stop in ${ctx.area}`
  return `Coffee run in ${ctx.area}`
}

function buildPatioTitle(ctx: TitleBuildContext): string {
  return `${ctx.area} patio hang`
}

function buildTrailTitle(ctx: TitleBuildContext): string {
  if (isGoldenTime(ctx.timeBucket)) return `Golden hour hike at ${ctx.shortName}`
  if (isMorningTime(ctx.timeBucket)) return `Morning trail at ${ctx.shortName}`
  return `Trail day at ${ctx.shortName}`
}

function buildParkTitle(ctx: TitleBuildContext): string {
  if (ctx.offLeash) {
    if (ctx.spot.id === FIESTA_ISLAND_ID) {
      if (isGoldenTime(ctx.timeBucket)) return `Golden hour at Fiesta Island`
      if (isMorningTime(ctx.timeBucket)) return `Morning run at Fiesta Island`
      return `Off-leash chaos at Fiesta Island`
    }
    if (isMorningTime(ctx.timeBucket)) return `Morning run at ${ctx.shortName}`
    return `Off-leash time at ${ctx.shortName}`
  }
  if (isMorningTime(ctx.timeBucket)) return `Park morning in ${ctx.area}`
  return `${ctx.shortName} with your pup`
}

function buildWeekendTitle(ctx: TitleBuildContext): string {
  if (isWeekendTime(ctx.timeBucket)) return `Weekend energy in ${ctx.area}`
  return `${ctx.area} market day`
}

function buildSocialTitle(ctx: TitleBuildContext): string {
  if (ctx.spot.vibeTags.includes('harbor-views')) {
    if (isGoldenTime(ctx.timeBucket)) return `Harbor sunset at ${ctx.shortName}`
    return `Harbor breeze at ${ctx.shortName}`
  }
  if (isPatioEvening(ctx.timeBucket)) return `${ctx.area} evening hang`
  return `${ctx.area} adventure`
}

const CATEGORY_TITLE_BUILDERS: Record<LocalSpotCategory, (ctx: TitleBuildContext) => string> = {
  beach: buildBeachTitle,
  sunset: buildSunsetTitle,
  brewery: buildBreweryTitle,
  coffee: buildCoffeeTitle,
  patio: buildPatioTitle,
  trail: buildTrailTitle,
  park: buildParkTitle,
  weekend: buildWeekendTitle,
  social: buildSocialTitle,
}

function fallbackTitle(ctx: TitleBuildContext): string {
  return `Adventure at ${ctx.shortName}`
}

function isTitleAcceptable(title: string): boolean {
  if (title.length > 50) return false
  if (BANNED_TITLE_PATTERN.test(title)) return false
  if (LEGAL_NOISE_IN_TITLE.test(title)) return false
  return true
}

function buildTitleContext(spot: LocalSpot, timeBucket: LocalSpotBestTime): TitleBuildContext {
  return {
    spot,
    shortName: spotShortName(spot),
    area: spotAreaName(spot),
    timeBucket,
    offLeash: isOffLeashSpot(spot),
  }
}

function composeSpotTitle(spot: LocalSpot, timeBucket: LocalSpotBestTime): string {
  const ctx = buildTitleContext(spot, timeBucket)
  const builder = CATEGORY_TITLE_BUILDERS[spot.category]
  const primary = builder(ctx)
  if (isTitleAcceptable(primary)) return primary
  const fallback = fallbackTitle(ctx)
  if (isTitleAcceptable(fallback)) return fallback
  return ctx.shortName.slice(0, 50)
}

function mapSpotCategory(category: LocalSpotCategory): AdventureCategory {
  switch (category) {
    case 'beach':
    case 'trail':
    case 'sunset':
      return 'exploration'
    case 'coffee':
    case 'brewery':
    case 'patio':
    case 'social':
    case 'weekend':
      return 'social'
    case 'park':
      return 'routine'
    default:
      return 'exploration'
  }
}

/** Editorial, local title — real place, real invitation. */
export function buildSpotMissionTitle(spot: LocalSpot, now = new Date()): string {
  return composeSpotTitle(spot, currentBestTimeBucket(now))
}

export function buildSpotLocationHint(spot: LocalSpot): string {
  const area = spot.neighborhood ?? spot.city
  return `${area} · ${spot.city}`
}

export function missionFromLocalSpot(params: MissionFromLocalSpotParams): GeneratedMission {
  const { spot, dogMood, rarity } = params
  const vibe = spotVibeForSpot(spot)
  const moodMatchesToday = spot.moodTags.includes(dogMood)
  const minutes = MINUTES_BY_CATEGORY[spot.category]
  const meta = LOCAL_SPOT_CATEGORIES[spot.category]

  return {
    title: buildSpotMissionTitle(spot, params.now),
    emoji: meta.emoji,
    category: mapSpotCategory(spot.category),
    estimatedMinutesMin: minutes.min,
    estimatedMinutesMax: minutes.max,
    locationHint: buildSpotLocationHint(spot),
    idealMoods: spot.moodTags,
    moodMatchesToday,
    rarity,
    description: spot.shortDescription,
    flavor: spot.whyDogPeopleLoveIt,
    vibe,
    localSpotId: spot.id,
    spotName: spot.name,
    atmosphere: spot.atmosphere,
    whyDogPeopleLoveIt: spot.whyDogPeopleLoveIt,
    marketId: spot.market as LocalMarketId,
    isLocalSpot: true,
  }
}
