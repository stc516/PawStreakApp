import { getAdventureMilestone } from './adventureMilestones'
import { localeFromZip } from '../data/localAdventureEngine'
import { hashString } from '../data/missions'
import type {
  AdventureEntry,
  AdventureCategory,
  GeneratedMission,
  MemoryNarrative,
  ReflectionSource,
  VibeArchetype,
  ZipLocale,
} from '../types'

export type { MemoryNarrative, ReflectionSource }

export type TimeOfDayBucket = 'morning' | 'afternoon' | 'evening' | 'night'

const GENERIC_PLACE_RE =
  /^(your block|near home|near you|home loop|around dusk|a new street|local park|quiet streets|familiar streets|your neighborhood|your blocks)/i

const FALLBACK_REFLECTIONS = [
  'Some walks become memories immediately.',
  'The kind of night you mention later.',
  'Nothing fancy. Just right.',
  'A small outing, kept close.',
  'The kind of walk you remember without trying.',
]

export function timeOfDayBucket(date: Date): TimeOfDayBucket {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

function monthDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** First segment of location hint, trimmed for display. */
export function extractPlaceName(locationHint: string | undefined): string | null {
  const hint = locationHint?.trim() ?? ''
  if (!hint) return null
  const first = hint.split('·')[0].trim()
  if (first.length < 3 || GENERIC_PLACE_RE.test(first)) return null
  const dogBeach = first.match(/^(.+?)\s+Dog Beach$/i)
  if (dogBeach?.[1]) return dogBeach[1].trim()
  if (first.length > 36) return `${first.slice(0, 33)}…`
  return first
}

function pickLines<T>(pool: T[], seed: string, count: number): T[] {
  if (pool.length === 0) return []
  const out: T[] = []
  const used = new Set<number>()
  let i = 0
  while (out.length < count && used.size < pool.length) {
    const idx = hashString(`${seed}|line|${i}`) % pool.length
    i += 1
    if (used.has(idx)) continue
    used.add(idx)
    out.push(pool[idx])
  }
  return out
}

const ATMOSPHERE_BY_VIBE: Record<VibeArchetype, string[]> = {
  salt: [
    'Salt air.',
    'Wide horizon.',
    'Cool ocean hush.',
    'Fading gold on the water.',
    'Quiet tide-line energy.',
    'Wind off the coast.',
  ],
  pulse: [
    'Warm cup weather.',
    'Sidewalk rhythm.',
    'Window light on the block.',
    'Easy patio energy.',
    'Soft city bustle.',
    'Neighborhood glow.',
  ],
  wander: [
    'Pine shade.',
    'Dirt path underfoot.',
    'Birdsong between blocks.',
    'Long shadows on the trail.',
    'Green edges and open sky.',
    'Unhurried miles.',
  ],
  wild: [
    'Plot twists around the corner.',
    'Unscripted turns.',
    'Sniff-first energy.',
    'Surprise in every block.',
    'Loose-leash momentum.',
    'Happy chaos in the air.',
  ],
}

const ATMOSPHERE_BY_LOCALE: Record<ZipLocale, string[]> = {
  coastal: ['Salt mist.', 'Ocean hush.', 'Boardwalk quiet.'],
  urban: ['City light.', 'Crosswalk rhythm.', 'Brick and glass.'],
  suburban: ['Quiet streets.', 'Porch-light glow.', 'Lawn-line calm.'],
  trail: ['Pine and dust.', 'Elevation in the air.', 'Trailhead stillness.'],
  generic: ['Open air.', 'Familiar corners.', 'Soft evening light.'],
}

const ATMOSPHERE_BY_TIME: Record<TimeOfDayBucket, string[]> = {
  morning: ['Cool morning air.', 'Slow start light.'],
  afternoon: ['Midday brightness.', 'Easy warmth.'],
  evening: ['Fading gold.', 'Quiet streets.'],
  night: ['Streetlamp hush.', 'Late-hour calm.'],
}

export function generateEmotionalTitle(input: {
  missionTitle: string
  locationHint?: string
  vibe: VibeArchetype
  category: AdventureCategory
  completedAt: Date
  isAway?: boolean
}): string {
  const place = extractPlaceName(input.locationHint)
  const tod = timeOfDayBucket(input.completedAt)
  const title = input.missionTitle.toLowerCase()

  if (/sunset|last light|golden hour|boardwalk|sunrise|dusk/i.test(title) || (tod === 'evening' && input.vibe === 'salt')) {
    if (place) return `Last light at ${place}`
    return 'Last light on the walk'
  }

  if (/coffee|crawl|brew|patio|café|cafe|espresso/i.test(title)) {
    if (place) return tod === 'morning' ? `Slow morning at ${place}` : `Warm hours at ${place}`
    return tod === 'morning' ? 'A slow morning stop' : 'Warm hours out together'
  }

  if (/beach|ocean|harbor|tide|coast|boardwalk/i.test(title) || input.vibe === 'salt') {
    if (place) return `Salt air at ${place}`
    return 'Salt air and open sky'
  }

  if (/trail|hike|hill|summit|nature|sniffari/i.test(title) || input.vibe === 'wander') {
    if (place) return `Quiet miles near ${place}`
    return 'Quiet miles on the trail'
  }

  if (/brewery|patio|social|meetup|market/i.test(title) || input.category === 'social') {
    if (place) return `Good energy at ${place}`
    return 'A busy patio, good energy'
  }

  if (/park|neighborhood|loop|patrol/i.test(title)) {
    if (place) return `Easy loop through ${place}`
    return 'An easy loop through the neighborhood'
  }

  if (input.isAway && place) return `Somewhere new — ${place}`

  if (place) {
    if (tod === 'night') return `Night walk at ${place}`
    if (tod === 'morning') return `Morning at ${place}`
    return `An outing at ${place}`
  }

  if (tod === 'evening') return 'An evening worth keeping'
  if (tod === 'morning') return 'A morning worth keeping'
  return 'A walk worth keeping'
}

export function generateAtmosphere(input: {
  adventureId: string
  vibe: VibeArchetype
  zipCode: string
  completedAt: Date
}): string[] {
  const locale = localeFromZip(input.zipCode)
  const tod = timeOfDayBucket(input.completedAt)
  const vibePool = ATMOSPHERE_BY_VIBE[input.vibe]
  const localePool = ATMOSPHERE_BY_LOCALE[locale]
  const timePool = ATMOSPHERE_BY_TIME[tod]
  const merged = [...timePool, ...vibePool, ...localePool]
  const lines = pickLines(merged, `${input.adventureId}|atmo`, 2)
  return lines.map((l) => l.replace(/\.$/, '') + '.')
}

function composedReflection(mission: Pick<GeneratedMission, 'description' | 'flavor' | 'title'>): string | null {
  const desc = mission.description?.trim()
  if (desc) return desc
  const flavor = mission.flavor?.trim()
  if (flavor && !/have fun out there/i.test(flavor)) return flavor
  return null
}

export function generateReflection(input: {
  memoryText?: string
  walkSeconds: number
  dogName: string
  mission: Pick<GeneratedMission, 'description' | 'flavor' | 'title'>
}): { reflection: string; reflectionSource: ReflectionSource } {
  const user = input.memoryText?.trim()
  if (user) return { reflection: user, reflectionSource: 'user' }

  if (input.walkSeconds >= 120) {
    const milestone = getAdventureMilestone(input.walkSeconds, input.dogName)
    const line = milestone.line.trim()
    if (line) return { reflection: line, reflectionSource: 'milestone' }
  }

  const composed = composedReflection(input.mission)
  if (composed) return { reflection: composed, reflectionSource: 'composed' }

  const idx = hashString(`${input.dogName}|${input.mission.title}|fallback`) % FALLBACK_REFLECTIONS.length
  return {
    reflection: FALLBACK_REFLECTIONS[idx] ?? FALLBACK_REFLECTIONS[0],
    reflectionSource: 'fallback',
  }
}

export function formatSealMetadata(input: {
  locationHint?: string
  completedAt: Date
}): string {
  const place = extractPlaceName(input.locationHint) ?? 'Near home'
  const tod = timeOfDayBucket(input.completedAt)
  return `${place} · ${monthDayLabel(input.completedAt)} · ${tod}`
}

export function generateAnticipationLine(input: {
  dogName: string
  zipCode: string
  vibe: VibeArchetype
  locale: ZipLocale
}): string {
  const name = input.dogName?.trim() || 'Your dog'
  const pools: Record<VibeArchetype, string[]> = {
    salt: [
      'Salt air and quiet streets tomorrow, too.',
      'Another horizon day might suit you both.',
    ],
    pulse: [
      'A slow sidewalk morning could be next.',
      'Another warm stop might be waiting.',
    ],
    wander: [
      'More green edges when you are ready.',
      'Another unhurried loop could feel right.',
    ],
    wild: [
      'Tomorrow can stay unscripted.',
      'Another surprise turn might be out there.',
    ],
  }
  const localeLine =
    input.locale === 'coastal'
      ? 'The coast is never far from a good walk.'
      : input.locale === 'trail'
        ? 'Trails keep their quiet pull.'
        : null
  const vibeLines = pools[input.vibe]
  const idx = hashString(`${name}|${input.zipCode}|anticipation`) % vibeLines.length
  return localeLine ?? vibeLines[idx] ?? `Tomorrow holds another walk for ${name}.`
}

export function buildMemoryNarrative(input: {
  adventureId: string
  walkSeconds: number
  dogName: string
  memoryText?: string
  mission: GeneratedMission
  zipCode: string
  completedAt: Date
  isAway?: boolean
}): MemoryNarrative {
  const locale = localeFromZip(input.zipCode)
  const emotionalTitle = generateEmotionalTitle({
    missionTitle: input.mission.title,
    locationHint: input.mission.locationHint,
    vibe: input.mission.vibe,
    category: input.mission.category,
    completedAt: input.completedAt,
    isAway: input.isAway,
  })
  const atmosphere = generateAtmosphere({
    adventureId: input.adventureId,
    vibe: input.mission.vibe,
    zipCode: input.zipCode,
    completedAt: input.completedAt,
  })
  const { reflection, reflectionSource } = generateReflection({
    memoryText: input.memoryText,
    walkSeconds: input.walkSeconds,
    dogName: input.dogName,
    mission: input.mission,
  })
  const sealMetadata = formatSealMetadata({
    locationHint: input.mission.locationHint,
    completedAt: input.completedAt,
  })
  const anticipationLine = generateAnticipationLine({
    dogName: input.dogName,
    zipCode: input.zipCode,
    vibe: input.mission.vibe,
    locale,
  })
  const journeyCardSubtitle =
    reflectionSource === 'user'
      ? reflection.length > 90
        ? `${reflection.slice(0, 87)}…`
        : reflection
      : atmosphere[0] ?? reflection

  return {
    emotionalTitle,
    atmosphere,
    reflection,
    reflectionSource,
    sealMetadata,
    anticipationLine,
    journeyCardSubtitle,
  }
}

/** Resolve narrative for an entry — backfill for older saves. */
export function narrativeForEntry(
  entry: AdventureEntry,
  dogName: string,
  zipCode: string,
  isAway = false,
): MemoryNarrative {
  if (entry.memoryNarrative) return entry.memoryNarrative
  const completedAt = new Date(entry.completedAt)
  const mission: GeneratedMission = {
    title: entry.missionTitle,
    emoji: entry.emoji,
    category: 'routine',
    estimatedMinutesMin: entry.estimatedMinutesMin ?? 15,
    estimatedMinutesMax: entry.estimatedMinutesMax ?? 30,
    locationHint: entry.locationHint ?? '',
    idealMoods: [],
    moodMatchesToday: false,
    rarity: entry.rarity,
    description: entry.missionDescription ?? '',
    flavor: '',
    vibe: entry.vibe,
  }
  return buildMemoryNarrative({
    adventureId: entry.id,
    walkSeconds: Math.max(120, entry.durationMinutes * 60),
    dogName,
    memoryText: entry.memoryText,
    mission,
    zipCode,
    completedAt: Number.isFinite(completedAt.getTime()) ? completedAt : new Date(),
    isAway,
  })
}

export function displayTitleForEntry(
  entry: AdventureEntry,
  dogName: string,
  zipCode: string,
): string {
  return narrativeForEntry(entry, dogName, zipCode).emotionalTitle
}

export function memoryReturnTimeLabel(completedAtIso: string, now = new Date()): string {
  const then = new Date(completedAtIso)
  if (!Number.isFinite(then.getTime())) return 'Recently'
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000)
  const hour = then.getHours()
  if (diffDays <= 0) {
    if (hour >= 17 || hour < 5) return 'Tonight'
    return 'Earlier today'
  }
  if (diffDays === 1) return 'Last night'
  if (diffDays === 2) return 'Two nights ago'
  return 'Recently'
}
