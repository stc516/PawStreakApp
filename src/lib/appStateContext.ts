import { createContext } from 'react'

import type { PawstreakState, VibeArchetype } from '../types'

export interface AppStateContextValue {
  state: PawstreakState
  /** Optional ZIP (5 digits) — drives localized mission pools */
  setDogName: (name: string, zipCode?: string) => void
  setZipCode: (zipCode: string) => void
  rollPickForMe: () => void
  selectVibe: (vibe: VibeArchetype) => void
  completeAdventure: (walkSeconds: number) => void
  setReminder: (enabled: boolean) => void
  resetRewardFlow: () => void
}

export const AppStateContext = createContext<AppStateContextValue | null>(null)
