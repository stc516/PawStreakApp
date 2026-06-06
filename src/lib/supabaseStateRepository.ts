import type { SupabaseClient } from '@supabase/supabase-js'

import {
  demoStorageKey,
  hydratePawstreakState,
  loadPawstreakState,
  savePawstreakState,
  userScopedStorageKey,
} from './pawstreakState'
import type { AppStateRepository } from './stateRepository'
import type { PawstreakState } from '../types'

interface CreateOptions {
  supabase: SupabaseClient
  userId: string
  email?: string | null
}

/** Debounce window for remote upserts (ms). Local writes are immediate. */
const SAVE_DEBOUNCE_MS = 800

/** Repository that persists PawstreakState to Supabase, with a local
 *  cache for instant reads/writes. Backed by:
 *    - localStorage  (per-user key)  — synchronous source of truth for UI
 *    - Supabase `app_state` table     — durable backup, syncs across devices.
 */
export function createSupabaseStateRepository({
  supabase,
  userId,
  email,
}: CreateOptions): AppStateRepository {
  const storageKey = userScopedStorageKey(userId)

  let pendingSaveTimer: ReturnType<typeof setTimeout> | null = null
  let pendingState: PawstreakState | null = null

  function progressScore(state: PawstreakState) {
    return [
      state.onboardingComplete ? 100 : 0,
      state.totalAdventures * 10,
      state.recentAdventures.length * 5,
      state.dogName && state.dogName !== 'Your dog' ? 3 : 0,
      state.zipCode ? 2 : 0,
      state.demoStartedAt ? 1 : 0,
    ].reduce((sum, value) => sum + value, 0)
  }

  function loadBestLocalSeed(): PawstreakState {
    const userScoped = loadPawstreakState(storageKey)
    const demo = loadPawstreakState(demoStorageKey())
    return progressScore(demo) > progressScore(userScoped) ? demo : userScoped
  }

  function flushRemoteSave() {
    if (!pendingState) return
    const payload = pendingState
    pendingState = null
    pendingSaveTimer = null
    void supabase
      .from('app_state')
      .upsert(
        {
          user_id: userId,
          state: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .then(({ error }) => {
        if (error) {
          // Soft-fail: local cache still has the latest state.
          console.warn('[supabaseStateRepository] remote save failed', error.message)
        }
      })
  }

  return {
    load(): PawstreakState {
      const local = loadBestLocalSeed()
      savePawstreakState({ ...local, hasAccount: true }, storageKey)
      return { ...local, hasAccount: true }
    },

    save(nextState: PawstreakState) {
      const stateWithAccount: PawstreakState = { ...nextState, hasAccount: true }
      savePawstreakState(stateWithAccount, storageKey)
      pendingState = stateWithAccount
      if (pendingSaveTimer) clearTimeout(pendingSaveTimer)
      pendingSaveTimer = setTimeout(flushRemoteSave, SAVE_DEBOUNCE_MS)
    },

    async hydrate(): Promise<PawstreakState | null> {
      const { data, error } = await supabase
        .from('app_state')
        .select('state')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.warn('[supabaseStateRepository] hydrate failed', error.message)
        return null
      }

      if (!data) {
        // First time signing in — seed remote with the best local progress.
        const seedState = loadBestLocalSeed()
        const seedWithAccount: PawstreakState = { ...seedState, hasAccount: true }
        savePawstreakState(seedWithAccount, storageKey)
        await supabase
          .from('app_state')
          .upsert(
            {
              user_id: userId,
              state: seedWithAccount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          )
        await ensureProfileRow(supabase, userId, email)
        return seedWithAccount
      }

      try {
        const remote = hydratePawstreakState(data.state as Record<string, unknown>)
        const remoteWithAccount: PawstreakState = { ...remote, hasAccount: true }
        savePawstreakState(remoteWithAccount, storageKey)
        await ensureProfileRow(supabase, userId, email)
        return remoteWithAccount
      } catch (e) {
        console.warn('[supabaseStateRepository] could not hydrate remote state', e)
        return null
      }
    },
  }
}

async function ensureProfileRow(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null,
) {
  await supabase.from('profiles').upsert(
    {
      id: userId,
      email: email ?? null,
    },
    { onConflict: 'id' },
  )
}
