import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

import { getSupabaseClient } from './supabaseClient'

export type { Session, User }

export interface AuthError {
  message: string
}

export interface AuthResult {
  ok: boolean
  error?: AuthError
}

function notConfigured(): AuthResult {
  return {
    ok: false,
    error: { message: 'Sign-in is not configured yet (no Supabase keys present).' },
  }
}

function siteRedirectUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return `${window.location.origin}/app`
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient()
  if (!supabase) return notConfigured()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: siteRedirectUrl() },
  })
  return error ? { ok: false, error: { message: error.message } } : { ok: true }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient()
  if (!supabase) return notConfigured()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? { ok: false, error: { message: error.message } } : { ok: true }
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const supabase = getSupabaseClient()
  if (!supabase) return notConfigured()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: siteRedirectUrl() },
  })
  return error ? { ok: false, error: { message: error.message } } : { ok: true }
}

export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseClient()
  if (!supabase) return notConfigured()
  const { error } = await supabase.auth.signOut()
  return error ? { ok: false, error: { message: error.message } } : { ok: true }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const supabase = getSupabaseClient()
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}
