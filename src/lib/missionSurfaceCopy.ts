import { isLocalMarketZip } from '../data/localSpots/markets'
import type { GeneratedMission } from '../types'

function normalizedZip(zipCode?: string): string {
  return zipCode?.replace(/\D/g, '').slice(0, 5) ?? ''
}

function neighborhoodFromHint(locationHint?: string): string | null {
  const hint = locationHint?.trim()
  if (!hint) return null
  const area = hint.split('·')[0]?.trim()
  return area || null
}

/** Image overlay badge on Today card — reuses existing pill pattern. */
export function missionHeroBadge(mission: GeneratedMission): string {
  if (mission.isLocalSpot) {
    return mission.moodMatchesToday ? 'Feels right today' : 'Local pick'
  }
  return mission.moodMatchesToday ? 'Good fit today' : 'Today\'s adventure'
}

/** Primary location line — neighborhood + city when available. */
export function missionNeighborhoodLine(mission: GeneratedMission): string {
  return mission.locationHint?.trim() || 'Your neighborhood'
}

/** Single-line local confidence cue for supported markets. */
export function missionLocalConfidenceCue(
  mission: GeneratedMission,
  zipCode?: string,
): string | null {
  if (!mission.isLocalSpot) return null

  const area = neighborhoodFromHint(mission.locationHint)
  if (area) return `Near ${area}`

  const zip = normalizedZip(zipCode)
  if (zip.length === 5) return `Around ${zip}`

  return 'Curated nearby'
}

/** Single-line cue for unsupported ZIP fallback missions — warm, not apologetic. */
export function missionFallbackConfidenceCue(
  mission: GeneratedMission,
  zipCode?: string,
): string | null {
  if (mission.isLocalSpot) return null

  const zip = normalizedZip(zipCode)
  if (zip.length === 5 && !isLocalMarketZip(zip)) {
    return 'Neighborhood adventure'
  }

  return null
}

/** “Why this fits today” — dog-parent line for local spots, description elsewhere. */
export function missionWhyTodayLine(mission: GeneratedMission): string {
  if (mission.isLocalSpot) {
    if (mission.whyDogPeopleLoveIt?.trim()) return mission.whyDogPeopleLoveIt.trim()
    if (mission.description?.trim()) return mission.description.trim()
  }
  return mission.description?.trim() || mission.flavor?.trim() || ''
}

/** Optional social proof for mood-matched local picks. */
export function missionSocialProofCue(mission: GeneratedMission): string | null {
  if (mission.isLocalSpot && mission.moodMatchesToday) {
    return 'Popular with local dog people'
  }
  return null
}

/** Adventure send-off secondary line — location + optional local cue. */
export function missionSendOffSecondaryLine(
  mission: GeneratedMission,
  zipCode?: string,
): string | null {
  const location = mission.locationHint?.trim()
  const localCue = missionLocalConfidenceCue(mission, zipCode)
  const fallbackCue = missionFallbackConfidenceCue(mission, zipCode)

  if (localCue && location) return `${location} · ${localCue}`
  if (localCue) return localCue
  if (fallbackCue && location) return `${location} · ${fallbackCue}`
  if (location) return location
  if (fallbackCue) return fallbackCue
  return null
}
