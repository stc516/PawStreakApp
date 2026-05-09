export type AppRoute = '/' | '/app' | '/adventure' | '/reward' | '/story' | '/badges'

/** Hidden vibe used for mechanics — never shown as “park/beach” labels */
export type VibeArchetype = 'pulse' | 'wander' | 'salt' | 'wild'

export type AdventureRarity = 'common' | 'uncommon' | 'rare'
export type AdventureCategory = 'social' | 'exploration' | 'chill' | 'chaos' | 'routine'

export type DogMood = 'restless' | 'curious' | 'explorer' | 'social' | 'zoomie' | 'chill'

/** Locale inferred from ZIP — drives mission pools (no APIs). */
export type ZipLocale = 'generic' | 'coastal' | 'urban' | 'suburban' | 'trail'

/** Fully-specified daily mission card from the localized engine */
export interface GeneratedMission {
  title: string
  emoji: string
  category: AdventureCategory
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

export type DogPersonalityId = 'social' | 'trail' | 'reluctant' | 'chaos'

export type DogEnergyLevel = 'endless' | 'bursts' | 'steady' | 'selective'

export interface DogProfile {
  name: string
  breed: string
  age: number | null
  personality: DogPersonalityId[]
  energyLevel: DogEnergyLevel | null
}

export interface OwnerProfile {
  goals: string[]
}

export interface UserProfile {
  homeLat: number | null
  homeLng: number | null
  homeZip: string
}

export type NotificationCadence = 'daily' | 'weekly' | 'apponly'

export interface NotificationPrefs {
  cadence: NotificationCadence
  morningTime: string
  eveningTime: string
}

export interface PawstreakState {
  onboardingComplete: boolean
  dogName: string
  dogProfile: DogProfile
  ownerProfile: OwnerProfile
  userProfile: UserProfile
  notificationPrefs: NotificationPrefs
  /** True when current device location is far from saved home (ZIP center or lat/lng). */
  isAway: boolean
  /** Welcome ribbon after first onboarding; dismissed via dashboard. */
  welcomeBannerDismissed: boolean
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
  /** Legacy safety reserve flag retained for compatibility with older local saves. */
  emergencyTreatAvailable: boolean
  /** Cached teaser line for dashboard / reward */
  tomorrowTease: string
}

export function defaultDogProfile(partial?: Partial<DogProfile>): DogProfile {
  return {
    name: '',
    breed: '',
    age: null,
    personality: [],
    energyLevel: null,
    ...partial,
  }
}

export function defaultOwnerProfile(): OwnerProfile {
  return { goals: [] }
}

export function defaultUserProfile(): UserProfile {
  return { homeLat: null, homeLng: null, homeZip: '' }
}

export function defaultNotificationPrefs(): NotificationPrefs {
  return {
    cadence: 'daily',
    morningTime: '07:00',
    eveningTime: '19:00',
  }
}
