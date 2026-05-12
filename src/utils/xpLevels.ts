/**
 * Duolingo-style XP progression.
 *
 * Source XP = `state.totalAdventureEnergy` (Adventure XP). We do NOT change
 * how XP is earned; this layer only buckets the existing total into named
 * levels so the UI can show "where the XP goes."
 */

export interface XpLevel {
  level: number
  name: string
  min: number
  max: number
  icon: string
}

export const XP_LEVELS: readonly XpLevel[] = [
  { level: 1, name: 'Pup', min: 0, max: 299, icon: '\u{1F43E}' },
  { level: 2, name: 'Scout', min: 300, max: 799, icon: '\u{1F33F}' },
  { level: 3, name: 'Trailblazer', min: 800, max: 1799, icon: '\u{1F5FA}\uFE0F' },
  { level: 4, name: 'Expedition', min: 1800, max: 3499, icon: '\u26F0\uFE0F' },
  { level: 5, name: 'Legend', min: 3500, max: 99_999, icon: '\u{1F3C6}' },
] as const

export interface CurrentLevel {
  /** Current level bucket. Always returns a value — clamps to first/last bucket. */
  current: XpLevel
  /** Next level bucket. Null when at max level. */
  next: XpLevel | null
  /** 0–100 percent toward the next level. 100 when at max. */
  progressToNext: number
  /** XP still required to reach `next`. 0 when at max. */
  xpToNext: number
  isMaxLevel: boolean
}

/** Returns the bucket info for an XP total. Safe for negative / NaN inputs. */
export function getCurrentLevel(xp: number): CurrentLevel {
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0
  const current =
    XP_LEVELS.find((tier) => safeXp >= tier.min && safeXp <= tier.max) ??
    XP_LEVELS[XP_LEVELS.length - 1]
  const next = XP_LEVELS.find((tier) => tier.level === current.level + 1) ?? null
  const isMaxLevel = next === null

  if (isMaxLevel) {
    return { current, next: null, progressToNext: 100, xpToNext: 0, isMaxLevel: true }
  }

  const span = Math.max(1, next.min - current.min)
  const progress = ((safeXp - current.min) / span) * 100
  const xpToNext = Math.max(0, next.min - safeXp)
  return {
    current,
    next,
    progressToNext: Math.min(100, Math.max(0, Math.round(progress))),
    xpToNext,
    isMaxLevel: false,
  }
}

/** Did `nextXp` cross a level boundary compared with `previousXp`? */
export function didLevelUp(previousXp: number, nextXp: number): boolean {
  return getCurrentLevel(previousXp).current.level < getCurrentLevel(nextXp).current.level
}
