import { describe, expect, it } from 'vitest'

import {
  buildAfterglowHeadline,
  buildCompletionAnticipationLine,
  buildTomorrowTease,
  streakRhythmLine,
  weekendEnergyCue,
} from '../../src/lib/momentumCopy'
import type { AdventureEntry } from '../../src/types'

describe('momentumCopy', () => {
  it('uses warm streak language without grind pressure', () => {
    expect(streakRhythmLine(0, 'Bailey')).toBe('First good dog day starts here')
    expect(streakRhythmLine(3, 'Bailey')).toBe('3 good dog days in a row')
    expect(streakRhythmLine(10, 'Bailey')).toContain('nice streak')
  })

  it('builds contextual tomorrow teases for local markets', () => {
    const tease = buildTomorrowTease({
      dogName: 'Bailey',
      zipCode: '92104',
      vibe: 'salt',
      streak: 4,
      now: new Date('2026-05-16T10:00:00'),
    })

    expect(tease.length).toBeGreaterThan(10)
    expect(tease.toLowerCase()).not.toContain('quest')
    expect(tease.toLowerCase()).not.toContain('xp')
  })

  it('builds warm fallback teases for unsupported ZIPs', () => {
    const tease = buildTomorrowTease({
      dogName: 'Bailey',
      zipCode: '83702',
      streak: 1,
    })

    expect(tease.toLowerCase()).not.toContain('coming soon')
    expect(tease.toLowerCase()).not.toContain('unsupported')
  })

  it('builds afterglow headlines with place and streak continuity', () => {
    const entry: AdventureEntry = {
      id: 'a1',
      vibe: 'pulse',
      missionTitle: 'North Park patio night',
      emoji: '🍺',
      rarity: 'common',
      adventureEnergy: 10,
      durationMinutes: 25,
      groundCovered: 1.2,
      completedAt: new Date().toISOString(),
      locationHint: 'North Park · San Diego',
    }

    const headline = buildAfterglowHeadline(entry, 'Bailey', 3)
    expect(headline.toLowerCase()).not.toContain('mission complete')
    expect(headline.toLowerCase()).not.toContain('xp')
  })

  it('returns weekend energy on Saturdays', () => {
    expect(weekendEnergyCue(new Date('2026-05-16T10:00:00'))).toContain('longer adventure')
    expect(weekendEnergyCue(new Date('2026-05-18T10:00:00'))).toBeNull()
  })

  it('builds completion anticipation without robotic tone', () => {
    const line = buildCompletionAnticipationLine({
      dogName: 'Bailey',
      zipCode: '92104',
      vibe: 'pulse',
      streak: 3,
      now: new Date('2026-05-15T20:00:00'),
    })

    expect(line.toLowerCase()).not.toContain('quest')
    expect(line.length).toBeGreaterThan(12)
  })
})
