import { getDemoTrialStatus, type DemoTrialStatus } from './demoTrial'
import type { PawstreakState } from '../types'

function lastMeaningfulEvent(state: PawstreakState): string | null {
  const candidates: string[] = []
  if (state.latestCompletedAdventure?.completedAt) {
    candidates.push(state.latestCompletedAdventure.completedAt)
  }
  for (const entry of state.recentAdventures) {
    if (entry.completedAt) candidates.push(entry.completedAt)
  }
  if (candidates.length === 0) return null
  return candidates
    .map((iso) => ({ iso, t: new Date(iso).getTime() }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => b.t - a.t)[0]?.iso ?? null
}

export interface DashboardNudgeDecision {
  show: boolean
  reason: 'never-dismissed' | 'new-event' | 'expired-trial' | null
  trial: DemoTrialStatus
  lastEventAt: string | null
}

/** Should the dashboard "Save progress" nudge be visible right now?
 *
 * Rules (in order):
 *   1. Never show for users who already have an account.
 *   2. Always show if the demo trial has expired.
 *   3. Show if never dismissed.
 *   4. Re-surface if a meaningful event has happened since the last dismissal. */
export function evaluateDashboardNudge(
  state: PawstreakState,
  now: Date = new Date(),
): DashboardNudgeDecision {
  const trial = getDemoTrialStatus(state, now)
  const lastEventAt = lastMeaningfulEvent(state)

  if (!trial.inDemo) {
    return { show: false, reason: null, trial, lastEventAt }
  }

  if (trial.expired) {
    return { show: true, reason: 'expired-trial', trial, lastEventAt }
  }

  if (!state.nudgeDismissedAt) {
    return { show: true, reason: 'never-dismissed', trial, lastEventAt }
  }

  if (lastEventAt) {
    const dismissedAt = new Date(state.nudgeDismissedAt).getTime()
    const eventAt = new Date(lastEventAt).getTime()
    if (Number.isFinite(dismissedAt) && Number.isFinite(eventAt) && eventAt > dismissedAt) {
      return { show: true, reason: 'new-event', trial, lastEventAt }
    }
  }

  return { show: false, reason: null, trial, lastEventAt }
}

export interface FirstAdventurePromptDecision {
  show: boolean
}

/** One-shot prompt: shown the first time a user has at least one completed
 *  adventure logged AND they're still in demo mode AND we haven't shown it
 *  before. Tracked separately from the dashboard nudge so we never show both
 *  at the same instant. */
export function evaluateFirstAdventurePrompt(
  state: PawstreakState,
): FirstAdventurePromptDecision {
  if (state.hasAccount) return { show: false }
  if (state.firstAdventurePromptSeenAt) return { show: false }
  if (state.totalAdventures < 1 && state.recentAdventures.length === 0) {
    return { show: false }
  }
  // Demo users only — once they save progress (hasAccount=true) we never nudge.
  return { show: true }
}

/** Short human-readable status line used inside the nudge banner. */
export function formatTrialStatusLine(state: PawstreakState, trial: DemoTrialStatus): string {
  if (!trial.inDemo) return 'Saved across devices.'
  if (!state.demoStartedAt) {
    return 'Stories stay on this phone until you save.'
  }
  if (trial.expired) return 'Save to keep your walks and streak.'
  return 'Save anytime — takes a minute.'
}
