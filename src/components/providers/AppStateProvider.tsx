import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

import { AppStateContext } from '../../lib/appStateContext'
import { localStorageStateRepository } from '../../lib/localStorageStateRepository'
import {
  attachAdventureReflection,
  abandonAdventureSession,
  clearMemoryReturnHighlight,
  completeAdventure,
  completeOnboarding,
  dismissSaveNudge,
  dismissWelcomeBanner,
  evaluateAwayFromCoords,
  markFirstAdventurePromptSeen,
  pauseAdventureSession,
  pickSuggestedAdventure,
  resetRewardFlow,
  rollPickForMe,
  selectVibe,
  setDogName,
  setReminder,
  setZipCode,
  startAdventureSession,
  updateAdventureMemoryDraft,
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
      pickSuggestedAdventure: (index: number) => {
        setState((currentState) => pickSuggestedAdventure(currentState, index))
      },
      selectVibe: (vibe: Parameters<typeof selectVibe>[1]) => {
        setState((currentState) => selectVibe(currentState, vibe))
      },
      startAdventureSession: (
        source: Parameters<typeof startAdventureSession>[1],
        challengeId: string | null = null,
        missionOverride?: Parameters<typeof startAdventureSession>[4],
      ) => {
        setState((currentState) => startAdventureSession(currentState, source, challengeId, undefined, missionOverride))
      },
      pauseAdventureSession: (paused: boolean) => {
        setState((currentState) => pauseAdventureSession(currentState, paused))
      },
      updateAdventureMemoryDraft: (memoryText: string) => {
        setState((currentState) => updateAdventureMemoryDraft(currentState, memoryText))
      },
      abandonAdventureSession: () => {
        setState((currentState) => abandonAdventureSession(currentState))
      },
      completeAdventure: (walkSeconds: number, options?: { memoryText?: string }) => {
        setState((currentState) => completeAdventure(currentState, walkSeconds, options))
      },
      saveAdventureReflection: (adventureId: string, reflection: Parameters<typeof attachAdventureReflection>[2]) => {
        setState((currentState) => attachAdventureReflection(currentState, adventureId, reflection))
      },
      setReminder: (enabled: boolean) => {
        setState((currentState) => setReminder(currentState, enabled))
      },
      resetRewardFlow: () => {
        setState((currentState) => resetRewardFlow(currentState))
      },
      dismissSaveNudge: () => {
        setState((currentState) => dismissSaveNudge(currentState))
      },
      markFirstAdventurePromptSeen: () => {
        setState((currentState) => markFirstAdventurePromptSeen(currentState))
      },
      clearMemoryReturnHighlight: () => {
        setState((currentState) => clearMemoryReturnHighlight(currentState))
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
