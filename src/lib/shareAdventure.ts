import { track } from './analytics'
import type { AdventureCategory, AdventureRarity } from '../types'

const CATEGORY_LABELS: Record<AdventureCategory, string> = {
  social: 'Social',
  exploration: 'Exploration',
  chill: 'Chill',
  chaos: 'Chaos',
  routine: 'Routine',
}

interface ShareAdventurePayload {
  dogName: string
  title: string
  category: AdventureCategory
  streak: number
  locationHint?: string
  flavor?: string
  /** Optional analytics-only — never included in the shared text. */
  rarity?: AdventureRarity
}

function buildShareText(payload: ShareAdventurePayload): string {
  const lines = [
    `${payload.dogName} discovered:`,
    payload.title.toUpperCase(),
    `${payload.locationHint || 'Our neighborhood'} · ${CATEGORY_LABELS[payload.category]}`,
    `Day ${payload.streak} of great days`,
  ]
  if (payload.flavor) lines.push(payload.flavor)
  lines.push('Shared from PawStreak')
  return lines.join('\n')
}

export async function shareAdventure(payload: ShareAdventurePayload): Promise<'shared' | 'copied'> {
  const text = buildShareText(payload)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({
      title: `${payload.dogName}'s Adventure`,
      text,
    })
    track('adventure_shared', {
      adventure_category: payload.category,
      adventure_rarity: payload.rarity,
      method: 'native',
    })
    return 'shared'
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    track('share_fallback_used', { reason: 'no_native_share' })
    await navigator.clipboard.writeText(text)
    track('adventure_shared', {
      adventure_category: payload.category,
      adventure_rarity: payload.rarity,
      method: 'clipboard',
    })
    return 'copied'
  }

  throw new Error('Sharing is not available on this device')
}
