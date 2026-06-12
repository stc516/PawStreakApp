import { getEnvironmentForZip, haversineKm } from '../zipEnvironments'

import { ORANGE_COUNTY_SPOTS } from './orangeCountySpots'
import { SAN_DIEGO_SPOTS } from './sanDiegoSpots'
import { getLocalMarketForZip } from './markets'
import type { LocalMarketId, LocalSpot, LocalSpotCategory } from './types'

function normalizeZip(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 5)
  return d.length === 5 ? d : ''
}

function enrichSpot(spot: LocalSpot): LocalSpot {
  const energyLevel = spot.energyLevel ?? spot.dogEnergy?.[0] ?? 'medium'
  const dogEnergy =
    spot.dogEnergy?.length > 0
      ? [...new Set([energyLevel, ...spot.dogEnergy])]
      : [energyLevel]
  return { ...spot, energyLevel, dogEnergy }
}

export const ALL_LOCAL_SPOTS: LocalSpot[] = [...SAN_DIEGO_SPOTS, ...ORANGE_COUNTY_SPOTS].map(enrichSpot)

const byId = new Map(ALL_LOCAL_SPOTS.map((s) => [s.id, s]))

export const LOCAL_SPOT_DEFAULT_RADIUS_KM = 35
export const LOCAL_SPOT_DAY_TRIP_RADIUS_KM = 90

export function getAllLocalSpots(options?: { activeOnly?: boolean }): LocalSpot[] {
  if (options?.activeOnly === false) return [...ALL_LOCAL_SPOTS]
  return ALL_LOCAL_SPOTS.filter((s) => s.isActive)
}

export function getLocalSpotById(id: string): LocalSpot | undefined {
  return byId.get(id)
}

export function getLocalSpotsByMarket(market: LocalMarketId, activeOnly = true): LocalSpot[] {
  return ALL_LOCAL_SPOTS.filter((s) => s.market === market && (!activeOnly || s.isActive))
}

export function getLocalSpotsByCategory(category: LocalSpotCategory, activeOnly = true): LocalSpot[] {
  return ALL_LOCAL_SPOTS.filter((s) => s.category === category && (!activeOnly || s.isActive))
}

export function getLocalSpotsByZip(
  zip: string,
  options?: { maxDistanceKm?: number; activeOnly?: boolean },
): LocalSpot[] {
  const market = getLocalMarketForZip(zip)
  if (!market) return []

  const maxKm = options?.maxDistanceKm ?? LOCAL_SPOT_DEFAULT_RADIUS_KM
  const activeOnly = options?.activeOnly !== false
  const normalized = normalizeZip(zip)
  const env = getEnvironmentForZip(normalized)

  const marketSpots = ALL_LOCAL_SPOTS.filter(
    (s) => s.market === market.id && (!activeOnly || s.isActive),
  )

  if (!env) {
    return marketSpots.filter((s) => s.zip === normalized)
  }

  return marketSpots
    .filter((s) => haversineKm(env.latCenter, env.lngCenter, s.lat, s.lng) <= maxKm)
    .sort(
      (a, b) =>
        haversineKm(env.latCenter, env.lngCenter, a.lat, a.lng) -
        haversineKm(env.latCenter, env.lngCenter, b.lat, b.lng),
    )
}

export function getLocalSpotsNearCoords(
  coords: { lat: number; lng: number },
  options?: { market?: LocalMarketId; maxDistanceKm?: number; activeOnly?: boolean },
): Array<LocalSpot & { distanceKm: number }> {
  const maxKm = options?.maxDistanceKm ?? LOCAL_SPOT_DEFAULT_RADIUS_KM
  const activeOnly = options?.activeOnly !== false
  return ALL_LOCAL_SPOTS
    .filter((spot) => {
      if (options?.market && spot.market !== options.market) return false
      if (activeOnly && !spot.isActive) return false
      return true
    })
    .map((spot) => ({
      ...spot,
      distanceKm: haversineKm(coords.lat, coords.lng, spot.lat, spot.lng),
    }))
    .filter((spot) => spot.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
