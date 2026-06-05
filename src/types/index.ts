export type AppRoute = '/' | '/app' | '/adventure' | '/reward' | '/story' | '/badges'

/** Hidden vibe used for mechanics — never shown as “park/beach” labels */
export type VibeArchetype = 'pulse' | 'wander' | 'salt' | 'wild'

export type AdventureRarity = 'common' | 'uncommon' | 'rare'
export type AdventureCategory = 'social' | 'exploration' | 'chill' | 'chaos' | 'routine'

export type DogMood = 'restless' | 'curious' | 'explorer' | 'social' | 'zoomie' | 'chill'

export type ReflectionSource = 'user' | 'milestone' | 'composed' | 'fallback'

/** Normalized lightweight signals for future recommendation tuning. */
export interface AdventureReflectionSignals {
  enjoyment?: 'great' | 'pretty-good' | 'meh' | 'too-much'
  repeatIntent?: 'definitely' | 'sometimes' | 'not-really'
  dogEnergy?: 'calm' | 'happy' | 'wild' | 'tired'
  favoritePart?:
    | 'sniffs'
    | 'running'
    | 'dogs'
    | 'people'
    | 'chilling'
    | 'treats'
    | 'view'
    | 'walk'
    | 'patio'
    | 'exploring'
  socialPreference?: 'high' | 'medium' | 'low'
  activityPreference?: 'active' | 'balanced' | 'calm'
  overstimulation?: boolean
  calmPreference?: boolean
}

/** Optional post-adventure check-in — warm, not survey-like. */
export interface AdventureReflection {
  questionSetId: string
  answers: Record<string, string>
  signals: AdventureReflectionSignals
  capturedAt: string
}

export interface MemoryNarrative {
  emotionalTitle: string
  atmosphere: string[]
  reflection: string
  reflectionSource: ReflectionSource
  sealMetadata: string
  anticipationLine: string
  journeyCardSubtitle: string
}

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
  /** Set when mission is anchored to a curated local spot */
  localSpotId?: string
  spotName?: string
  atmosphere?: string
  whyDogPeopleLoveIt?: string
  marketId?: 'san-diego' | 'orange-county'
  image?: string
  isLocalSpot?: boolean
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
  /** Optional memory text the owner captured on the Adventure screen.
   *  Free-form, kept local (never sent to analytics). */
  memoryText?: string
  /** Curated local spot id when adventure used a real place */
  localSpotId?: string
  /** Emotional story layer generated at completion (Memory Seal). */
  memoryNarrative?: MemoryNarrative
  /** Lightweight post-adventure check-in for future personalization. */
  reflection?: AdventureReflection
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
  homeRawLocationInput?: string
  homeLocationLabel?: string
  homeResolvedCity?: string
  homeResolvedState?: string
  homeResolvedCountry?: string
  homeMapboxPlaceId?: string
  homeMapboxRelevance?: number | null
  homeMapboxConfidence?: string
  homeSupportedMarket?: 'san-diego' | 'orange-county' | null
  homeGeocodeSource?: 'mapbox' | 'manual_zip' | null
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
  /** ISO timestamp when the demo (no-account) experience started. Null until onboarding completes. */
  demoStartedAt: string | null
  /** True once the user has signed up (set by Supabase repository in Phase 3). */
  hasAccount: boolean
  /** ISO timestamp the dashboard "Save progress" nudge was last dismissed.
   *  Used so we can re-surface it after meaningful events (e.g. a fresh
   *  adventure completion) even if the user X'd it earlier. */
  nudgeDismissedAt: string | null
  /** ISO timestamp the post-first-adventure save prompt was acknowledged.
   *  Tracked separately so we never spam the prompt twice. */
  firstAdventurePromptSeenAt: string | null
  /** Adventure id to show the Today return strip after Memory Seal. */
  memoryReturnHighlightId: string | null
  /** Persisted in-progress adventure so refresh/reopen keeps the same outing alive. */
  activeAdventure: ActiveAdventureSession | null
}

export interface ActiveAdventureSession {
  id: string
  mission: GeneratedMission
  startedAt: string
  accumulatedSeconds: number
  pausedAt: string | null
  source: 'home' | 'plan' | 'challenge'
  challengeId: string | null
  memoryText: string
}

/** How long a brand-new user can use the app without signing up. */
export const DEMO_TRIAL_DAYS = 3
export const DEMO_TRIAL_MS = DEMO_TRIAL_DAYS * 24 * 60 * 60 * 1000

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
  return {
    homeLat: null,
    homeLng: null,
    homeZip: '',
    homeRawLocationInput: '',
    homeLocationLabel: '',
    homeResolvedCity: '',
    homeResolvedState: '',
    homeResolvedCountry: '',
    homeMapboxPlaceId: '',
    homeMapboxRelevance: null,
    homeMapboxConfidence: '',
    homeSupportedMarket: null,
    homeGeocodeSource: null,
  }
}

export function defaultNotificationPrefs(): NotificationPrefs {
  return {
    cadence: 'daily',
    morningTime: '07:00',
    eveningTime: '19:00',
  }
}
