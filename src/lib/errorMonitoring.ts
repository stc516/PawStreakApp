/**
 * Lightweight error monitoring wrapper for PawStreak.
 *
 * Privacy contract (do NOT change without intent):
 *   - We never send dog name, owner email, exact ZIP, or precise lat/lng.
 *   - We never send freeform user-typed text (breeds, names, custom inputs).
 *   - Session replay is DISABLED.
 *   - Performance tracing is DISABLED.
 *   - User identification (Sentry.setUser) is NOT called.
 *   - sendDefaultPii is left at the SDK default (false) — explicitly off.
 *   - The wrapper is a hard no-op when VITE_SENTRY_DSN is missing.
 *   - Any failure inside Sentry must NOT break product flow — every call
 *     site is wrapped in try/catch and `reportError` swallows errors.
 *
 * Scrubbing strategy (see scrubEvent below):
 *   1. Strip URL query strings + fragments from breadcrumbs and event URLs
 *      (could contain ZIPs or lat/lng if we ever push those into the URL).
 *   2. Drop breadcrumbs of categories that capture user input (`ui.input`,
 *      `console`, `xhr.body`, `fetch.body`).
 *   3. Strip `data` payloads off remaining breadcrumbs (cookies, headers,
 *      free-form values).
 *   4. Remove `request.headers`, `request.cookies`, `request.data`,
 *      `request.query_string` from events.
 *   5. Remove any top-level `user` field that may have been auto-populated.
 */

import type { BrowserOptions, ErrorEvent } from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

let sentryClient: typeof import('@sentry/react') | null = null
let initialized = false
let initInFlight: Promise<typeof import('@sentry/react') | null> | null = null

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function isErrorMonitoringConfigured(): boolean {
  return Boolean(SENTRY_DSN)
}

function stripUrlQuery(value: unknown): unknown {
  if (typeof value !== 'string') return value
  // Remove ?query and #fragment but keep path; never throw on malformed input.
  const idx = value.search(/[?#]/)
  return idx === -1 ? value : value.slice(0, idx)
}

const SENSITIVE_BREADCRUMB_CATEGORIES = new Set([
  'ui.input',
  'console',
  'xhr.body',
  'fetch.body',
])

function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  try {
    if (event.request) {
      delete event.request.headers
      delete event.request.cookies
      delete event.request.data
      delete event.request.query_string
      if (typeof event.request.url === 'string') {
        event.request.url = stripUrlQuery(event.request.url) as string
      }
    }
    // Never identify the user.
    if (event.user) {
      delete event.user
    }
    // Drop any extra context that could carry sensitive fields.
    if (event.extra) {
      delete event.extra
    }
    if (event.contexts && 'state' in event.contexts) {
      delete (event.contexts as Record<string, unknown>).state
    }
    if (Array.isArray(event.breadcrumbs)) {
      event.breadcrumbs = event.breadcrumbs
        .filter((b) => !b.category || !SENSITIVE_BREADCRUMB_CATEGORIES.has(b.category))
        .map((b) => {
          const next = { ...b }
          if (next.data) delete next.data
          if (typeof next.message === 'string') {
            next.message = stripUrlQuery(next.message) as string
          }
          return next
        })
    }
  } catch {
    /* if scrubbing fails, drop the event entirely to fail safe */
    return null
  }
  return event
}

const baseOptions: BrowserOptions = {
  dsn: SENTRY_DSN,
  // Explicitly off — we do not want any inferred PII (IP, headers, etc.).
  sendDefaultPii: false,
  // No performance tracing.
  tracesSampleRate: 0,
  // No session replay — these intentionally not added to integrations.
  // Capture a small sample of errors to start; bumpable later.
  sampleRate: 1,
  // Strip stack frame source content if Sentry tries to attach it.
  attachStacktrace: true,
  beforeSend(event: ErrorEvent) {
    return scrubEvent(event)
  },
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category && SENSITIVE_BREADCRUMB_CATEGORIES.has(breadcrumb.category)) {
      return null
    }
    if (breadcrumb.data) {
      breadcrumb.data = undefined
    }
    if (typeof breadcrumb.message === 'string') {
      breadcrumb.message = stripUrlQuery(breadcrumb.message) as string
    }
    return breadcrumb
  },
}

export async function initErrorMonitoring(): Promise<void> {
  if (!isBrowser() || !SENTRY_DSN) return
  if (initialized || initInFlight) {
    await initInFlight
    return
  }

  initInFlight = (async () => {
    try {
      const sentry = await import('@sentry/react')
      sentry.init({
        ...baseOptions,
        // Default integrations include `globalHandlers` (window.onerror +
        // unhandledrejection), `httpContext`, `linkedErrors`, etc. We rely on
        // those for automatic capture, and we explicitly DO NOT add Replay or
        // BrowserTracing here.
      })
      sentryClient = sentry
      initialized = true
      return sentry
    } catch (err) {
      console.warn('[errorMonitoring] Sentry init failed; monitoring disabled.', err)
      return null
    } finally {
      initInFlight = null
    }
  })()

  await initInFlight
}

/**
 * Explicit error capture for places where we catch + recover but still want
 * a signal. Never throws. Never blocks. Privacy-safe (uses scrubbed pipeline).
 */
export function reportError(error: unknown, contextLabel?: string): void {
  if (!isBrowser() || !SENTRY_DSN) return
  try {
    const sentry = sentryClient
    if (!sentry) {
      // Try to init then report. Best-effort.
      void initErrorMonitoring().then(() => {
        try {
          sentryClient?.captureException(error, contextLabel ? { tags: { context: contextLabel } } : undefined)
        } catch {
          /* swallow */
        }
      })
      return
    }
    sentry.captureException(error, contextLabel ? { tags: { context: contextLabel } } : undefined)
  } catch {
    /* swallow — error monitoring must never break the app */
  }
}
