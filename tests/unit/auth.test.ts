import { afterEach, describe, expect, it, vi } from 'vitest'

const authApi = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}))

vi.mock('../../src/lib/supabaseClient', () => ({
  getSupabaseClient: () => ({ auth: authApi }),
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('auth helpers', () => {
  it('sends password reset email through Supabase with the app redirect', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://pawstreak.test' } })
    authApi.resetPasswordForEmail.mockResolvedValueOnce({ error: null })
    const { sendPasswordReset } = await import('../../src/lib/auth')

    const result = await sendPasswordReset('owner@example.com')

    expect(result.ok).toBe(true)
    expect(authApi.resetPasswordForEmail).toHaveBeenCalledWith('owner@example.com', {
      redirectTo: 'https://pawstreak.test/app',
    })
  })

  it('surfaces Supabase password reset failures', async () => {
    authApi.resetPasswordForEmail.mockResolvedValueOnce({
      error: { message: 'Email rate limit exceeded' },
    })
    const { sendPasswordReset } = await import('../../src/lib/auth')

    const result = await sendPasswordReset('owner@example.com')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toBe('Email rate limit exceeded')
  })

  it('restores the current Supabase session', async () => {
    const session = { user: { id: 'user-123' } }
    authApi.getSession.mockResolvedValueOnce({ data: { session } })
    const { getCurrentSession } = await import('../../src/lib/auth')

    await expect(getCurrentSession()).resolves.toBe(session)
  })

  it('cleans up Supabase auth state subscriptions', async () => {
    const unsubscribe = vi.fn()
    authApi.onAuthStateChange.mockReturnValueOnce({
      data: { subscription: { unsubscribe } },
    })
    const { onAuthStateChange } = await import('../../src/lib/auth')

    const cleanup = onAuthStateChange(() => {})
    cleanup()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
