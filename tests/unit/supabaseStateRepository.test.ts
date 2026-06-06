import { afterEach, describe, expect, it, vi } from 'vitest'

import { getInitialPawstreakState, userScopedStorageKey } from '../../src/lib/pawstreakState'
import { createSupabaseStateRepository } from '../../src/lib/supabaseStateRepository'

function installLocalStorage() {
  const store = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
      clear: () => { store.clear() },
    },
  })
  return store
}

function createFakeSupabase(remoteState: Record<string, unknown> | null = null) {
  const upserts: Array<{ table: string; payload: unknown }> = []
  const fake = {
    from(table: string) {
      if (table === 'app_state') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: remoteState ? { state: remoteState } : null,
                error: null,
              }),
            }),
          }),
          upsert: async (payload: unknown) => {
            upserts.push({ table, payload })
            return { error: null }
          },
        }
      }
      return {
        upsert: async (payload: unknown) => {
          upserts.push({ table, payload })
          return { error: null }
        },
      }
    },
  }
  return { fake, upserts }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createSupabaseStateRepository', () => {
  it('migrates meaningful demo progress into the signed-in user cache and remote seed', async () => {
    const store = installLocalStorage()
    const demoState = {
      ...getInitialPawstreakState(),
      onboardingComplete: true,
      dogName: 'MigrationDog',
      zipCode: '92104',
      totalAdventures: 1,
      demoStartedAt: '2026-06-05T12:00:00.000Z',
      hasAccount: false,
    }
    store.set('pawstreak_demo_state_v4', JSON.stringify(demoState))
    const { fake, upserts } = createFakeSupabase()
    const repository = createSupabaseStateRepository({
      supabase: fake as never,
      userId: 'user-123',
      email: 'test@example.com',
    })

    const loaded = repository.load()
    expect(loaded.dogName).toBe('MigrationDog')
    expect(loaded.hasAccount).toBe(true)
    expect(JSON.parse(store.get(userScopedStorageKey('user-123')) ?? '{}').dogName).toBe('MigrationDog')

    const hydrated = await repository.hydrate()
    expect(hydrated?.dogName).toBe('MigrationDog')
    expect(hydrated?.hasAccount).toBe(true)
    expect(upserts.some((entry) => entry.table === 'app_state')).toBe(true)
  })

  it('keeps existing remote state authoritative on returning sessions', async () => {
    installLocalStorage().set(
      'pawstreak_demo_state_v4',
      JSON.stringify({
        ...getInitialPawstreakState(),
        onboardingComplete: true,
        dogName: 'DemoDog',
      }),
    )
    const { fake } = createFakeSupabase({
      ...getInitialPawstreakState(),
      onboardingComplete: true,
      dogName: 'RemoteDog',
      hasAccount: true,
    })
    const repository = createSupabaseStateRepository({
      supabase: fake as never,
      userId: 'user-456',
      email: 'remote@example.com',
    })

    const hydrated = await repository.hydrate()
    expect(hydrated?.dogName).toBe('RemoteDog')
    expect(JSON.parse(window.localStorage.getItem(userScopedStorageKey('user-456')) ?? '{}').dogName).toBe(
      'RemoteDog',
    )
  })
})
