export type AppRoute = '/' | '/app' | '/adventure' | '/reward' | '/story' | '/badges'

/** Hidden vibe used for mechanics — never shown as “park/beach” labels */
export type VibeArchetype = 'pulse' | 'wander' | 'salt' | 'wild'

export type AdventureRarity = 'common' | 'uncommon' | 'rare'

export type DogMood = 'restless' | 'curious' | 'explorer' | 'social' | 'zoomie' | 'chill'

/** Locale inferred from ZIP — drives mission pools (no APIs). */
export type ZipLocale = 'generic' | 'coastal' | 'urban' | 'suburban' | 'trail'

/** Fully-specified daily mission card from the localized engine */
export interface GeneratedMission {
  title: string
  emoji: string
  estimatedMinutesMin: number
  estimatedMinutesMax: number
  /** Where / how this mission lives — vibe–location hint */
  locationHint: string
  /** Moods this mission is tuned for */
  idealMoods: DogMood[]
  /** True when today’s daily mood fits the mission */
  moodMatchesToday: boolean
  rarity: AdventureRarity
  /** Short emotional line (dog-first) */
  description: string
  /** Longer mood + rarity flavor line */
  flavor: string
  vibe: VibeArchetype
}

export interface AdventureEntry {
  id: string
  vibe: VibeArchetype
  missionTitle: string
  emoji: string
  rarity: AdventureRarity
  /** Emotional progression currency (formerly XP) */
  adventureEnergy: number
  durationMinutes: number
  /** Soft distance — kept for flavor, not the headline */
  groundCovered: number
  completedAt: string
  /** Snapshot from mission card when completed */
  locationHint?: string
  missionDescription?: string
  estimatedMinutesMin?: number
  estimatedMinutesMax?: number
}

export interface BadgeDefinition {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  mystery?: boolean
}

export interface PawstreakState {
  onboardingComplete: boolean
  dogName: string
  /** Optional ZIP — empty uses generic neighborhood missions */
  zipCode: string
  /** Calendar day key (local) for mood — YYYY-MM-DD */
  moodDayKey: string
  /** Daily rotating mood — same as “daily dog mood” */
  dogMood: DogMood
  currentStreak: number
  longestStreak: number
  totalAdventures: number
  totalGroundCovered: number
  totalAdventureEnergy: number
  reminderSet: boolean
  todayAdventureDone: boolean
  /** Increments each Pick / vibe change for mission variety */
  pickNonce: number
  /** Primary mission payload — localized daily adventure */
  generatedMission: GeneratedMission
  /** Legacy mirrors for quick reads — kept in sync with generatedMission */
  selectedVibe: VibeArchetype
  selectedMissionTitle: string
  selectedEmoji: string
  selectedRarity: AdventureRarity
  selectedFlavor: string
  todayDurationMinutes: number | null
  todayGroundCovered: number | null
  weekAdventures: number
  recentAdventures: AdventureEntry[]
  badges: BadgeDefinition[]
  latestCompletedAdventure: AdventureEntry | null
  latestUnlockedBadgeId: string | null
  /** Emergency Treat (formerly streak freeze) — demo: always available until product consumes it */
  emergencyTreatAvailable: boolean
  /** Cached teaser line for dashboard / reward */
  tomorrowTease: string
}
