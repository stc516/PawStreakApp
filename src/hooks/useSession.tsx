import { useEffect, useState } from 'react'

import { getCurrentSession, onAuthStateChange, type Session } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export interface SessionState {
  session: Session | null
  loading: boolean
  /** True when Supabase keys are configured (auth is possible). */
  authEnabled: boolean
}

export function useSession(): SessionState {
  const authEnabled = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(authEnabled)

  useEffect(() => {
    if (!authEnabled) return
    let cancelled = false
    getCurrentSession().then((s) => {
      if (cancelled) return
      setSession(s)
      setLoading(false)
    })
    const unsubscribe = onAuthStateChange((_event, nextSession) => {
      if (cancelled) return
      setSession(nextSession)
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [authEnabled])

  return { session, loading, authEnabled }
}
