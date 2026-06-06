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
})
