import { MONTHLY_PACKS, type MonthlyPack } from '../data/monthlyPacks'
import type { AdventureEntry } from '../types'

export interface PackProgress {
  pack: MonthlyPack
  completed: number
  required: number
  percent: number
  isComplete: boolean
  remaining: number
}

/** Lightweight derivation — no extra persistence, no engine.
 *  Counts how many entries in `history` satisfy the pack's matcher,
 *  capped at the pack's required count for display purposes. */
export function deriveProgress(pack: MonthlyPack, history: AdventureEntry[]): PackProgress {
  const matches = history.reduce((n, entry) => (pack.matches(entry) ? n + 1 : n), 0)
  const completed = Math.min(matches, pack.requiredCount)
  const percent = pack.requiredCount > 0 ? Math.round((completed / pack.requiredCount) * 100) : 0
  return {
    pack,
    completed,
    required: pack.requiredCount,
    percent,
    isComplete: completed >= pack.requiredCount,
    remaining: Math.max(pack.requiredCount - completed, 0),
  }
}

export function deriveAllProgress(history: AdventureEntry[]): PackProgress[] {
  return MONTHLY_PACKS.map((pack) => deriveProgress(pack, history))
}

/** Pick the pack to highlight on the dashboard.
 *  Prefers the one closest to completion that is not yet complete; if
 *  everything is done (or nothing has progress), falls back to a stable
 *  rotation based on day-of-year so it changes with feel, not entropy. */
export function pickFeaturedPack(progress: PackProgress[], today: Date = new Date()): PackProgress {
  if (progress.length === 0) {
    throw new Error('pickFeaturedPack called with empty progress array')
  }

  const inProgress = progress.filter((p) => !p.isComplete && p.completed > 0)
  if (inProgress.length > 0) {
    return [...inProgress].sort((a, b) => b.percent - a.percent || a.remaining - b.remaining)[0]
  }

  const start = new Date(today.getFullYear(), 0, 0)
  const diff = today.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  const index = ((dayOfYear % progress.length) + progress.length) % progress.length
  return progress[index]
}

export interface PackSummary {
  total: number
  completed: number
  inProgress: number
}

export function summarizePacks(progress: PackProgress[]): PackSummary {
  return {
    total: progress.length,
    completed: progress.filter((p) => p.isComplete).length,
    inProgress: progress.filter((p) => !p.isComplete && p.completed > 0).length,
  }
}
