import type { DogMood } from '../../types'

/** Curated outing categories — real-world adventure types, not vibe archetypes. */
export type LocalSpotCategory =
  | 'beach'
  | 'trail'
  | 'coffee'
  | 'brewery'
  | 'park'
  | 'patio'
  | 'sunset'
  | 'weekend'
  | 'social'

export type LocalSpotDogEnergy = 'low' | 'medium' | 'high'

export type LocalSpotSocialLevel = 'quiet' | 'balanced' | 'social'

export type LocalMarketId = 'san-diego' | 'orange-county'

/** When this spot shines — human-readable buckets for recommendation timing. */
export type LocalSpotBestTime =
  | 'early-morning'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'golden-hour'
  | 'sunset'
  | 'evening'
  | 'weekend-morning'
  | 'weekend-afternoon'
  | 'weekday-evening'

export type LocalSpotSeasonalTag =
  | 'summer'
  | 'winter-swell'
  | 'spring-wildflowers'
  | 'holiday-lights'
  | 'farmers-market-season'

export type LocalSpotRecurringTag =
  | 'saturday-market'
  | 'sunday-beach-crowd'
  | 'weeknight-patio'
  | 'monthly-art-walk'
  | 'holiday-weekend'

/**
 * A real, curated place dog people actually go.
 * Phase 1: San Diego + Orange County only.
 */
export interface LocalSpot {
  id: string
  name: string
  city: string
  neighborhood?: string
  zip: string
  lat: number
  lng: number

  market: LocalMarketId

  category: LocalSpotCategory
  vibeTags: string[]
  /** Primary energy this spot is built for (filled by spotRegistry enrich if omitted) */
  energyLevel?: LocalSpotDogEnergy
  /** Dog stamina levels that work here (includes energyLevel) */
  dogEnergy: LocalSpotDogEnergy[]
  /** Owner + dog social exposure level */
  socialLevel: LocalSpotSocialLevel
  /** Moods this spot tends to match */
  moodTags: DogMood[]
  bestTimes: LocalSpotBestTime[]
  seasonalTags?: LocalSpotSeasonalTag[]
  recurringTags?: LocalSpotRecurringTag[]

  shortDescription: string
  atmosphere: string
  whyDogPeopleLoveIt: string

  /** Deprecated visual reference. Product UI uses illustrated category artwork. */
  image?: string

  /** Soft rollout flag per spot */
  isActive: boolean
}

export interface LocalMarket {
  id: LocalMarketId
  name: string
  /** ZIP prefixes that map to this market (5-digit, first 3 chars) */
  zipPrefixes: string[]
  tagline: string
}

export interface LocalSpotFilters {
  market?: LocalMarketId
  category?: LocalSpotCategory
  zip?: string
  maxDistanceKm?: number
  dogEnergy?: LocalSpotDogEnergy
  socialLevel?: LocalSpotSocialLevel
  mood?: DogMood
  bestTime?: LocalSpotBestTime
  vibeTag?: string
  activeOnly?: boolean
}
