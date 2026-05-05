import type { AdventureRarity, DogMood, GeneratedMission, PawstreakState, VibeArchetype, ZipLocale } from '../types'

import { flavorForMission, hashString, tomorrowRarePossible } from './missions'

// --- ZIP → locale (no APIs; heuristic groups & prefixes) ---

/** Normalize to 5-digit string or '' */
export function normalizeZip(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 5)
  return d.length === 5 ? d : ''
}

/**
 * Infers a local “vibe” from ZIP for mission pools.
 * Order matters: first match wins.
 */
export function localeFromZip(zip: string): ZipLocale {
  const z = normalizeZip(zip)
  if (!z) return 'generic'

  // San Diego County & nearby coast — product’s “home” coastal profile
  if (z.startsWith('921') || ['92037', '92014', '92075', '92008', '92009', '92011', '91932', '91931', '91942'].includes(z)) {
    return 'coastal'
  }

  // Foothills / trail towns (example set)
  if (['92025', '92026', '92027', '92029', '92082', '92084', '92065', '92060'].includes(z)) {
    return 'trail'
  }

  // Dense urban cores (prefix samples)
  if (
    z.startsWith('100') ||
    z.startsWith('101') ||
    z.startsWith('102') ||
    z.startsWith('104') ||
    z.startsWith('112') ||
    z.startsWith('900') ||
    z.startsWith('902') ||
    z.startsWith('941') ||
    z.startsWith('606') ||
    z.startsWith('303') ||
    z.startsWith('021') ||
    z.startsWith('981')
  ) {
    return 'urban'
  }

  // Typical suburban residential prefixes
  if (
    z.startsWith('920') ||
    z.startsWith('923') ||
    z.startsWith('928') ||
    z.startsWith('906') ||
    z.startsWith('927') ||
    z.startsWith('930')
  ) {
    return 'suburban'
  }

  return 'generic'
}

export function localeLabel(locale: ZipLocale): string {
  const labels: Record<ZipLocale, string> = {
    generic: 'neighborhood',
    coastal: 'salt-air',
    urban: 'city',
    suburban: 'home turf',
    trail: 'trail-side',
  }
  return labels[locale]
}

function pickFrom<T>(list: T[], seed: string): T {
  if (list.length === 0) {
    throw new Error('mission pool empty')
  }
  return list[hashString(seed) % list.length]
}

function rollRarity(seed: string, streak: number, spicyBoost: boolean): AdventureRarity {
  const roll = (hashString(`${seed}|rarity`) % 100) + (streak >= 5 ? 4 : 0) + (spicyBoost ? 5 : 0)
  if (roll >= 93) return 'rare'
  if (roll >= 73) return 'uncommon'
  return 'common'
}

/** Weighted vibe roll biased by locale — still deterministic from nonce */
export function rollVibeForLocale(nonce: string, locale: ZipLocale): VibeArchetype {
  const weights: Record<ZipLocale, [VibeArchetype, number][]> = {
    generic: [
      ['pulse', 1],
      ['wander', 1],
      ['salt', 1],
      ['wild', 1],
    ],
    coastal: [
      ['salt', 4],
      ['pulse', 2],
      ['wander', 2],
      ['wild', 1],
    ],
    urban: [
      ['pulse', 3],
      ['wander', 2],
      ['wild', 2],
      ['salt', 1],
    ],
    suburban: [
      ['wander', 3],
      ['pulse', 2],
      ['salt', 1],
      ['wild', 1],
    ],
    trail: [
      ['wander', 3],
      ['wild', 2],
      ['pulse', 1],
      ['salt', 1],
    ],
  }
  const table = weights[locale]
  const total = table.reduce((s, [, w]) => s + w, 0)
  const n = hashString(`${nonce}|vibe`) % total
  let acc = 0
  for (const [v, w] of table) {
    acc += w
    if (n < acc) return v
  }
  return 'pulse'
}

type Template = {
  title: string
  emoji: string
  vibe: VibeArchetype
  estMin: number
  estMax: number
  locationHint: string
  idealMoods: DogMood[]
}

const GENERIC: Template[] = [
  { title: 'Coffee Walk', emoji: '☕', vibe: 'pulse', estMin: 12, estMax: 22, locationHint: 'Café loop · your blocks', idealMoods: ['chill', 'social', 'curious'] },
  { title: 'Treat Run', emoji: '🍖', vibe: 'pulse', estMin: 10, estMax: 18, locationHint: 'Quick win near home', idealMoods: ['restless', 'zoomie'] },
  { title: 'Golden Hour Mission', emoji: '🌇', vibe: 'pulse', estMin: 20, estMax: 32, locationHint: 'Best light on your route', idealMoods: ['chill', 'curious'] },
  { title: 'Neighborhood Patrol', emoji: '🐕', vibe: 'pulse', estMin: 15, estMax: 28, locationHint: 'Familiar streets, fresh intent', idealMoods: ['curious', 'social'] },
  { title: 'Sniffari', emoji: '👃', vibe: 'wander', estMin: 25, estMax: 40, locationHint: 'Nose-led, no script', idealMoods: ['curious', 'explorer'] },
  { title: 'Long Way Home', emoji: '🏡', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Extra blocks, same door', idealMoods: ['chill', 'explorer'] },
  { title: 'Quiet Street Loop', emoji: '🌙', vibe: 'wander', estMin: 20, estMax: 35, locationHint: 'Low traffic, high smells', idealMoods: ['chill', 'curious'] },
  { title: 'New Smells Route', emoji: '✨', vibe: 'wander', estMin: 25, estMax: 40, locationHint: 'A street you usually skip', idealMoods: ['curious', 'explorer'] },
  { title: 'Sunset Sniff Mission', emoji: '🌅', vibe: 'salt', estMin: 25, estMax: 38, locationHint: 'Sky-first stroll', idealMoods: ['chill', 'social'] },
  { title: 'Ocean Air Reset', emoji: '🌬️', vibe: 'salt', estMin: 22, estMax: 36, locationHint: 'Breeze in the lungs', idealMoods: ['restless', 'chill'] },
  { title: 'Chaos Energy Burn', emoji: '🌀', vibe: 'wild', estMin: 18, estMax: 30, locationHint: 'Main-character pace', idealMoods: ['zoomie', 'restless'] },
  { title: 'Mystery Route', emoji: '🎲', vibe: 'wild', estMin: 20, estMax: 45, locationHint: 'Dice picks the turns', idealMoods: ['explorer', 'zoomie'] },
]

const COASTAL: Template[] = [
  { title: 'Harbor Patrol', emoji: '⚓', vibe: 'salt', estMin: 22, estMax: 38, locationHint: 'Marina air · gulls overhead', idealMoods: ['curious', 'social'] },
  { title: 'Ocean Air Mission', emoji: '🌊', vibe: 'salt', estMin: 25, estMax: 42, locationHint: 'Salt mist · big horizon', idealMoods: ['chill', 'explorer'] },
  { title: 'Sunset Sniff Mission', emoji: '🌅', vibe: 'salt', estMin: 28, estMax: 40, locationHint: 'Best before sunset', idealMoods: ['chill', 'social'] },
  { title: 'Boardwalk Glow', emoji: '🛼', vibe: 'salt', estMin: 20, estMax: 34, locationHint: 'People watching optional', idealMoods: ['social', 'zoomie'] },
  { title: 'Coronado Loop', emoji: '🏝️', vibe: 'pulse', estMin: 35, estMax: 55, locationHint: 'Island pace · wide sidewalks', idealMoods: ['explorer', 'chill'] },
  { title: 'Coffee Walk', emoji: '☕', vibe: 'pulse', estMin: 14, estMax: 26, locationHint: 'Coastal café orbit', idealMoods: ['chill', 'social'] },
  { title: 'Beach Access Bypass', emoji: '🦀', vibe: 'wander', estMin: 25, estMax: 45, locationHint: 'Sand nearby · paws decide', idealMoods: ['explorer', 'curious'] },
  { title: 'Sniffari', emoji: '👃', vibe: 'wander', estMin: 28, estMax: 42, locationHint: 'Tide-line curiosity', idealMoods: ['curious', 'explorer'] },
  { title: 'Golden Hour Walk', emoji: '🟠', vibe: 'pulse', estMin: 22, estMax: 35, locationHint: 'Warm light on wet pavement', idealMoods: ['chill', 'social'] },
  { title: 'Chaos Goblin Energy Burn', emoji: '🧨', vibe: 'wild', estMin: 18, estMax: 32, locationHint: 'Seagull chaos tolerated', idealMoods: ['zoomie', 'restless'] },
]

const URBAN: Template[] = [
  { title: 'Coffee Walk', emoji: '☕', vibe: 'pulse', estMin: 12, estMax: 22, locationHint: 'Espresso blocks · quick loops', idealMoods: ['chill', 'social'] },
  { title: 'Mural Hunt', emoji: '🎨', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Color corners · slow rolls', idealMoods: ['curious', 'explorer'] },
  { title: 'People-Watch Stroll', emoji: '👀', vibe: 'pulse', estMin: 18, estMax: 30, locationHint: 'Sidewalk theater', idealMoods: ['social', 'curious'] },
  { title: 'Neighborhood Patrol', emoji: '🚶', vibe: 'pulse', estMin: 16, estMax: 28, locationHint: 'Your grid · confident pace', idealMoods: ['restless', 'social'] },
  { title: 'Sniffari', emoji: '👃', vibe: 'wander', estMin: 24, estMax: 40, locationHint: 'Alley chemistry', idealMoods: ['curious', 'explorer'] },
  { title: 'Long Way Home', emoji: '🏙️', vibe: 'wander', estMin: 26, estMax: 42, locationHint: 'One extra avenue', idealMoods: ['explorer', 'chill'] },
  { title: 'Chaos Energy Burn', emoji: '💥', vibe: 'wild', estMin: 15, estMax: 28, locationHint: 'Crosswalk sprints (safely)', idealMoods: ['zoomie', 'restless'] },
]

const SUBURBAN: Template[] = [
  { title: 'Park Loop', emoji: '🌳', vibe: 'wander', estMin: 22, estMax: 38, locationHint: 'Grass edges · kid chaos optional', idealMoods: ['social', 'chill'] },
  { title: 'Quiet Street Sniffari', emoji: '🍃', vibe: 'wander', estMin: 22, estMax: 36, locationHint: 'Cul-de-sac chemistry', idealMoods: ['chill', 'curious'] },
  { title: 'Long Way Home', emoji: '🏡', vibe: 'wander', estMin: 24, estMax: 40, locationHint: 'Subdivision scenic route', idealMoods: ['explorer', 'chill'] },
  { title: 'Golden Hour Mission', emoji: '🌇', vibe: 'pulse', estMin: 18, estMax: 32, locationHint: 'Porch-light glow era', idealMoods: ['chill', 'social'] },
  { title: 'Treat Run', emoji: '🦴', vibe: 'pulse', estMin: 10, estMax: 20, locationHint: 'Mailbox lap bonus', idealMoods: ['zoomie', 'restless'] },
  { title: 'Neighborhood Patrol', emoji: '🐕‍🦺', vibe: 'pulse', estMin: 16, estMax: 30, locationHint: 'HOA-approved mischief', idealMoods: ['curious', 'social'] },
]

const TRAIL: Template[] = [
  { title: 'Trail Pup Challenge', emoji: '🥾', vibe: 'wander', estMin: 35, estMax: 65, locationHint: 'Dirt under paws', idealMoods: ['explorer', 'restless'] },
  { title: 'Hill Climb', emoji: '⛰️', vibe: 'wander', estMin: 30, estMax: 55, locationHint: 'Elevation as drama', idealMoods: ['restless', 'zoomie'] },
  { title: 'Nature Sniffari', emoji: '🌲', vibe: 'wander', estMin: 32, estMax: 55, locationHint: 'Live oak gossip', idealMoods: ['curious', 'explorer'] },
  { title: 'Summit Chaos', emoji: '🌄', vibe: 'wild', estMin: 28, estMax: 50, locationHint: 'Reward views · loose leash energy', idealMoods: ['zoomie', 'explorer'] },
  { title: 'Coffee Walk', emoji: '☕', vibe: 'pulse', estMin: 14, estMax: 24, locationHint: 'Trailhead café orbit', idealMoods: ['chill'] },
]

const RARE_CORE: Template[] = [
  { title: 'Secret Sniffari', emoji: '🤫', vibe: 'wander', estMin: 30, estMax: 50, locationHint: 'Off-script smells only', idealMoods: ['curious', 'explorer'] },
  { title: 'Full Moon Loop', emoji: '🌕', vibe: 'wild', estMin: 25, estMax: 45, locationHint: 'Tonight counts double', idealMoods: ['explorer', 'social'] },
  { title: 'Hidden Park Mission', emoji: '🗺️', vibe: 'wander', estMin: 28, estMax: 48, locationHint: 'That gate you never opened', idealMoods: ['explorer', 'curious'] },
  { title: 'Farmers Market Pup Walk', emoji: '🥕', vibe: 'pulse', estMin: 25, estMax: 40, locationHint: 'Snacks in the air · polite sniffing', idealMoods: ['social', 'curious'] },
]

const RARE_COASTAL_EXTRA: Template[] = [
  { title: 'Sunrise Ocean Reset', emoji: '🌅', vibe: 'salt', estMin: 30, estMax: 50, locationHint: 'Pink sky · salt lungs', idealMoods: ['chill', 'explorer'] },
]

function poolForLocale(locale: ZipLocale): Template[] {
  switch (locale) {
    case 'coastal':
      return [...COASTAL, ...GENERIC]
    case 'urban':
      return [...URBAN, ...GENERIC]
    case 'suburban':
      return [...SUBURBAN, ...GENERIC]
    case 'trail':
      return [...TRAIL, ...GENERIC]
    default:
      return [...GENERIC]
  }
}

function rarePoolForLocale(locale: ZipLocale): Template[] {
  const base = [...RARE_CORE]
  if (locale === 'coastal') base.push(...RARE_COASTAL_EXTRA)
  return base
}

function buildDescription(params: {
  dogName: string
  dogMood: DogMood
  template: Template
  rarity: AdventureRarity
  locale: ZipLocale
  moodMatches: boolean
}): string {
  const { dogName, dogMood, template, rarity, moodMatches } = params
  const streakHint =
    rarity === 'rare'
      ? 'Rare pull — save this route in your bones.'
      : rarity === 'uncommon'
        ? 'Enough spice to remember tomorrow.'
        : 'Solid warmth beats perfection.'

  const moodLines: Record<DogMood, string[]> = {
    restless: [`${dogName} doesn’t want “fine.” ${dogName} wants GO.`],
    curious: [`Follow ${dogName}’s nose — it’s doing homework.`],
    explorer: [`New corners pay rent today.`],
    social: [`Witnesses welcome. Tail diplomacy engaged.`],
    zoomie: [`Physics optional. Velocity mandatory.`],
    chill: [`Soft goals. Big feelings.`],
  }

  const moodLine = pickFrom(moodLines[dogMood], `${template.title}|mood`)

  const matchLine = moodMatches
    ? `Matches ${dogName}’s mood today — ride that wave.`
    : `Even when ${dogName} feels ${dogMood}, this route still lands.`

  return `${moodLine} ${matchLine} ${streakHint}`
}

export function missionTimeLabel(m: Pick<GeneratedMission, 'estimatedMinutesMin' | 'estimatedMinutesMax'>): string {
  return `${m.estimatedMinutesMin}–${m.estimatedMinutesMax} min`
}

export type GenerateMissionParams = {
  zipCode: string
  dogName: string
  dogMood: DogMood
  streak: number
  nonce: string
  /** When set (manual vibe pick), non-rare pulls stay in this vibe; rare prefers matching vibe when possible */
  fixedVibe?: VibeArchetype
}

/**
 * Localized daily mission — deterministic from nonce + inputs.
 */
export function generateLocalizedMission(params: GenerateMissionParams): GeneratedMission {
  const { zipCode, dogName, dogMood, streak, nonce, fixedVibe } = params
  const locale = localeFromZip(zipCode)
  const pool = poolForLocale(locale)

  const rarity = rollRarity(`${nonce}|roll`, streak, Boolean(fixedVibe && fixedVibe === 'wild'))

  let template: Template

  if (rarity === 'rare') {
    let rarePool = rarePoolForLocale(locale)
    if (fixedVibe) {
      const byVibe = rarePool.filter((t) => t.vibe === fixedVibe)
      if (byVibe.length > 0) rarePool = byVibe
    }
    template = pickFrom(rarePool, `${nonce}|rare`)
  } else {
    const vibe = fixedVibe ?? rollVibeForLocale(`${nonce}|pick`, locale)
    const filtered = pool.filter((t) => t.vibe === vibe)
    const usePool = filtered.length > 0 ? filtered : pool.filter((t) => t.vibe === 'pulse')
    template = pickFrom(usePool.length > 0 ? usePool : pool, `${nonce}|${vibe}|${rarity}`)
  }

  const moodMatchesToday = template.idealMoods.includes(dogMood)
  const description = buildDescription({
    dogName,
    dogMood,
    template,
    rarity,
    locale,
    moodMatches: moodMatchesToday,
  })

  const flavor = flavorForMission({
    mood: dogMood,
    title: template.title,
    dogName,
    rarity,
  })

  return {
    title: template.title,
    emoji: template.emoji,
    estimatedMinutesMin: template.estMin,
    estimatedMinutesMax: template.estMax,
    locationHint: template.locationHint,
    idealMoods: template.idealMoods,
    moodMatchesToday,
    rarity,
    description,
    flavor,
    vibe: template.vibe,
  }
}

/** Flatten generated mission to legacy selected fields */
export function flattenMission(m: GeneratedMission): Pick<
  PawstreakState,
  'selectedVibe' | 'selectedMissionTitle' | 'selectedEmoji' | 'selectedRarity' | 'selectedFlavor'
> {
  return {
    selectedVibe: m.vibe,
    selectedMissionTitle: m.title,
    selectedEmoji: m.emoji,
    selectedRarity: m.rarity,
    selectedFlavor: m.flavor,
  }
}

export function refreshTomorrowTease(input: { dogName: string; zipCode: string; rareTomorrow?: boolean }): string {
  const { dogName, zipCode } = input
  const rareTomorrow = input.rareTomorrow ?? tomorrowRarePossible(dogName)
  const locale = localeFromZip(zipCode)
  const seed = `${dogName}|${zipCode}|tease`
  const variant = hashString(seed) % 4

  const newRoute = hashString(`${zipCode}|route`) % 5 === 0

  if (rareTomorrow && newRoute) {
    return `${dogName} may unlock a new route tomorrow — rare missions are in the air.`
  }
  if (rareTomorrow) {
    return `Rare mission possible tomorrow. Come back for the roll.`
  }
  const localeHint = localeLabel(locale)
  const lines = [
    `Tomorrow’s mission unlocks later tonight — a fresh ${localeHint} surprise drops at midnight.`,
    `Tomorrow’s board resets at midnight. ${dogName}’s next chapter is loading.`,
    `Clock’s ticking — tomorrow’s mission unlocks with the new day.`,
    `Stay curious: ${dogName} gets a new route script tomorrow.`,
  ]
  return lines[variant] ?? lines[0]
}
