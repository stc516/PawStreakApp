import { hashString } from '../../data/missions'
import type { AdventureReflectionSignals } from '../../types'

export interface ReflectionOption {
  label: string
  value: string
}

export interface ReflectionQuestion {
  id: string
  prompt: (dogName: string) => string
  options: ReflectionOption[]
}

export interface ReflectionQuestionSet {
  id: string
  questions: ReflectionQuestion[]
}

const SET_ENJOYMENT: ReflectionQuestionSet = {
  id: 'enjoyment',
  questions: [
    {
      id: 'enjoyment',
      prompt: () => 'How was the adventure?',
      options: [
        { label: 'Great', value: 'great' },
        { label: 'Pretty good', value: 'pretty-good' },
        { label: 'Meh', value: 'meh' },
        { label: 'Too much', value: 'too-much' },
      ],
    },
    {
      id: 'favorite-part',
      prompt: (dogName) => `What did ${dogName} love most?`,
      options: [
        { label: 'Sniffs', value: 'sniffs' },
        { label: 'Running', value: 'running' },
        { label: 'Dogs', value: 'dogs' },
        { label: 'People', value: 'people' },
        { label: 'Chilling', value: 'chilling' },
        { label: 'Treats', value: 'treats' },
      ],
    },
    {
      id: 'repeat-intent',
      prompt: () => 'More like this?',
      options: [
        { label: 'Definitely', value: 'definitely' },
        { label: 'Sometimes', value: 'sometimes' },
        { label: 'Not really', value: 'not-really' },
      ],
    },
  ],
}

const SET_ENERGY: ReflectionQuestionSet = {
  id: 'energy',
  questions: [
    {
      id: 'dog-energy',
      prompt: (dogName) => `How was ${dogName}'s energy?`,
      options: [
        { label: 'Calm', value: 'calm' },
        { label: 'Happy', value: 'happy' },
        { label: 'Wild', value: 'wild' },
        { label: 'Tired', value: 'tired' },
      ],
    },
    {
      id: 'best-part',
      prompt: () => 'Best part?',
      options: [
        { label: 'The view', value: 'view' },
        { label: 'The dogs', value: 'dogs' },
        { label: 'The walk', value: 'walk' },
        { label: 'The patio', value: 'patio' },
        { label: 'Exploring', value: 'exploring' },
      ],
    },
    {
      id: 'worth-again',
      prompt: () => 'Worth doing again?',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'Maybe', value: 'maybe' },
        { label: 'Probably not', value: 'probably-not' },
      ],
    },
  ],
}

export const REFLECTION_QUESTION_SETS: ReflectionQuestionSet[] = [SET_ENJOYMENT, SET_ENERGY]

export function pickReflectionQuestionSet(adventureId: string): ReflectionQuestionSet {
  const idx = hashString(`${adventureId}|reflection-set`) % REFLECTION_QUESTION_SETS.length
  return REFLECTION_QUESTION_SETS[idx] ?? SET_ENJOYMENT
}

const REPEAT_FROM_WORTH: Record<string, AdventureReflectionSignals['repeatIntent']> = {
  yes: 'definitely',
  maybe: 'sometimes',
  'probably-not': 'not-really',
}

export function buildReflectionSignals(
  questionSetId: string,
  answers: Record<string, string>,
): AdventureReflectionSignals {
  const signals: AdventureReflectionSignals = {}

  if (answers.enjoyment) {
    signals.enjoyment = answers.enjoyment as AdventureReflectionSignals['enjoyment']
    if (answers.enjoyment === 'too-much') signals.overstimulation = true
    if (answers.enjoyment === 'meh') signals.calmPreference = true
  }

  if (answers['dog-energy']) {
    signals.dogEnergy = answers['dog-energy'] as AdventureReflectionSignals['dogEnergy']
  }

  const favorite =
    answers['favorite-part'] ?? answers['best-part']
  if (favorite) {
    signals.favoritePart = favorite as AdventureReflectionSignals['favoritePart']
  }

  if (answers['repeat-intent']) {
    signals.repeatIntent = answers['repeat-intent'] as AdventureReflectionSignals['repeatIntent']
  }
  if (answers['worth-again']) {
    signals.repeatIntent = REPEAT_FROM_WORTH[answers['worth-again']]
  }

  if (favorite === 'dogs' || favorite === 'people') {
    signals.socialPreference = 'high'
  } else if (favorite === 'chilling' || favorite === 'view') {
    signals.socialPreference = 'low'
  } else if (favorite) {
    signals.socialPreference = 'medium'
  }

  if (favorite === 'running' || favorite === 'exploring' || answers['dog-energy'] === 'wild') {
    signals.activityPreference = 'active'
  } else if (favorite === 'chilling' || answers['dog-energy'] === 'calm' || answers['dog-energy'] === 'tired') {
    signals.activityPreference = 'calm'
  } else if (favorite || answers['dog-energy']) {
    signals.activityPreference = 'balanced'
  }

  if (favorite === 'chilling' || answers['dog-energy'] === 'calm') {
    signals.calmPreference = true
  }

  void questionSetId
  return signals
}
