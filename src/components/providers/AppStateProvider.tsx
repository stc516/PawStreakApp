import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

import { AppStateContext } from '../../lib/appStateContext'
import { localStorageStateRepository } from '../../lib/localStorageStateRepository'
import {
  completeAdventure,
  completeOnboarding,
  dismissWelcomeBanner,
  evaluateAwayFromCoords,
  resetRewardFlow,
  rollPickForMe,
  selectVibe,
  setDogName,
  setReminder,
  setZipCode,
} from '../../lib/pawstreakState'
import { createSupabaseStateRepository } from '../../lib/supabaseStateRepository'
import { getSupabaseClient } from '../../lib/supabaseClient'
import type { AppStateRepository } from '../../lib/stateRepository'
import type { PawstreakState } from '../../types'
import { useSession } from '../../hooks/useSession'

interface AppStateProviderProps {
  children: ReactNode
  repository?: AppStateRepository
}

interface AppStateSyncedProps {
  children: ReactNode
  repository: AppStateRepository
  authEnabled: boolean
  session: Session | null
  loadingSession: boolean
}

/** Holds PawStreak app state. Remount when `key` changes so `repository.load()`
 *  runs without a sync setState effect (React Compiler / eslint friendly). */
function AppStateSynced({
  children,
  repository,
  authEnabled,
  session,
  loadingSession,
}: AppStateSyncedProps) {
  const [state, setState] = useState<PawstreakState>(() => repository.load())

  const needsHydrate = typeof repository.hydrate === 'function'
  const [hydrateComplete, setHydrateComplete] = useState(() => !needsHydrate)

  useEffect(() => {
    if (!repository.hydrate) return
    let cancelled = false
    void repository.hydrate().then((remote) => {
      if (cancelled) return
      if (remote) setState(remote)
      setHydrateComplete(true)
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  const remoteHydrated = !needsHydrate || hydrateComplete

  useEffect(() => {
    repository.save(state)
  }, [repository, state])

  useEffect(() => {
    if (!state.onboardingComplete) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setState((s) =>
          evaluateAwayFromCoords(s, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
        )
      },
      () => {
        if (cancelled) return
        setState((s) => evaluateAwayFromCoords(s, null))
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 12_000 },
    )
    return () => {
      cancelled = true
    }
  }, [state.onboardingComplete])

  const contextValue = useMemo(
    () => ({
      authEnabled,
      session,
      loadingSession,
      remoteHydrated,
      state,
      setDogName: (name: string, zipCode?: string) => {
        setState((currentState) => setDogName(currentState, name, zipCode))
      },
      setZipCode: (zip: string) => {
        setState((currentState) => setZipCode(currentState, zip))
      },
      completeOnboarding: (payload: Parameters<typeof completeOnboarding>[1]) => {
        setState((currentState) => completeOnboarding(currentState, payload))
      },
      dismissWelcomeBanner: () => {
        setState((currentState) => dismissWelcomeBanner(currentState))
      },
      rollPickForMe: () => {
        setState((currentState) => rollPickForMe(currentState))
      },
      selectVibe: (vibe: Parameters<typeof selectVibe>[1]) => {
        setState((currentState) => selectVibe(currentState, vibe))
      },
      completeAdventure: (walkSeconds: number) => {
        setState((currentState) => completeAdventure(currentState, walkSeconds))
      },
      setReminder: (enabled: boolean) => {
        setState((currentState) => setReminder(currentState, enabled))
      },
      resetRewardFlow: () => {
        setState((currentState) => resetRewardFlow(currentState))
      },
    }),
    [authEnabled, loadingSession, remoteHydrated, session, state],
  )

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>
}

export function AppStateProvider({
  children,
  repository: repositoryOverride,
}: AppStateProviderProps) {
  const { session, loading: loadingSession, authEnabled } = useSession()
  const supabase = getSupabaseClient()

  const repository = useMemo(() => {
    if (repositoryOverride) return repositoryOverride
    const uid = session?.user?.id
    if (uid && supabase) {
      return createSupabaseStateRepository({
        supabase,
        userId: uid,
        email: session?.user?.email ?? null,
      })
    }
    return localStorageStateRepository
  }, [repositoryOverride, session, supabase])

  const storageKey = repositoryOverride ? 'repo-override' : (session?.user?.id ?? 'local-demo')

  return (
    <AppStateSynced
      key={storageKey}
      repository={repository}
      authEnabled={authEnabled}
      session={session}
      loadingSession={loadingSession}
    >
      {children}
    </AppStateSynced>
  )
}
