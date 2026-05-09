/**
 * Listen for PWA install lifecycle events and forward them to analytics.
 * Privacy-safe: no payload data, just the event names.
 *
 * - `beforeinstallprompt`: browser is offering install (Android/Chrome/Edge).
 *   We track that the prompt was made available. We deliberately do NOT
 *   prevent the default browser prompt — there's no in-app install UI yet.
 * - `appinstalled`: confirmed install. iOS Safari does not fire
 *   `beforeinstallprompt`, but it does fire `appinstalled` after Add to
 *   Home Screen, so this gives us a partial signal there too.
 *
 * Returns an unsubscribe function so it can be cleanly torn down.
 */

import { track } from './analytics'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export function registerPwaInstallListeners(): () => void {
  if (typeof window === 'undefined') return () => {}

  let promptSeen = false

  function onBeforeInstallPrompt(event: Event) {
    if (promptSeen) return
    promptSeen = true
    track('pwa_install_prompt_seen', {})

    // We don't intercept the prompt yet — the browser handles it. But we
    // still observe userChoice if the event exposes it, so we can record
    // dismissal.
    const e = event as BeforeInstallPromptEvent
    if (e.userChoice && typeof e.userChoice.then === 'function') {
      void e.userChoice
        .then((choice) => {
          if (choice?.outcome === 'dismissed') {
            track('pwa_install_dismissed', { source: 'beforeinstallprompt' })
          }
        })
        .catch(() => {
          /* swallow */
        })
    }
  }

  function onAppInstalled() {
    track('pwa_install_accepted', {})
  }

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)

  return () => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  }
}
