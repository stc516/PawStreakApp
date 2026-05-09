import { getEnvironmentForZip, type ZipEnvironment } from '../data/zipEnvironments'

export type UserEnvironmentResolution =
  | {
      source: 'handcrafted'
      environment: ZipEnvironment
      fallbackMessage: null
    }
  | {
      source: 'generic_fallback'
      environment: Pick<ZipEnvironment, 'environmentPrimary' | 'environmentTags'>
      fallbackMessage: string
    }

const GENERIC_FALLBACK_MESSAGE =
  'Local adventure tuning is coming soon for your area. For now, PawStreak will build adventures around your daily walks, parks, routines, and new places nearby.'

export function resolveUserEnvironment(zip: string): UserEnvironmentResolution {
  const handcrafted = getEnvironmentForZip(zip)
  if (handcrafted) {
    return {
      source: 'handcrafted',
      environment: handcrafted,
      fallbackMessage: null,
    }
  }

  return {
    source: 'generic_fallback',
    environment: {
      environmentPrimary: 'residential',
      environmentTags: ['neighborhood', 'daily walks', 'local discovery'],
    },
    fallbackMessage: GENERIC_FALLBACK_MESSAGE,
  }
}

// TODO: Expand ZIP/location resolution with Google Places data.
// TODO: Evaluate Mapbox boundaries for more precise neighborhood matching.
// TODO: Add OpenStreetMap enrichment for park/trail density signals.
