/**
 * Lightweight product analytics wrapper for PawStreak.
 *
 * Privacy contract (do NOT change without intent):
 *   - We never send dog name, owner email, exact ZIP, or precise lat/lng.
 *   - We never send freeform user-typed text (breed, custom names, etc.).
 *   - All event payloads are statically typed below — TypeScript is the
 *     enforcement layer; if a property isn't in `AnalyticsEventMap`, it
 *     can't be sent.
 *   - The wrapper is a hard no-op when the env keys are missing, so demo
 *     mode and Playwright e2e never load PostHog.
 *   - Any failure inside PostHog must NOT break product flow — every call
 *     site is wrapped in a try/catch, and `track()` swallows errors.
 */

import type { PostHog } from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

export interface AnalyticsEventMap {
  onboarding_started: { onboarding_step?: number }
  onboarding_completed: {
    reminder_cadence?: 'daily' | 'weekly' | 'apponly'
    zip_supported?: boolean
    environment_primary?: string
  }
  dog_profile_created: { has_breed: boolean; has_age: boolean }
  zip_supported_entered: { environment_primary: string }
  zip_unsupported_entered: Record<string, never>
  adventure_started: {
    adventure_category?: string
    adventure_rarity?: string
    is_away?: boolean
  }
  adventure_completed: {
    adventure_category?: string
    adventure_rarity?: string
    xp_earned: number
    streak_count: number
    is_away?: boolean
  }
  adventure_shared: { adventure_category?: string; adventure_rarity?: string; method: 'native' | 'clipboard' }
  share_fallback_used: { reason: 'no_native_share' }
  pwa_install_prompt_seen: Record<string, never>
  pwa_install_accepted: Record<string, never>
  pwa_install_dismissed: { source: 'beforeinstallprompt' }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

let cachedClient: PostHog | null = null
let initialized = false
let initInFlight: Promise<PostHog | null> | null = null

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(POSTHOG_KEY)
}

/**
 * Initialize PostHog if env keys are present. Safe to call multiple times.
 * Lazy-imports posthog-js so the bundle paid path is gated on real config.
 */
export async function initAnalytics(): Promise<PostHog | null> {
  if (!isBrowser() || !POSTHOG_KEY) return null
  if (initialized && cachedClient) return cachedClient
  if (initInFlight) return initInFlight

  initInFlight = (async () => {
    try {
      const mod = await import('posthog-js')
      const posthog = mod.default
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Privacy-leaning defaults: no autocapture of clicks/text, no session recording.
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        // Respect Do Not Track and Global Privacy Control.
        respect_dnt: true,
        person_profiles: 'identified_only',
        loaded: () => {
          initialized = true
        },
      })
      cachedClient = posthog
      initialized = true
      return posthog
    } catch (err) {
      console.warn('[analytics] PostHog init failed; analytics disabled.', err)
      return null
    } finally {
      initInFlight = null
    }
  })()

  return initInFlight
}

/**
 * Fire-and-forget tracking. Never throws. Never blocks. Never awaits network.
 * If PostHog isn't initialized yet, the event is dropped (we deliberately do
 * not buffer to keep the wrapper simple and predictable in demo mode).
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  properties?: AnalyticsEventMap[E],
): void {
  if (!isBrowser() || !POSTHOG_KEY) return
  try {
    if (cachedClient) {
      cachedClient.capture(event, properties as Record<string, unknown> | undefined)
      return
    }
    // Best-effort: try to init then capture. Errors swallowed.
    void initAnalytics().then((client) => {
      if (!client) return
      try {
        client.capture(event, properties as Record<string, unknown> | undefined)
      } catch {
        /* swallow */
      }
    })
  } catch {
    /* swallow — analytics must never break the app */
  }
}

/**
 * Optional: associate the current session with an opaque, stable id (e.g. a
 * Supabase user id). Never pass an email or name here.
 */
export function identify(distinctId: string): void {
  if (!isBrowser() || !POSTHOG_KEY) return
  try {
    if (cachedClient) {
      cachedClient.identify(distinctId)
    }
  } catch {
    /* swallow */
  }
}

export function resetAnalytics(): void {
  if (!isBrowser() || !POSTHOG_KEY) return
  try {
    cachedClient?.reset()
  } catch {
    /* swallow */
  }
}
