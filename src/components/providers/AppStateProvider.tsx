import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { AppStateContext } from '../../lib/appStateContext'
import { localStorageStateRepository } from '../../lib/localStorageStateRepository'
import {
  completeAdventure,
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

  const contextValue = useMemo(
    () => ({
      state,
      setDogName: (name: string, zipCode?: string) => {
        setState((currentState) => setDogName(currentState, name, zipCode))
      },
      setZipCode: (zip: string) => {
        setState((currentState) => setZipCode(currentState, zip))
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
