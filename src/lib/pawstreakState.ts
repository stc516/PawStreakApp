import { generateLocalizedMission, flattenMission, normalizeZip, refreshTomorrowTease } from '../data/localAdventureEngine'
import { moodForDay } from '../data/missions'
import type { AdventureEntry, BadgeDefinition, GeneratedMission, PawstreakState, VibeArchetype } from '../types'

const STORAGE_KEY = 'pawstreak_demo_state_v4'

function localDayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const defaultBadges: BadgeDefinition[] = [
  { id: 'first-step', name: 'First Pawprint', icon: '🐾', description: "The day the story started — you said yes to your dog's day.", unlocked: true },
  { id: 'three-day-streak', name: 'Three-Day Spark', icon: '✨', description: 'Three days in a row. Momentum is a love language.', unlocked: true },
  { id: 'beach-dog', name: 'Salt on the Snout', icon: '🌅', description: 'Big sky energy — first salt-air mission logged.', unlocked: true },
  {
    id: 'week-warrior',
    name: 'Unshakeable Duo',
    icon: '🫶',
    description: 'Seven-day streak: not perfection — presence.',
    unlocked: false,
  },
  { id: 'explorer', name: 'Pathfinder', icon: '🧭', description: 'Wildcard vibe conquered — curiosity pays rent.', unlocked: false },
  {
    id: 'park-regular',
    name: 'Professional Sniffer',
    icon: '🌿',
    description: 'Five wander missions — nose earned its résumé.',
    unlocked: false,
  },
  { id: 'mystery-one', name: 'Renaissance Dog', icon: '🎭', description: 'All four vibes sampled — range unlocked.', unlocked: false, mystery: true },
  { id: 'mystery-two', name: '???', icon: '❓', description: 'Keep surprising yourselves.', unlocked: false, mystery: true },
]

function seedEntries(): AdventureEntry[] {
  const ago = (days: number) => new Date(Date.now() - 86400000 * days).toISOString()
  return [
    {
      id: 'a-1',
      vibe: 'salt',
      missionTitle: 'Ocean Air Mission',
      emoji: '🌊',
      rarity: 'uncommon',
      adventureEnergy: 55,
      durationMinutes: 34,
      groundCovered: 2.1,
      completedAt: ago(1),
      locationHint: 'Salt mist · big horizon',
      missionDescription: 'Let Bailey ride the breeze.',
      estimatedMinutesMin: 25,
      estimatedMinutesMax: 42,
    },
    {
      id: 'a-2',
      vibe: 'wander',
      missionTitle: 'Sniffari',
      emoji: '👃',
      rarity: 'common',
      adventureEnergy: 44,
      durationMinutes: 28,
      groundCovered: 1.6,
      completedAt: ago(2),
      locationHint: 'Nose-led, no script',
      estimatedMinutesMin: 25,
      estimatedMinutesMax: 40,
    },
    {
      id: 'a-3',
      vibe: 'pulse',
      missionTitle: 'Coffee Walk',
      emoji: '☕',
      rarity: 'common',
      adventureEnergy: 27,
      durationMinutes: 18,
      groundCovered: 0.9,
      completedAt: ago(3),
      locationHint: 'Café loop · your blocks',
      estimatedMinutesMin: 12,
      estimatedMinutesMax: 22,
    },
    {
      id: 'a-4',
      vibe: 'wild',
      missionTitle: 'Mystery Route',
      emoji: '🎲',
      rarity: 'rare',
      adventureEnergy: 68,
      durationMinutes: 45,
      groundCovered: 2.8,
      completedAt: ago(4),
      locationHint: 'Dice picks the turns',
      estimatedMinutesMin: 20,
      estimatedMinutesMax: 45,
    },
    {
      id: 'a-5',
      vibe: 'salt',
      missionTitle: 'Sunset Sniff Mission',
      emoji: '🌅',
      rarity: 'uncommon',
      adventureEnergy: 50,
      durationMinutes: 30,
      groundCovered: 1.9,
      completedAt: ago(5),
      locationHint: 'Sky-first stroll',
      estimatedMinutesMin: 25,
      estimatedMinutesMax: 38,
    },
  ]
}

function initialSelection(
  state: Pick<PawstreakState, 'dogName' | 'currentStreak' | 'pickNonce' | 'dogMood' | 'zipCode'>,
): Pick<PawstreakState, 'generatedMission' | 'selectedVibe' | 'selectedMissionTitle' | 'selectedEmoji' | 'selectedRarity' | 'selectedFlavor'> {
  const generatedMission = generateLocalizedMission({
    zipCode: state.zipCode ?? '',
    dogName: state.dogName,
    dogMood: state.dogMood,
    streak: state.currentStreak,
    nonce: `init|${state.pickNonce}`,
  })
  return {
    generatedMission,
    ...flattenMission(generatedMission),
  }
}

function legacyMissionFromState(parsed: Record<string, unknown>): GeneratedMission | null {
  const title = parsed.selectedMissionTitle
  const emoji = parsed.selectedEmoji
  const vibe = parsed.selectedVibe
  const rarity = parsed.selectedRarity
  const flavor = parsed.selectedFlavor
  if (typeof title !== 'string' || typeof emoji !== 'string') return null
  return {
    title,
    emoji,
    estimatedMinutesMin: 20,
    estimatedMinutesMax: 35,
    locationHint: 'Your neighborhood',
    idealMoods: ['curious', 'chill'],
    moodMatchesToday: true,
    rarity: (rarity as GeneratedMission['rarity']) ?? 'common',
    description: typeof flavor === 'string' ? flavor : `Today’s mission for your pup.`,
    flavor: typeof flavor === 'string' ? flavor : '',
    vibe: (vibe as GeneratedMission['vibe']) ?? 'pulse',
  }
}

const moodToday = localDayKey()

const selectionSeed = initialSelection({
  dogName: 'Bailey',
  currentStreak: 4,
  pickNonce: 0,
  dogMood: moodForDay('Bailey', moodToday),
  zipCode: '',
})

const initialState: PawstreakState = {
  onboardingComplete: false,
  dogName: 'Bailey',
  zipCode: '',
  moodDayKey: moodToday,
  dogMood: moodForDay('Bailey', moodToday),
  currentStreak: 4,
  longestStreak: 9,
  totalAdventures: 47,
  totalGroundCovered: 38.2,
  totalAdventureEnergy: 1840,
  reminderSet: false,
  todayAdventureDone: false,
  pickNonce: 0,
  generatedMission: selectionSeed.generatedMission,
  selectedVibe: selectionSeed.selectedVibe,
  selectedMissionTitle: selectionSeed.selectedMissionTitle,
  selectedEmoji: selectionSeed.selectedEmoji,
  selectedRarity: selectionSeed.selectedRarity,
  selectedFlavor: selectionSeed.selectedFlavor,
  todayDurationMinutes: null,
  todayGroundCovered: null,
  weekAdventures: 3,
  recentAdventures: seedEntries(),
  badges: defaultBadges,
  latestCompletedAdventure: null,
  latestUnlockedBadgeId: null,
  emergencyTreatAvailable: true,
  tomorrowTease: refreshTomorrowTease({ dogName: 'Bailey', zipCode: '' }),
}

function isBrowser() {
  return typeof window !== 'undefined'
}

/** Migrate legacy demo saves */
function migrateLegacy(parsed: Record<string, unknown>): Partial<PawstreakState> {
  const out: Partial<PawstreakState> = {}
  const legacyTypeMap: Record<string, VibeArchetype> = {
    Quick: 'pulse',
    Park: 'wander',
    Beach: 'salt',
    Explore: 'wild',
  }

  if (typeof parsed.zipCode === 'string') {
    out.zipCode = normalizeZip(parsed.zipCode)
  }

  if (typeof parsed.selectedType === 'string' && legacyTypeMap[parsed.selectedType]) {
    out.selectedVibe = legacyTypeMap[parsed.selectedType]
  }
  if (typeof parsed.selectedName === 'string') {
    out.selectedMissionTitle = parsed.selectedName
  }
  if (typeof parsed.totalDistanceMiles === 'number') {
    out.totalGroundCovered = parsed.totalDistanceMiles
  }
  if (typeof parsed.totalAdventureEnergy !== 'number' && typeof parsed.totalXp === 'number') {
    out.totalAdventureEnergy = parsed.totalXp
  }
  if (typeof parsed.emergencyTreatAvailable === 'boolean') {
    out.emergencyTreatAvailable = parsed.emergencyTreatAvailable
  } else {
    out.emergencyTreatAvailable = true
  }

  if (parsed.generatedMission && typeof parsed.generatedMission === 'object') {
    out.generatedMission = parsed.generatedMission as GeneratedMission
  } else {
    const legacy = legacyMissionFromState(parsed)
    if (legacy) out.generatedMission = legacy
  }

  if (Array.isArray(parsed.recentAdventures)) {
    out.recentAdventures = parsed.recentAdventures.map((raw: unknown) => {
      const a = raw as Record<string, unknown>
      const vibe =
        typeof a.type === 'string' && legacyTypeMap[a.type]
          ? legacyTypeMap[a.type]
          : (a.vibe as VibeArchetype) ?? 'pulse'
      const energy =
        typeof a.adventureEnergy === 'number'
          ? a.adventureEnergy
          : typeof a.xpEarned === 'number'
            ? a.xpEarned
            : 12
      const ground =
        typeof a.groundCovered === 'number'
          ? a.groundCovered
          : typeof a.distanceMiles === 'number'
            ? a.distanceMiles
            : 0
      return {
        id: String(a.id ?? crypto.randomUUID()),
        vibe,
        missionTitle: typeof a.missionTitle === 'string' ? a.missionTitle : String(a.name ?? 'Mission'),
        emoji: typeof a.emoji === 'string' ? a.emoji : '🐾',
        rarity: (a.rarity as AdventureEntry['rarity']) ?? 'common',
        adventureEnergy: energy,
        durationMinutes: typeof a.durationMinutes === 'number' ? a.durationMinutes : 15,
        groundCovered: ground,
        completedAt: typeof a.completedAt === 'string' ? a.completedAt : new Date().toISOString(),
        locationHint: typeof a.locationHint === 'string' ? a.locationHint : undefined,
        missionDescription: typeof a.missionDescription === 'string' ? a.missionDescription : undefined,
        estimatedMinutesMin: typeof a.estimatedMinutesMin === 'number' ? a.estimatedMinutesMin : undefined,
        estimatedMinutesMax: typeof a.estimatedMinutesMax === 'number' ? a.estimatedMinutesMax : undefined,
      } satisfies AdventureEntry
    })
  }

  return out
}

export function loadPawstreakState(): PawstreakState {
  if (!isBrowser()) return initialState
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const legacyRaw = window.localStorage.getItem('pawstreak_demo_state_v3')
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw) as Record<string, unknown>
        const migrated = migrateLegacy(parsed)
        const merged = { ...initialState, ...parsed, ...migrated } as PawstreakState
        patchLoadedState(merged)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        return merged
      } catch {
        /* fall through */
      }
    }
    return initialState
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const migrated = migrateLegacy(parsed)
    const merged = { ...initialState, ...parsed, ...migrated } as PawstreakState
    patchLoadedState(merged)
    return merged
  } catch {
    return initialState
  }
}

function patchLoadedState(merged: PawstreakState) {
  const todayKey = localDayKey()
  if (merged.moodDayKey !== todayKey) {
    merged.moodDayKey = todayKey
    merged.dogMood = moodForDay(merged.dogName, todayKey)
  }

  if (!merged.generatedMission?.title || !merged.generatedMission.flavor) {
    const fix = initialSelection({
      dogName: merged.dogName,
      currentStreak: merged.currentStreak,
      pickNonce: merged.pickNonce,
      dogMood: merged.dogMood,
      zipCode: merged.zipCode ?? '',
    })
    Object.assign(merged, fix)
  } else {
    Object.assign(merged, flattenMission(merged.generatedMission))
  }

  merged.tomorrowTease = refreshTomorrowTease({
    dogName: merged.dogName,
    zipCode: merged.zipCode ?? '',
  })

  if (typeof merged.emergencyTreatAvailable !== 'boolean') {
    merged.emergencyTreatAvailable = true
  }
  if (typeof merged.zipCode !== 'string') {
    merged.zipCode = ''
  }
}

export function savePawstreakState(nextState: PawstreakState) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
}

export function setDogName(state: PawstreakState, name: string, zipCodeRaw?: string): PawstreakState {
  const dogName = name.trim() || 'Your dog'
  const zipCode = zipCodeRaw !== undefined ? normalizeZip(zipCodeRaw) : state.zipCode
  const dayKey = localDayKey()
  const dogMood = moodForDay(dogName, dayKey)
  const pickNonce = state.pickNonce + 1
  const next = {
    ...state,
    dogName,
    zipCode,
    onboardingComplete: true,
    moodDayKey: dayKey,
    dogMood,
    pickNonce,
    tomorrowTease: refreshTomorrowTease({ dogName, zipCode }),
  }
  return { ...next, ...initialSelection({ ...next, dogName, dogMood, zipCode }) }
}

export function setZipCode(state: PawstreakState, zipCodeRaw: string): PawstreakState {
  const zipCode = normalizeZip(zipCodeRaw)
  const pickNonce = state.pickNonce + 1
  const generatedMission = generateLocalizedMission({
    zipCode,
    dogName: state.dogName,
    dogMood: state.dogMood,
    streak: state.currentStreak,
    nonce: `zip|${pickNonce}`,
  })
  return {
    ...state,
    zipCode,
    pickNonce,
    generatedMission,
    ...flattenMission(generatedMission),
    tomorrowTease: refreshTomorrowTease({ dogName: state.dogName, zipCode }),
  }
}

export function rollPickForMe(state: PawstreakState): PawstreakState {
  const pickNonce = state.pickNonce + 1
  const generatedMission = generateLocalizedMission({
    zipCode: state.zipCode ?? '',
    dogName: state.dogName,
    dogMood: state.dogMood,
    streak: state.currentStreak,
    nonce: `pick|${pickNonce}`,
  })
  return {
    ...state,
    pickNonce,
    generatedMission,
    ...flattenMission(generatedMission),
    tomorrowTease: refreshTomorrowTease({ dogName: state.dogName, zipCode: state.zipCode ?? '' }),
  }
}

export function selectVibe(state: PawstreakState, vibe: VibeArchetype): PawstreakState {
  const pickNonce = state.pickNonce + 1
  const generatedMission = generateLocalizedMission({
    zipCode: state.zipCode ?? '',
    dogName: state.dogName,
    dogMood: state.dogMood,
    streak: state.currentStreak,
    nonce: `vibe|${pickNonce}|${vibe}`,
    fixedVibe: vibe,
  })
  return {
    ...state,
    pickNonce,
    generatedMission,
    ...flattenMission(generatedMission),
    tomorrowTease: refreshTomorrowTease({ dogName: state.dogName, zipCode: state.zipCode ?? '' }),
  }
}

function applyBadgeUnlocks(state: PawstreakState, nextStreak: number, nextRecent: AdventureEntry[]) {
  let latestUnlockedBadgeId: string | null = null

  const wanderCount = nextRecent.filter((a) => a.vibe === 'wander').length
  const saltCount = nextRecent.filter((a) => a.vibe === 'salt').length
  const wildCount = nextRecent.filter((a) => a.vibe === 'wild').length
  const distinctVibes = new Set(nextRecent.map((a) => a.vibe)).size

  const nextBadges = state.badges.map((badge) => {
    let unlocked = badge.unlocked
    if (badge.id === 'week-warrior' && nextStreak >= 7) unlocked = true
    if (badge.id === 'explorer' && wildCount >= 1) unlocked = true
    if (badge.id === 'park-regular' && wanderCount >= 5) unlocked = true
    if (badge.id === 'beach-dog' && saltCount >= 1) unlocked = true
    if (badge.id === 'mystery-one' && distinctVibes >= 4) unlocked = true

    if (!badge.unlocked && unlocked) latestUnlockedBadgeId = badge.id
    return { ...badge, unlocked }
  })

  return { nextBadges, latestUnlockedBadgeId }
}

export function completeAdventure(state: PawstreakState, walkSeconds: number): PawstreakState {
  const minutes = Math.max(1, Math.floor(walkSeconds / 60))
  const ground = Number((walkSeconds * 0.00042).toFixed(1))
  const base = Math.max(Math.floor(minutes * 5 + ground * 10), 12)
  const rarityMultiplier = state.generatedMission.rarity === 'rare' ? 1.25 : state.generatedMission.rarity === 'uncommon' ? 1.12 : 1
  const adventureEnergy = Math.floor(base * rarityMultiplier)
  const nextStreak = state.currentStreak + 1
  const gm = state.generatedMission

  const completed: AdventureEntry = {
    id: crypto.randomUUID(),
    vibe: gm.vibe,
    missionTitle: gm.title,
    emoji: gm.emoji,
    rarity: gm.rarity,
    adventureEnergy,
    durationMinutes: minutes,
    groundCovered: ground,
    completedAt: new Date().toISOString(),
    locationHint: gm.locationHint,
    missionDescription: gm.description,
    estimatedMinutesMin: gm.estimatedMinutesMin,
    estimatedMinutesMax: gm.estimatedMinutesMax,
  }

  const nextRecent = [completed, ...state.recentAdventures].slice(0, 12)
  const { nextBadges, latestUnlockedBadgeId } = applyBadgeUnlocks(state, nextStreak, nextRecent)

  return {
    ...state,
    todayAdventureDone: true,
    currentStreak: nextStreak,
    longestStreak: Math.max(state.longestStreak, nextStreak),
    totalAdventures: state.totalAdventures + 1,
    totalGroundCovered: Number((state.totalGroundCovered + ground).toFixed(1)),
    totalAdventureEnergy: state.totalAdventureEnergy + adventureEnergy,
    todayDurationMinutes: minutes,
    todayGroundCovered: ground,
    weekAdventures: state.weekAdventures + 1,
    reminderSet: false,
    recentAdventures: nextRecent,
    latestCompletedAdventure: completed,
    badges: nextBadges,
    latestUnlockedBadgeId,
    tomorrowTease: refreshTomorrowTease({ dogName: state.dogName, zipCode: state.zipCode ?? '' }),
  }
}

export function setReminder(state: PawstreakState, value: boolean): PawstreakState {
  return { ...state, reminderSet: value }
}

export function resetRewardFlow(state: PawstreakState): PawstreakState {
  return { ...state, latestUnlockedBadgeId: null }
}
