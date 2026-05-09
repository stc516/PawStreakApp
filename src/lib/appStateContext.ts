import { createContext } from 'react'

import type {
  DogProfile,
  NotificationPrefs,
  OwnerProfile,
  PawstreakState,
  UserProfile,
  VibeArchetype,
} from '../types'

export interface CompleteOnboardingPayload {
  dogProfile: DogProfile
  ownerProfile: OwnerProfile
  userProfile: UserProfile
  notificationPrefs: NotificationPrefs
}

export interface AppStateContextValue {
  state: PawstreakState
  /** Optional ZIP (5 digits) — drives localized mission pools */
  setDogName: (name: string, zipCode?: string) => void
  setZipCode: (zipCode: string) => void
  completeOnboarding: (payload: CompleteOnboardingPayload) => void
  dismissWelcomeBanner: () => void
  rollPickForMe: () => void
  selectVibe: (vibe: VibeArchetype) => void
  completeAdventure: (walkSeconds: number) => void
  setReminder: (enabled: boolean) => void
  resetRewardFlow: () => void
}

export const AppStateContext = createContext<AppStateContextValue | null>(null)
