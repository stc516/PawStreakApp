import { describe, expect, it } from 'vitest'

import {
  missionFallbackConfidenceCue,
  missionHeroBadge,
  missionLocalConfidenceCue,
  missionWhyTodayLine,
} from '../../src/lib/missionSurfaceCopy'
import type { GeneratedMission } from '../../src/types'

const localMission: GeneratedMission = {
  title: 'North Park patio night',
  emoji: '🍺',
  category: 'social',
  estimatedMinutesMin: 20,
  estimatedMinutesMax: 40,
  locationHint: 'North Park · San Diego',
  idealMoods: ['social'],
  moodMatchesToday: true,
  rarity: 'common',
  description: 'Short spot description.',
  flavor: 'Flavor line.',
  vibe: 'pulse',
  localSpotId: 'sd-north-park',
  isLocalSpot: true,
  whyDogPeopleLoveIt: 'Easy patio energy and other dog people around.',
}

const fallbackMission: GeneratedMission = {
  title: 'Sunset Walk',
  emoji: '🌅',
  category: 'exploration',
  estimatedMinutesMin: 18,
  estimatedMinutesMax: 35,
  locationHint: 'Fresh air nearby',
  idealMoods: ['chill'],
  moodMatchesToday: true,
  rarity: 'common',
  description: 'A good walk waiting outside.',
  flavor: 'Keep it easy.',
  vibe: 'salt',
}

describe('missionSurfaceCopy', () => {
  it('shows local badge and confidence cues for curated missions', () => {
    expect(missionHeroBadge(localMission)).toBe('Feels right today')
    expect(missionLocalConfidenceCue(localMission, '92104')).toBe('Near North Park')
    expect(missionWhyTodayLine(localMission)).toBe('Easy patio energy and other dog people around.')
    expect(missionFallbackConfidenceCue(localMission, '92104')).toBeNull()
  })

  it('shows warm fallback cue for unsupported ZIP missions', () => {
    expect(missionHeroBadge(fallbackMission)).toBe('Good fit today')
    expect(missionLocalConfidenceCue(fallbackMission, '83702')).toBeNull()
    expect(missionFallbackConfidenceCue(fallbackMission, '83702')).toBe('Neighborhood adventure')
  })
})
