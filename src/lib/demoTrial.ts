import { DEMO_TRIAL_MS } from '../types'
import type { PawstreakState } from '../types'

export interface DemoTrialStatus {
  /** True when the user is using demo mode (no signed-in account). */
  inDemo: boolean
  /** True only if demo started AND less than DEMO_TRIAL_MS has passed. */
  trialActive: boolean
  /** Whole days remaining; 0 once trial is expired or never started. */
  daysRemaining: number
  /** Whole hours remaining (after subtracting full days). */
  hoursRemaining: number
  /** Total ms until expiry; 0 if expired or not started. */
  msRemaining: number
  /** True after trial window has elapsed. Block soft features, escalate signup CTA. */
  expired: boolean
  /** True on day 0/1 — show strongest signup nudge. */
  isDayOneNudge: boolean
}

export function getDemoTrialStatus(state: PawstreakState, now: Date = new Date()): DemoTrialStatus {
  if (state.hasAccount) {
    return {
      inDemo: false,
      trialActive: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      msRemaining: 0,
      expired: false,
      isDayOneNudge: false,
    }
  }

  if (!state.demoStartedAt) {
    return {
      inDemo: true,
      trialActive: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      msRemaining: 0,
      expired: false,
      isDayOneNudge: true,
    }
  }

  const startedAt = new Date(state.demoStartedAt).getTime()
  const elapsed = now.getTime() - startedAt
  const msRemaining = Math.max(0, DEMO_TRIAL_MS - elapsed)
  const expired = msRemaining <= 0

  const daysRemaining = Math.floor(msRemaining / (24 * 60 * 60 * 1000))
  const hoursRemaining = Math.floor((msRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const isDayOneNudge = elapsed < 24 * 60 * 60 * 1000

  return {
    inDemo: true,
    trialActive: !expired,
    daysRemaining,
    hoursRemaining,
    msRemaining,
    expired,
    isDayOneNudge,
  }
}
