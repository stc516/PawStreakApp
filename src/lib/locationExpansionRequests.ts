import { getSupabaseClient } from './supabaseClient'
import type { GeocodedLocation } from './mapboxGeocoding'

type ExpansionRequestInput = {
  locationQuery: string
  geocodedLocation?: GeocodedLocation | null
  source: 'onboarding'
}

export async function createLocationExpansionRequest(input: ExpansionRequestInput): Promise<void> {
  if (shouldForceLocalExpansionRequests()) {
    saveLocalExpansionRequest(input)
    return
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    saveLocalExpansionRequest(input)
    return
  }

  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id ?? null
  const location = input.geocodedLocation
  const { error } = await supabase.from('location_expansion_requests').insert({
    user_id: userId,
    location_query: input.locationQuery,
    resolved_label: location?.label ?? null,
    city: location?.city ?? null,
    region: location?.region ?? null,
    postal_code: location?.zip ?? null,
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    source: input.source,
  })

  if (error) {
    console.warn('[locationExpansionRequests] insert failed', error.message)
    saveLocalExpansionRequest(input)
  }
}

function shouldForceLocalExpansionRequests(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('pawstreak-force-local-expansion-requests') === 'true'
}

function saveLocalExpansionRequest(input: ExpansionRequestInput) {
  if (typeof window === 'undefined') return
  const key = 'pawstreak-location-expansion-requests'
  const existing = window.localStorage.getItem(key)
  const parsed = existing ? (JSON.parse(existing) as unknown[]) : []
  parsed.push({
    locationQuery: input.locationQuery,
    geocodedLocation: input.geocodedLocation ?? null,
    source: input.source,
    createdAt: new Date().toISOString(),
  })
  window.localStorage.setItem(key, JSON.stringify(parsed.slice(-25)))
}
