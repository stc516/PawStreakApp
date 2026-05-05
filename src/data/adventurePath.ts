import type { AdventureRarity } from '../types'

export type RegionId = 'neighborhood' | 'harbor' | 'sunset' | 'trail' | 'night' | 'legendary'

export type PathNodeVariant = 'standard' | 'rare' | 'milestone'

export interface PathRegionDef {
  id: RegionId
  title: string
  preview: string
  themeClass: string
  /** Nodes in this region */
  count: number
}

/** Six themed worlds — progression order bottom → top of scroll (we render region 1 first at top = journey start) */
export const PATH_REGIONS: PathRegionDef[] = [
  {
    id: 'neighborhood',
    title: 'Neighborhood Beginnings',
    preview: 'Sidewalk circuits · first rituals',
    themeClass: 'path-region--hood',
    count: 8,
  },
  {
    id: 'harbor',
    title: 'Harbor Patrols',
    preview: 'Salt air · wider loops',
    themeClass: 'path-region--harbor',
    count: 8,
  },
  {
    id: 'sunset',
    title: 'Sunset Routes',
    preview: 'Golden-hour missions',
    themeClass: 'path-region--sunset',
    count: 8,
  },
  {
    id: 'trail',
    title: 'Trail Expeditions',
    preview: 'Dirt under paws',
    themeClass: 'path-region--trail',
    count: 8,
  },
  {
    id: 'night',
    title: 'Night Watch',
    preview: 'Porch-light adventures',
    themeClass: 'path-region--night',
    count: 8,
  },
  {
    id: 'legendary',
    title: 'Legendary Adventures',
    preview: 'Rare pulls · forever pace',
    themeClass: 'path-region--legend',
    count: 8,
  },
]

export const PATH_TOTAL_NODES = PATH_REGIONS.reduce((s, r) => s + r.count, 0)

export interface PathNodeModel {
  globalIndex: number
  regionId: RegionId
  indexInRegion: number
  variant: PathNodeVariant
}

/** Flatten regions into indexed nodes with variants (deterministic pattern) */
export function buildPathNodes(): PathNodeModel[] {
  const out: PathNodeModel[] = []
  let globalIndex = 0
  for (const region of PATH_REGIONS) {
    for (let i = 0; i < region.count; i += 1) {
      const lastInRegion = i === region.count - 1
      const rareSlot = (globalIndex + region.id.charCodeAt(0)) % 9 === 4
      let variant: PathNodeVariant = 'standard'
      if (lastInRegion) variant = 'milestone'
      else if (rareSlot) variant = 'rare'
      out.push({
        globalIndex,
        regionId: region.id,
        indexInRegion: i,
        variant,
      })
      globalIndex += 1
    }
  }
  return out
}

const NODE_CACHE = buildPathNodes()

export function getPathNodes(): PathNodeModel[] {
  return NODE_CACHE
}

export interface PathNodeState {
  status: 'done' | 'current' | 'locked'
  /** Extra pulse when today’s rolled mission is rare */
  rareGlow?: boolean
}

/**
 * Node `i` is done when totalAdventures > i.
 * Current checkpoint is min(totalAdventures, PATH_TOTAL_NODES - 1) when still climbing.
 */
export function getPathNodeStates(
  totalAdventures: number,
  todayAdventureDone: boolean,
  missionRarity: AdventureRarity,
): PathNodeState[] {
  return NODE_CACHE.map((_, i) => {
    if (totalAdventures > i) {
      return { status: 'done' as const }
    }
    if (totalAdventures === i) {
      const rareGlow = missionRarity === 'rare' && !todayAdventureDone
      return { status: 'current' as const, rareGlow }
    }
    return { status: 'locked' as const }
  })
}

/** Overall path completion 0–1 for meter */
export function pathCompletionRatio(totalAdventures: number): number {
  return Math.min(1, totalAdventures / PATH_TOTAL_NODES)
}

/** When a few adventures away from the next world, surface anticipation copy */
export function peekNextRegion(totalAdventures: number): { title: string; preview: string; nodesAway: number } | null {
  let cum = 0
  for (let i = 0; i < PATH_REGIONS.length; i += 1) {
    const r = PATH_REGIONS[i]
    const start = cum
    cum += r.count
    if (i === 0) continue
    const nodesAway = start - totalAdventures
    if (nodesAway > 0 && nodesAway <= 4) {
      return { title: r.title, preview: r.preview, nodesAway }
    }
  }
  return null
}
