import { localeFromZip } from '../data/localAdventureEngine'
import { resolveUserEnvironment } from './resolveUserEnvironment'
import type { GeneratedMission, PawstreakState, ZipLocale } from '../types'

type PlaceTone = {
  worldName: string
  atmosphere: string
  discoveryPrompt: string
  atlasNoun: string
}

const PLACE_TONES: Record<ZipLocale, PlaceTone> = {
  coastal: {
    worldName: 'near the coast',
    atmosphere: '',
    discoveryPrompt: '',
    atlasNoun: 'spots',
  },
  urban: {
    worldName: 'in town',
    atmosphere: '',
    discoveryPrompt: '',
    atlasNoun: 'blocks',
  },
  suburban: {
    worldName: 'around home',
    atmosphere: '',
    discoveryPrompt: '',
    atlasNoun: 'loops',
  },
  trail: {
    worldName: 'near trails',
    atmosphere: '',
    discoveryPrompt: '',
    atlasNoun: 'trails',
  },
  generic: {
    worldName: 'nearby',
    atmosphere: '',
    discoveryPrompt: '',
    atlasNoun: 'places',
  },
}

const CATEGORY_DISCOVERY: Record<GeneratedMission['category'], string> = {
  social: '',
  exploration: '',
  chill: '',
  chaos: '',
  routine: '',
}

function cleanLocation(value: string | undefined): string {
  return value?.trim() || 'Nearby'
}

export function buildPlaceIdentity(state: PawstreakState) {
  const zip = state.userProfile.homeZip || state.zipCode || ''
  const locale = localeFromZip(zip)
  const resolution = resolveUserEnvironment(zip)
  const tone = PLACE_TONES[locale]
  const mission = state.generatedMission

  const neighborhood =
    resolution.source === 'handcrafted'
      ? resolution.environment.neighborhood
      : cleanLocation(mission.locationHint)

  return {
    locale,
    worldName: resolution.source === 'handcrafted' ? neighborhood.split('/')[0]?.trim() ?? neighborhood : tone.worldName,
    atmosphere: tone.atmosphere,
    atlasNoun: tone.atlasNoun,
    locationLine: cleanLocation(mission.locationHint),
    discoveryPrompt: mission.locationHint ? CATEGORY_DISCOVERY[mission.category] : tone.discoveryPrompt,
    microQuest: tone.discoveryPrompt,
  }
}
