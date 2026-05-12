/**
 * Ambient narrative beats for the Adventure screen.
 *
 * These replace the XP-forward timer copy with emotional, dog-centered
 * milestones that mark moments during the walk. Pure derivation; no state.
 */

export interface AdventureMilestone {
  /** Eyebrow above the moment (e.g. "Out the door"). */
  eyebrow: string
  /** Lowercase emotional line ("the first sniffs hit different"). */
  line: string
}

/** Returns the current milestone for an in-progress adventure. */
export function getAdventureMilestone(
  walkSeconds: number,
  dogName: string,
): AdventureMilestone {
  const safeName = dogName?.trim() || 'Your dog'

  if (walkSeconds < 30) {
    return {
      eyebrow: 'Warming up',
      line: `${safeName}\u2019s ears are already up.`,
    }
  }
  if (walkSeconds < 120) {
    return {
      eyebrow: 'Out the door',
      line: 'First sniffs of the day hit different.',
    }
  }
  if (walkSeconds < 300) {
    return {
      eyebrow: 'Finding the rhythm',
      line: `${safeName} settles in. Tail tells the story.`,
    }
  }
  if (walkSeconds < 600) {
    return {
      eyebrow: 'Hitting their stride',
      line: 'This is the good part of the day.',
    }
  }
  if (walkSeconds < 1200) {
    return {
      eyebrow: 'Locked in',
      line: `${safeName} is in their happy place.`,
    }
  }
  return {
    eyebrow: 'Above and beyond',
    line: `${safeName} won\u2019t forget today.`,
  }
}

/** Short send-off line shown above the timer ring (replaces "story is being written..."). */
export function getSendOffLine(dogName: string): string {
  const safeName = dogName?.trim() || 'Your dog'
  return `Off you go with ${safeName}.`
}
