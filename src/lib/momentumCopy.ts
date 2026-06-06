import { localeFromZip } from '../data/localAdventureEngine'
import { hashString } from '../data/missions'
import { getLocalSpotById } from '../data/localSpots/spotRegistry'
import { isLocalMarketZip } from '../data/localSpots/markets'
import type { AdventureEntry, DogMood, GeneratedMission, VibeArchetype } from '../types'

export type TomorrowTeaseInput = {
  dogName: string
  zipCode: string
  dogMood?: DogMood
  vibe?: VibeArchetype
  streak?: number
  recentAdventures?: AdventureEntry[]
  generatedMission?: GeneratedMission
  now?: Date
}

export type CompletionAnticipationInput = {
  dogName: string
  zipCode: string
  vibe: VibeArchetype
  mission?: GeneratedMission
  streak?: number
  now?: Date
}

const GENERIC_PLACE_RE =
  /^(your block|near home|near you|home loop|around dusk|a new street|local park|quiet streets|familiar streets|your neighborhood|your blocks|fresh air nearby|neighborhood park|around the corner|your usual blocks|somewhere new nearby|golden hour nearby|trails nearby|open space nearby)/i

function pickLine(pool: string[], seed: string, fallback: string): string {
  const lines = pool.filter(Boolean)
  if (lines.length === 0) return fallback
  return lines[hashString(seed) % lines.length] ?? lines[0] ?? fallback
}

function normalizedZip(zipCode: string): string {
  return zipCode.replace(/\D/g, '').slice(0, 5)
}

function placeFromHint(locationHint?: string): string | null {
  const hint = locationHint?.trim()
  if (!hint) return null
  const segment = hint.split('·')[0]?.trim()
  if (!segment || segment.length < 3 || GENERIC_PLACE_RE.test(segment)) return null
  const dogBeach = segment.match(/^(.+?)\s+Dog Beach$/i)
  if (dogBeach?.[1]) return dogBeach[1].trim()
  return segment.length > 36 ? `${segment.slice(0, 33)}…` : segment
}

function spotNeighborhood(spotId?: string): string | null {
  if (!spotId) return null
  const spot = getLocalSpotById(spotId)
  return spot?.neighborhood ?? placeFromHint(spot?.name) ?? null
}

function dominantRecentVibe(recent: AdventureEntry[]): VibeArchetype | null {
  const counts = new Map<VibeArchetype, number>()
  for (const entry of recent.slice(0, 5)) {
    counts.set(entry.vibe, (counts.get(entry.vibe) ?? 0) + 1)
  }
  let best: VibeArchetype | null = null
  let max = 0
  for (const [vibe, count] of counts) {
    if (count > max) {
      max = count
      best = vibe
    }
  }
  return best
}

export function isWeekendEnergyDay(now = new Date()): boolean {
  const day = now.getDay()
  return day === 5 || day === 6 || day === 0
}

/** Warm streak language — lifestyle rhythm, not grind pressure. */
export function streakRhythmLine(streak: number, dogName: string): string {
  const name = dogName.trim() || 'Your dog'
  if (streak <= 0) return 'First good dog day starts here'
  if (streak === 1) return 'One good dog day down'
  if (streak === 2) return 'Two good dog days in a row'
  if (streak < 7) return `${streak} good dog days in a row`
  if (streak < 14) return `You two are on a nice streak — ${streak} days`
  return `${name}'s been getting out a lot lately`
}

/** Lightweight Fri/Sat/Sun energy — no scheduling UI. */
export function weekendEnergyCue(now = new Date()): string | null {
  const day = now.getDay()
  if (day === 5) return 'Weekend energy — might be worth the longer route today.'
  if (day === 6) return 'Good day for a longer adventure.'
  if (day === 0) return 'Sunday pace — easy outing, big payoff.'
  return null
}

function localTomorrowHints(
  zip: string,
  name: string,
  vibe: VibeArchetype | undefined,
  mission?: GeneratedMission,
): string[] {
  if (!isLocalMarketZip(zip)) return []

  const hints: string[] = []
  const neighborhood = spotNeighborhood(mission?.localSpotId) ?? placeFromHint(mission?.locationHint)

  if (vibe === 'salt' || mission?.category === 'exploration') {
    hints.push(`Tomorrow's looking good for a beach run.`)
    hints.push(`Golden hour could be worth chasing tomorrow.`)
  }
  if (vibe === 'pulse' || mission?.category === 'social') {
    hints.push(`${name} might be due for a patio night tomorrow.`)
    hints.push(`A coffee stop could feel right tomorrow.`)
  }
  if (vibe === 'wander') {
    hints.push(`More trail time might suit you both tomorrow.`)
  }
  if (neighborhood) {
    hints.push(`Another good night around ${neighborhood} could work tomorrow.`)
  }
  hints.push(`Looks like a good week for local adventures.`)

  return hints
}

/** Contextual tomorrow tease for Today — anticipation without notification spam. */
export function buildTomorrowTease(input: TomorrowTeaseInput): string {
  const name = input.dogName.trim() || 'Your dog'
  const zip = normalizedZip(input.zipCode)
  const now = input.now ?? new Date()
  const vibe = input.vibe ?? input.generatedMission?.vibe
  const seed = `${name}|${zip}|${vibe ?? 'any'}|${input.streak ?? 0}|tease-v4`

  const pools: string[] = []

  if (isWeekendEnergyDay(now)) {
    pools.push(
      `Looks like a good weekend for getting out together.`,
      `${name} might be ready for something fun tomorrow.`,
      `Tomorrow could be a patio kind of day.`,
    )
  }

  pools.push(...localTomorrowHints(zip, name, vibe, input.generatedMission))

  if (!isLocalMarketZip(zip)) {
    pools.push(
      `Tomorrow: fresh air nearby for ${name}.`,
      `A good neighborhood loop could be waiting.`,
      `Something simple and fun tomorrow — near home.`,
    )
  }

  if ((input.streak ?? 0) >= 3) {
    pools.push(`You two have been on a roll lately.`)
  }

  const recent = input.recentAdventures ?? []
  if (recent.length > 0) {
    const place = placeFromHint(recent[0]?.locationHint)
    if (place) {
      pools.push(`${place} worked well — something new tomorrow might too.`)
    }
    const localOutings = recent.filter((a) => a.localSpotId).length
    if (localOutings >= 2) {
      pools.push(`You and ${name} have been exploring a lot lately.`)
    }
    const dominant = dominantRecentVibe(recent)
    if (dominant === 'salt') pools.push(`Seems like beach weather has been winning lately.`)
  }

  if (input.dogMood === 'social') {
    pools.push(`${name} might enjoy a people-and-pups kind of day tomorrow.`)
  }

  pools.push(
    `Tomorrow holds another outing worth taking.`,
    `New picks land at midnight — something good for ${name}.`,
  )

  return pickLine(pools, seed, `Tomorrow: fresh route for ${name}.`)
}

/** Post-adventure headline for afterglow — bonding + local continuity. */
export function buildAfterglowHeadline(
  entry: AdventureEntry | null | undefined,
  dogName: string,
  streak: number,
): string {
  const name = dogName.trim() || 'Your dog'
  if (!entry) return "Tonight's memory is part of your story now."

  const place = placeFromHint(entry.locationHint)
  const title = entry.missionTitle.toLowerCase()
  const seed = `${entry.id}|afterglow-headline|${streak}`

  const pools: string[] = []

  if (place) {
    pools.push(`${place} was a good call tonight.`)
    pools.push(`Another good night around ${place}.`)
  }
  if (/fiesta island/i.test(title)) {
    pools.push(`Fiesta Island delivered.`)
  }
  if (streak >= 2) {
    pools.push(`${name} earned that nap — ${streak} good days in a row.`)
  } else {
    pools.push(`${name} earned that nap.`)
  }
  pools.push(`That felt like a solid dog day.`)

  return pickLine(pools, seed, "Tonight's memory is part of your story now.")
}

/** Tomorrow line set after Memory Seal — warm, lightly predictive. */
export function buildCompletionAnticipationLine(input: CompletionAnticipationInput): string {
  const name = input.dogName.trim() || 'Your dog'
  const zip = normalizedZip(input.zipCode)
  const locale = localeFromZip(zip)
  const now = input.now ?? new Date()
  const vibe = input.vibe
  const seed = `${name}|${zip}|${vibe}|${input.streak ?? 0}|completion-anticipation`

  const pools: string[] = []
  const neighborhood =
    spotNeighborhood(input.mission?.localSpotId) ?? placeFromHint(input.mission?.locationHint)

  if (isLocalMarketZip(zip)) {
    if (vibe === 'salt') {
      pools.push(`Tomorrow's looking good for a beach run.`)
      pools.push(`Golden hour could be worth chasing tomorrow.`)
    }
    if (vibe === 'pulse') {
      pools.push(`${name} might be due for a patio night tomorrow.`)
    }
    if (neighborhood) {
      pools.push(`Another good night around ${neighborhood} tomorrow?`)
    }
  }

  if (isWeekendEnergyDay(now) || now.getDay() === 4) {
    pools.push(`Weekend energy is coming — might be worth planning something fun.`)
  }

  if ((input.streak ?? 0) >= 3) {
    pools.push(`Looks like a good week for local adventures.`)
  }

  const localePools: Partial<Record<typeof locale, string[]>> = {
    coastal: ['The coast is never far from a good walk.', 'Another tide-line evening could call to you.'],
    trail: ['Trails keep their quiet pull.', 'More green edges when the day opens.'],
    suburban: ['Quiet streets tomorrow, same good company.', 'Another familiar loop could feel right.'],
  }
  pools.push(...(localePools[locale] ?? []))

  const vibePools: Record<VibeArchetype, string[]> = {
    salt: ['Salt air and quiet streets tomorrow, too.', 'Another horizon day might suit you both.'],
    pulse: ['A slow sidewalk morning could be next.', 'Another warm stop might be waiting.'],
    wander: ['More green edges when you are ready.', 'Another unhurried loop could feel right.'],
    wild: ['Tomorrow can stay unscripted.', 'Another surprise turn might be out there.'],
  }
  pools.push(...vibePools[vibe])

  return pickLine(pools, seed, `Tomorrow holds another walk for ${name}.`)
}
