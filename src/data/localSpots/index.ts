export * from './types'
export * from './categories'
export * from './tags'
export * from './markets'
export {
  ALL_LOCAL_SPOTS,
  LOCAL_SPOT_DEFAULT_RADIUS_KM,
  getAllLocalSpots,
  getLocalSpotById,
  getLocalSpotsByMarket,
  getLocalSpotsByCategory,
  getLocalSpotsByZip,
} from './spotRegistry'
export { SAN_DIEGO_SPOTS } from './sanDiegoSpots'
export { ORANGE_COUNTY_SPOTS } from './orangeCountySpots'
export { selectLocalSpot, currentBestTimeBucket, spotVibeForSpot } from './localSpotSelectors'
export type { SelectLocalSpotParams } from './localSpotSelectors'
export {
  missionFromLocalSpot,
  buildSpotMissionTitle,
  buildSpotLocationHint,
  spotShortName,
} from './localSpotMission'
export type { MissionFromLocalSpotParams } from './localSpotMission'

import type { LocalMarketId, LocalSpotFilters } from './types'
import {
  getAllLocalSpots,
  getLocalSpotsByMarket,
  getLocalSpotsByZip,
} from './spotRegistry'

export function filterLocalSpots(filters: LocalSpotFilters) {
  const activeOnly = filters.activeOnly !== false
  let spots = filters.zip
    ? getLocalSpotsByZip(filters.zip, { maxDistanceKm: filters.maxDistanceKm, activeOnly })
    : getAllLocalSpots({ activeOnly })

  if (filters.market) {
    spots = spots.filter((s) => s.market === filters.market)
  }
  if (filters.category) {
    spots = spots.filter((s) => s.category === filters.category)
  }
  if (filters.dogEnergy) {
    spots = spots.filter(
      (s) => s.energyLevel === filters.dogEnergy || s.dogEnergy.includes(filters.dogEnergy!),
    )
  }
  if (filters.socialLevel) {
    spots = spots.filter((s) => s.socialLevel === filters.socialLevel)
  }
  if (filters.mood) {
    spots = spots.filter((s) => s.moodTags.includes(filters.mood!))
  }
  if (filters.bestTime) {
    spots = spots.filter((s) => s.bestTimes.includes(filters.bestTime!))
  }
  if (filters.vibeTag) {
    spots = spots.filter((s) => s.vibeTags.includes(filters.vibeTag!))
  }

  return spots
}

export function countLocalSpotsByMarket(): Record<LocalMarketId, number> {
  return {
    'san-diego': getLocalSpotsByMarket('san-diego').length,
    'orange-county': getLocalSpotsByMarket('orange-county').length,
  }
}
