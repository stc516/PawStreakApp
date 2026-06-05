import { describe, expect, it } from 'vitest'

import {
  attachAdventureReflection,
  completeAdventure,
  getInitialPawstreakState,
} from '../../src/lib/pawstreakState'
import {
  buildReflectionSignals,
  pickReflectionQuestionSet,
} from '../../src/lib/reflection/reflectionQuestions'
import { generateTodayMission } from '../../src/data/localAdventureEngine'

describe('adventure reflection', () => {
  it('rotates question sets deterministically by adventure id', () => {
    const a = pickReflectionQuestionSet('adventure-a')
    const b = pickReflectionQuestionSet('adventure-b')
    expect(a.id).toMatch(/enjoyment|energy/)
    expect(a.questions.length).toBeGreaterThanOrEqual(2)
    expect(pickReflectionQuestionSet('adventure-a').id).toBe(a.id)
    expect(typeof b.id).toBe('string')
  })

  it('builds normalized recommendation signals from answers', () => {
    const signals = buildReflectionSignals('enjoyment', {
      enjoyment: 'great',
      'favorite-part': 'dogs',
      'repeat-intent': 'definitely',
    })

    expect(signals.enjoyment).toBe('great')
    expect(signals.favoritePart).toBe('dogs')
    expect(signals.repeatIntent).toBe('definitely')
    expect(signals.socialPreference).toBe('high')
    expect(signals.activityPreference).toBe('balanced')
  })

  it('flags overstimulation when enjoyment is too much', () => {
    const signals = buildReflectionSignals('enjoyment', {
      enjoyment: 'too-much',
      'favorite-part': 'running',
      'repeat-intent': 'not-really',
    })

    expect(signals.overstimulation).toBe(true)
    expect(signals.activityPreference).toBe('active')
  })

  it('persists reflection on the completed adventure entry', () => {
    const mission = generateTodayMission({
      zipCode: '92104',
      dogName: 'Bailey',
      dogMood: 'social',
      streak: 1,
      nonce: 'reflection-persist',
    })

    const base = {
      ...getInitialPawstreakState(),
      zipCode: '92104',
      dogName: 'Bailey',
      generatedMission: mission,
      onboardingComplete: true,
    }

    const completed = completeAdventure(base, 600)
    const adventureId = completed.latestCompletedAdventure!.id
    const reflection = {
      questionSetId: 'enjoyment',
      answers: {
        enjoyment: 'pretty-good',
        'favorite-part': 'sniffs',
        'repeat-intent': 'sometimes',
      },
      signals: buildReflectionSignals('enjoyment', {
        enjoyment: 'pretty-good',
        'favorite-part': 'sniffs',
        'repeat-intent': 'sometimes',
      }),
      capturedAt: new Date().toISOString(),
    }

    const saved = attachAdventureReflection(completed, adventureId, reflection)

    expect(saved.recentAdventures[0]?.reflection?.signals.favoritePart).toBe('sniffs')
    expect(saved.latestCompletedAdventure?.reflection?.questionSetId).toBe('enjoyment')
  })
})
