import { describe, expect, it } from 'vitest'

import {
  generateTodayMission,
  quickAdventurePicksForZip,
} from '../../src/data/localAdventureEngine'
import { supportedMarketForGeocodedLocation } from '../../src/lib/mapboxGeocoding'
import {
  buildSpotMissionTitle,
  getAllLocalSpots,
  getLocalSpotById,
  spotShortName,
} from '../../src/data/localSpots'
import {
  abandonAdventureSession,
  activeAdventureElapsedSeconds,
  completeAdventure,
  getInitialPawstreakState,
  hydratePawstreakState,
  pauseAdventureSession,
  startAdventureSession,
} from '../../src/lib/pawstreakState'
import type { LocalSpotBestTime } from '../../src/data/localSpots/types'

const BASE_PARAMS = {
  dogName: 'Bailey',
  dogMood: 'social' as const,
  streak: 3,
  nonce: 'phase-2-5-test',
}

const GENERIC_FALLBACK_TITLES = new Set(
  quickAdventurePicksForZip('83702').map((pick) => pick.title),
)

const BANNED_TITLE_PATTERN = /\b(quest|sacred|magical|embark|journey|sniff quest)\b/i
const LEGAL_NOISE_IN_TITLE = /Natural Park|State Beach|State Park|Trailhead|Nature Preserve/

const TIME_BUCKETS: LocalSpotBestTime[] = [
  'early-morning',
  'morning',
  'midday',
  'afternoon',
  'golden-hour',
  'sunset',
  'evening',
  'weekend-morning',
  'weekend-afternoon',
  'weekday-evening',
]

function fixedDateForBucket(bucket: LocalSpotBestTime): Date {
  switch (bucket) {
    case 'early-morning':
      return new Date('2026-05-18T06:30:00')
    case 'morning':
      return new Date('2026-05-18T10:00:00')
    case 'midday':
      return new Date('2026-05-18T12:30:00')
    case 'afternoon':
      return new Date('2026-05-18T15:00:00')
    case 'golden-hour':
      return new Date('2026-05-16T17:30:00')
    case 'sunset':
      return new Date('2026-05-16T19:30:00')
    case 'evening':
      return new Date('2026-05-16T21:00:00')
    case 'weekend-morning':
      return new Date('2026-05-16T09:00:00')
    case 'weekend-afternoon':
      return new Date('2026-05-16T14:00:00')
    case 'weekday-evening':
      return new Date('2026-05-18T18:30:00')
    default:
      return new Date('2026-05-18T10:00:00')
  }
}

describe('generateTodayMission', () => {
  it('returns a local mission for supported San Diego ZIP 92104', () => {
    const mission = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '92104',
      supportedMarketId: 'san-diego',
    })

    expect(mission.isLocalSpot).toBe(true)
    expect(mission.localSpotId).toBeTruthy()
    expect(GENERIC_FALLBACK_TITLES.has(mission.title)).toBe(false)
  })

  it('returns a local mission for supported Orange County ZIP 92648', () => {
    const mission = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '92648',
      supportedMarketId: 'orange-county',
    })

    expect(mission.isLocalSpot).toBe(true)
    expect(mission.localSpotId).toBeTruthy()
  })

  it('returns generic fallback for unsupported ZIP 83702 without localSpotId', () => {
    const mission = generateTodayMission({ ...BASE_PARAMS, zipCode: '83702', supportedMarketId: null })

    expect(mission.isLocalSpot).toBeFalsy()
    expect(mission.localSpotId).toBeUndefined()
    expect(GENERIC_FALLBACK_TITLES.has(mission.title)).toBe(true)
  })

  it('returns generic fallback for Chicago without localSpotId', () => {
    const mission = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '60614',
      supportedMarketId: supportedMarketForGeocodedLocation({
        lat: 41.92,
        lng: -87.65,
        city: 'Chicago',
        district: 'Cook County',
        region: 'Illinois',
      }),
    })

    expect(mission.isLocalSpot).toBeFalsy()
    expect(mission.localSpotId).toBeUndefined()
    expect(GENERIC_FALLBACK_TITLES.has(mission.title)).toBe(true)
  })

  it('detects developed regions from coordinates only', () => {
    expect(
      supportedMarketForGeocodedLocation({
        lat: 32.7157,
        lng: -117.1611,
        city: 'San Diego',
        district: 'San Diego County',
        region: 'California',
      }),
    ).toBe('san-diego')
    expect(
      supportedMarketForGeocodedLocation({
        lat: 33.6595,
        lng: -117.9988,
        city: 'Huntington Beach',
        district: 'Orange County',
        region: 'California',
      }),
    ).toBe('orange-county')
    expect(
      supportedMarketForGeocodedLocation({
        lat: 40.7181,
        lng: -73.8448,
        city: 'San Diego',
        district: 'San Diego County',
        region: 'California',
      }),
    ).toBeNull()
  })

  it('does not return SoCal curated spots for Forest Hills NY', () => {
    const forestHillsMarket = supportedMarketForGeocodedLocation({
      lat: 40.7181,
      lng: -73.8448,
      city: 'Forest Hills',
      district: 'Queens County',
      region: 'New York',
    })

    const mission = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '11375',
      supportedMarketId: forestHillsMarket,
      nonce: 'forest-hills-ny',
    })

    expect(forestHillsMarket).toBeNull()
    expect(mission.isLocalSpot).toBeFalsy()
    expect(mission.localSpotId).toBeUndefined()
    expect(mission.marketId).toBeUndefined()
  })

  it('requires geocoded supported market before using curated spots', () => {
    const mission = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '92104',
      supportedMarketId: null,
      nonce: 'supported-zip-without-geocode',
    })

    expect(mission.isLocalSpot).toBeFalsy()
    expect(mission.localSpotId).toBeUndefined()
  })
})

describe('completeAdventure', () => {
  it('persists localSpotId when the mission came from a curated spot', () => {
    const generatedMission = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '92104',
      supportedMarketId: 'san-diego',
    })
    expect(generatedMission.localSpotId).toBeTruthy()

    const state = {
      ...getInitialPawstreakState(),
      zipCode: '92104',
      dogName: BASE_PARAMS.dogName,
      generatedMission,
    }

    const next = completeAdventure(state, 600)

    expect(next.recentAdventures[0]?.localSpotId).toBe(generatedMission.localSpotId)
  })

  it('persists active adventure timing and completes the active session once', () => {
    const state = {
      ...getInitialPawstreakState(),
      onboardingComplete: true,
      dogName: BASE_PARAMS.dogName,
    }
    const started = startAdventureSession(state, 'home', null, new Date('2026-06-05T12:00:00Z'))
    expect(started.activeAdventure?.source).toBe('home')
    expect(activeAdventureElapsedSeconds(started.activeAdventure, new Date('2026-06-05T12:02:05Z'))).toBe(125)

    const paused = pauseAdventureSession(started, true, new Date('2026-06-05T12:02:05Z'))
    expect(activeAdventureElapsedSeconds(paused.activeAdventure, new Date('2026-06-05T12:05:00Z'))).toBe(125)

    const resumed = pauseAdventureSession(paused, false, new Date('2026-06-05T12:05:00Z'))
    expect(activeAdventureElapsedSeconds(resumed.activeAdventure, new Date('2026-06-05T12:05:10Z'))).toBe(135)

    const completed = completeAdventure(resumed, 135)
    const duplicated = completeAdventure(completed, 135)

    expect(completed.activeAdventure).toBeNull()
    expect(completed.totalAdventures).toBe(1)
    expect(completed.currentStreak).toBe(1)
    expect(completed.badges.find((badge) => badge.id === 'first-adventure')?.unlocked).toBe(true)
    expect(duplicated.totalAdventures).toBe(1)
    expect(duplicated.recentAdventures).toHaveLength(1)
  })

  it('abandons an active adventure without awarding progress', () => {
    const started = startAdventureSession(
      { ...getInitialPawstreakState(), onboardingComplete: true },
      'plan',
      null,
      new Date('2026-06-05T12:00:00Z'),
    )
    const abandoned = abandonAdventureSession(started)

    expect(abandoned.activeAdventure).toBeNull()
    expect(abandoned.totalAdventures).toBe(0)
    expect(abandoned.currentStreak).toBe(0)
  })

  it('counts streaks by local calendar day, not completion count', () => {
    const base = {
      ...getInitialPawstreakState(),
      onboardingComplete: true,
      dogName: BASE_PARAMS.dogName,
      todayAdventureDone: false,
      currentStreak: 4,
      lastAdventureDayKey: '2026-06-04',
    }

    const continued = completeAdventure(base, 600, {
      completedAt: new Date('2026-06-05T12:00:00'),
    })
    expect(continued.currentStreak).toBe(5)
    expect(continued.lastAdventureDayKey).toBe('2026-06-05')

    const sameDay = completeAdventure(
      { ...base, currentStreak: 5, lastAdventureDayKey: '2026-06-05' },
      600,
      { completedAt: new Date('2026-06-05T18:00:00') },
    )
    expect(sameDay.currentStreak).toBe(5)

    const afterGap = completeAdventure(
      { ...base, currentStreak: 5, lastAdventureDayKey: '2026-06-02' },
      600,
      { completedAt: new Date('2026-06-05T12:00:00') },
    )
    expect(afterGap.currentStreak).toBe(1)
  })

  it('reopens Today when loaded state is from an earlier calendar day', () => {
    const loaded = hydratePawstreakState({
      ...getInitialPawstreakState(),
      todayAdventureDone: true,
      todayDurationMinutes: 22,
      todayGroundCovered: 0.8,
      lastAdventureDayKey: '2000-01-01',
    })

    expect(loaded.todayAdventureDone).toBe(false)
    expect(loaded.todayDurationMinutes).toBeNull()
    expect(loaded.todayGroundCovered).toBeNull()
  })
})

describe('local mission title QA', () => {
  it('keeps titles concise, clean, and editorial across all active spots', () => {
    const spots = getAllLocalSpots({ activeOnly: true })

    for (const spot of spots) {
      for (const bucket of TIME_BUCKETS) {
        const now = fixedDateForBucket(bucket)
        const title = buildSpotMissionTitle(spot, now)

        expect(title.length).toBeLessThanOrEqual(50)
        expect(BANNED_TITLE_PATTERN.test(title)).toBe(false)
        expect(LEGAL_NOISE_IN_TITLE.test(title)).toBe(false)
        expect(title).not.toMatch(/\bwalk through\b/i)
        expect(title).not.toMatch(/\bstroll through\b/i)
      }

      const shortName = spotShortName(spot)
      expect(LEGAL_NOISE_IN_TITLE.test(shortName)).toBe(false)
    }
  })
})

describe('vibe selection regression', () => {
  it('changes spot or category when vibe filter changes', () => {
    const salt = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '92104',
      supportedMarketId: 'san-diego',
      nonce: 'vibe-regression',
      fixedVibe: 'salt',
    })
    const pulse = generateTodayMission({
      ...BASE_PARAMS,
      zipCode: '92104',
      supportedMarketId: 'san-diego',
      nonce: 'vibe-regression',
      fixedVibe: 'pulse',
    })

    expect(salt.localSpotId).toBeTruthy()
    expect(pulse.localSpotId).toBeTruthy()

    const saltSpot = getLocalSpotById(salt.localSpotId!)
    const pulseSpot = getLocalSpotById(pulse.localSpotId!)
    expect(saltSpot).toBeDefined()
    expect(pulseSpot).toBeDefined()

    const differentSpot = salt.localSpotId !== pulse.localSpotId
    const differentCategory = saltSpot!.category !== pulseSpot!.category

    expect(differentSpot || differentCategory).toBe(true)
  })
})
