import type { DogMood, VibeArchetype } from '../../types'
import { hashString } from '../missions'

import { getLocalSpotsByZip } from './spotRegistry'
import { getLocalMarketForZip } from './markets'
import type { LocalSpot, LocalSpotBestTime, LocalSpotDogEnergy } from './types'
import type { LocalMarketId } from './types'

export interface SelectLocalSpotParams {
  zipCode: string
  supportedMarketId?: LocalMarketId | null
  dogMood: DogMood
  nonce: string
  fixedVibe?: VibeArchetype
  recentSpotIds?: string[]
  now?: Date
}

const MOOD_ENERGY: Record<DogMood, LocalSpotDogEnergy> = {
  restless: 'high',
  zoomie: 'high',
  explorer: 'high',
  social: 'medium',
  curious: 'medium',
  chill: 'low',
}

const VIBE_CATEGORIES: Record<VibeArchetype, Set<LocalSpot['category']>> = {
  salt: new Set(['beach', 'sunset', 'park']),
  wander: new Set(['trail', 'park', 'sunset']),
  pulse: new Set(['coffee', 'brewery', 'patio', 'social', 'weekend']),
  wild: new Set(['beach', 'park', 'social', 'weekend', 'brewery']),
}

export function currentBestTimeBucket(now = new Date()): LocalSpotBestTime {
  const day = now.getDay()
  const h = now.getHours()
  const isWeekend = day === 0 || day === 6

  if (isWeekend && h >= 7 && h < 12) return 'weekend-morning'
  if (isWeekend && h >= 12 && h < 17) return 'weekend-afternoon'
  if (!isWeekend && h >= 17 && h < 21) return 'weekday-evening'
  if (h >= 5 && h < 9) return 'early-morning'
  if (h >= 9 && h < 12) return 'morning'
  if (h >= 12 && h < 14) return 'midday'
  if (h >= 14 && h < 17) return 'afternoon'
  if (h >= 17 && h < 19) return 'golden-hour'
  if (h >= 19 && h < 21) return 'sunset'
  return 'evening'
}

export function spotVibeForSpot(spot: LocalSpot): VibeArchetype {
  switch (spot.category) {
    case 'beach':
    case 'sunset':
      return 'salt'
    case 'trail':
      return 'wander'
    case 'brewery':
    case 'social':
      return spot.socialLevel === 'social' ? 'wild' : 'pulse'
    case 'coffee':
    case 'patio':
    case 'weekend':
      return 'pulse'
    case 'park':
      return (spot.energyLevel ?? 'medium') === 'high' ? 'wild' : 'wander'
    default:
      return 'pulse'
  }
}

function energyMatchScore(spot: LocalSpot, mood: DogMood): number {
  const target = MOOD_ENERGY[mood]
  const level = spot.energyLevel ?? spot.dogEnergy[0] ?? 'medium'
  if (level === target) return 3
  if (spot.dogEnergy.includes(target)) return 2
  const gap = Math.abs(levelRank(level) - levelRank(target))
  return gap === 1 ? 1 : 0
}

function levelRank(level: LocalSpotDogEnergy): number {
  if (level === 'low') return 0
  if (level === 'medium') return 1
  return 2
}

function scoreSpot(
  spot: LocalSpot,
  params: SelectLocalSpotParams,
  timeBucket: LocalSpotBestTime,
): number {
  let score = 0

  if (spot.moodTags.includes(params.dogMood)) score += 4
  score += energyMatchScore(spot, params.dogMood)

  if (spot.bestTimes.includes(timeBucket)) score += 3
  if (timeBucket === 'golden-hour' || timeBucket === 'sunset') {
    if (spot.category === 'sunset' || spot.vibeTags.includes('golden-hour')) score += 2
  }

  // TODO(weather): heat-aware reranking — deprioritize exposed trails/beaches on hot afternoons.
  // TODO(weather): rain-safe alternatives — boost covered patios, markets, and sheltered harbor routes.
  // TODO(weather): marine layer handling — favor inland patios/trails when coastal spots are socked in.
  // TODO(weather): weather adaptation — fold live conditions into scoreSpot before deterministic pick.

  if (params.recentSpotIds?.includes(spot.id)) score -= 8

  return score
}

/** Deterministic local spot pick for Today — scored, anti-repeat, vibe-aware. */
export function selectLocalSpot(params: SelectLocalSpotParams): LocalSpot | null {
  const zip = params.zipCode.replace(/\D/g, '').slice(0, 5)
  const zipMarket = getLocalMarketForZip(zip)
  const market = params.supportedMarketId === undefined ? zipMarket?.id : params.supportedMarketId
  if (!market || market !== zipMarket?.id) return null

  let pool = getLocalSpotsByZip(zip, { activeOnly: true })
  if (pool.length === 0) return null

  if (params.fixedVibe) {
    const vibePool = pool.filter((s) => {
      const vibe = spotVibeForSpot(s)
      if (vibe === params.fixedVibe) return true
      const cats = VIBE_CATEGORIES[params.fixedVibe!]
      return cats.has(s.category)
    })
    if (vibePool.length > 0) pool = vibePool
  }

  const timeBucket = currentBestTimeBucket(params.now)

  const scored = pool
    .map((spot) => ({ spot, score: scoreSpot(spot, params, timeBucket) }))
    .sort((a, b) => b.score - a.score)

  const topScore = scored[0]?.score ?? 0
  const tier = scored.filter((s) => s.score >= topScore - 1)
  const idx = hashString(`${params.nonce}|local-spot`) % tier.length
  return tier[idx]?.spot ?? scored[0]?.spot ?? null
}
