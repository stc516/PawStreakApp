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
    worldName: 'the Salt-Air Loop',
    atmosphere: 'Salt air, open sky, slow horizons.',
    discoveryPrompt: 'Notice one smell the ocean carried in today.',
    atlasNoun: 'coastal corners',
  },
  urban: {
    worldName: 'the City Blocks',
    atmosphere: 'Crosswalk rhythm, cafe doors, sidewalk stories.',
    discoveryPrompt: 'Let your dog pick one storefront or corner to study.',
    atlasNoun: 'city corners',
  },
  suburban: {
    worldName: 'the Home-Turf Maze',
    atmosphere: 'Shade trees, mailbox trails, familiar turns with new evidence.',
    discoveryPrompt: 'Take one block you usually skip.',
    atlasNoun: 'home-turf routes',
  },
  trail: {
    worldName: 'the Trail Edge',
    atmosphere: 'Dirt under paws, green quiet, bigger breaths.',
    discoveryPrompt: 'Pause when your dog finds the first wild smell.',
    atlasNoun: 'trail marks',
  },
  generic: {
    worldName: 'the Neighborhood Map',
    atmosphere: 'Doorways, corners, familiar ground becoming a story.',
    discoveryPrompt: 'Find one tiny place your dog knows better than you do.',
    atlasNoun: 'neighborhood memories',
  },
}

const CATEGORY_DISCOVERY: Record<GeneratedMission['category'], string> = {
  social: 'Today is about being part of the neighborhood.',
  exploration: 'Today is about adding a new corner to the mental map.',
  chill: 'Today is about softness, air, and taking the long breath.',
  chaos: 'Today is about letting the nose write the route.',
  routine: 'Today is about making familiar ground feel cared for.',
}

function cleanLocation(value: string | undefined): string {
  return value?.trim() || 'your nearby world'
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
    worldName: resolution.source === 'handcrafted' ? neighborhood : tone.worldName,
    atmosphere: tone.atmosphere,
    atlasNoun: tone.atlasNoun,
    locationLine: cleanLocation(mission.locationHint),
    discoveryPrompt: mission.locationHint ? CATEGORY_DISCOVERY[mission.category] : tone.discoveryPrompt,
    microQuest: tone.discoveryPrompt,
  }
}
