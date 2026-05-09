export type ZoneId = 'home-block' | 'park-district' | 'the-shore' | 'quiet-streets' | 'new-spot' | 'wild-edge'

export type ZoneStatus = 'open' | 'teased' | 'locked'

export interface Zone {
  id: ZoneId
  name: string
  tagline: string
  emoji: string
  flavor: string
  unlocksAt: number // totalAdventures required to open
  teasedAt: number // totalAdventures where tease appears
  themeClass: string
}

export const ZONES: Zone[] = [
  {
    id: 'home-block',
    name: 'The Home Block',
    tagline: 'Familiar ground. The story starts here.',
    emoji: '🏡',
    flavor: 'Every adventure begins where the leash clips on.',
    unlocksAt: 0,
    teasedAt: 0,
    themeClass: 'zone--home',
  },
  {
    id: 'park-district',
    name: 'The Park District',
    tagline: 'Grass underfoot. Other dogs nearby.',
    emoji: '🌳',
    flavor: 'The regulars are starting to recognize your pup.',
    unlocksAt: 5,
    teasedAt: 3,
    themeClass: 'zone--park',
  },
  {
    id: 'the-shore',
    name: 'The Shore',
    tagline: 'Salt air. Wide open. Anything could happen.',
    emoji: '🌊',
    flavor: 'The tide pools have been waiting.',
    unlocksAt: 10,
    teasedAt: 7,
    themeClass: 'zone--shore',
  },
  {
    id: 'quiet-streets',
    name: 'The Quiet Streets',
    tagline: 'Evening light. Strange smells. Slower pace.',
    emoji: '🌙',
    flavor: 'Your dog notices things here that daylight hides.',
    unlocksAt: 3,
    teasedAt: 1,
    themeClass: 'zone--night',
  },
  {
    id: 'new-spot',
    name: 'The New Spot',
    tagline: 'Somewhere your dog has never been.',
    emoji: '🗺️',
    flavor: 'Rotates. Always different. Always worth it.',
    unlocksAt: 8,
    teasedAt: 6,
    themeClass: 'zone--explore',
  },
  {
    id: 'wild-edge',
    name: 'The Wild Edge',
    tagline: 'Untamed. Longer. The big adventures live here.',
    emoji: '🌿',
    flavor: 'Not every dog finds this place.',
    unlocksAt: 20,
    teasedAt: 15,
    themeClass: 'zone--wild',
  },
]

// Returns status of each zone based on totalAdventures
export function getZoneStatuses(totalAdventures: number): Record<ZoneId, ZoneStatus> {
  const result = {} as Record<ZoneId, ZoneStatus>
  for (const zone of ZONES) {
    if (totalAdventures >= zone.unlocksAt) {
      result[zone.id] = 'open'
    } else if (totalAdventures >= zone.teasedAt) {
      result[zone.id] = 'teased'
    } else {
      result[zone.id] = 'locked'
    }
  }
  return result
}

// Returns the next zone about to unlock — for anticipation copy
export function getNextUnlockingZone(totalAdventures: number): { zone: Zone; adventuresAway: number } | null {
  const upcoming = ZONES.filter((z) => z.unlocksAt > totalAdventures).sort((a, b) => a.unlocksAt - b.unlocksAt)
  if (!upcoming.length) return null
  return {
    zone: upcoming[0],
    adventuresAway: upcoming[0].unlocksAt - totalAdventures,
  }
}

// Keep this export so nothing that imported PATH_REGIONS breaks immediately
// We will clean up those imports in a later step
export const PATH_REGIONS = ZONES
export const PATH_TOTAL_NODES = 48
export function getPathNodes() {
  return []
}
export function getPathNodeStates() {
  return []
}
export function pathCompletionRatio(totalAdventures: number) {
  return Math.min(1, totalAdventures / 48)
}
export function peekNextRegion(totalAdventures: number) {
  const next = getNextUnlockingZone(totalAdventures)
  if (!next) return null
  return { title: next.zone.name, preview: next.zone.tagline, nodesAway: next.adventuresAway }
}
