import { createContext } from 'react'

import type { Session } from '@supabase/supabase-js'

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

export interface AuthContextSlice {
  /** True when Supabase keys are present and accounts are possible. */
  authEnabled: boolean
  /** Active Supabase session, if any. Null in demo mode. */
  session: Session | null
  /** True while the initial session check is in flight. */
  loadingSession: boolean
  /** True after the remote state has been hydrated for a signed-in user. */
  remoteHydrated: boolean
}

export interface AppStateContextValue extends AuthContextSlice {
  state: PawstreakState
  /** Optional ZIP (5 digits) — drives localized mission pools */
  setDogName: (name: string, zipCode?: string) => void
  setZipCode: (zipCode: string) => void
  completeOnboarding: (payload: CompleteOnboardingPayload) => void
  dismissWelcomeBanner: () => void
  rollPickForMe: () => void
  pickSuggestedAdventure: (index: number) => void
  selectVibe: (vibe: VibeArchetype) => void
  completeAdventure: (walkSeconds: number, options?: { memoryText?: string }) => void
  setReminder: (enabled: boolean) => void
  resetRewardFlow: () => void
  dismissSaveNudge: () => void
  markFirstAdventurePromptSeen: () => void
}

export const AppStateContext = createContext<AppStateContextValue | null>(null)
