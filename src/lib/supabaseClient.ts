import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const FORCE_DEMO = (import.meta.env.VITE_FORCE_DEMO_MODE as string | undefined)?.toLowerCase() === 'true'

let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (FORCE_DEMO) return null
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  if (cachedClient) return cachedClient
  cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'pawstreak-auth',
    },
  })
  return cachedClient
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null
}
