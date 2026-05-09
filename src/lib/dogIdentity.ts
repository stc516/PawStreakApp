import type { DogPersonalityId } from '../types'

const PERSONALITY_LABELS: Record<DogPersonalityId, string> = {
  social: 'Social Butterfly',
  trail: 'Trail Dog',
  reluctant: 'Reluctant Explorer',
  chaos: 'Chaos Agent',
}

export function primaryPersonalityLabel(personality: DogPersonalityId[]): string {
  if (!personality.length) return 'Adventure Buddy'
  return PERSONALITY_LABELS[personality[0]]
}

export function personalityExtrasLabel(personality: DogPersonalityId[]): string {
  if (personality.length <= 1) return ''
  return `+${personality.length - 1} more`
}
