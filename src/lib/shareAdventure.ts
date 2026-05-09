import type { AdventureCategory } from '../types'

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
}

function buildShareText(payload: ShareAdventurePayload): string {
  const lines = [
    `${payload.dogName} completed:`,
    payload.title.toUpperCase(),
    `${payload.locationHint || 'Our neighborhood'} · ${CATEGORY_LABELS[payload.category]}`,
    `Day ${payload.streak} streak`,
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
    return 'shared'
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return 'copied'
  }

  throw new Error('Sharing is not available on this device')
}
