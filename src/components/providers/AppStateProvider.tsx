import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

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
import type { AppStateRepository } from '../../lib/stateRepository'
import type { PawstreakState } from '../../types'

interface AppStateProviderProps {
  children: ReactNode
  repository?: AppStateRepository
}

export function AppStateProvider({
  children,
  repository = localStorageStateRepository,
}: AppStateProviderProps) {
  const [state, setState] = useState<PawstreakState>(() => repository.load())

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
    [state],
  )

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>
}
