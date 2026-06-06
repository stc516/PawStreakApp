import { getSupabaseClient } from './supabaseClient'
import type { GeocodedLocation } from './mapboxGeocoding'

type ExpansionRequestInput = {
  rawLocationInput: string
  geocodedLocation?: GeocodedLocation | null
  source: 'onboarding_location'
  dogId?: string | null
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

  try {
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id ?? null
    const location = input.geocodedLocation
    const { error } = await supabase.from('location_expansion_requests').insert({
      user_id: userId,
      dog_id: input.dogId ?? null,
      raw_location_input: input.rawLocationInput,
      resolved_city: location?.city ?? null,
      resolved_state: location?.region ?? null,
      resolved_country: location?.country ?? null,
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      source: input.source,
      status: 'new',
      notes: 'User outside developed region',
    })

    if (!error) return
    console.warn('[locationExpansionRequests] insert failed', error.message)
    saveLocalExpansionRequest(input)
  } catch (error) {
    console.warn('[locationExpansionRequests] insert failed', error)
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
    rawLocationInput: input.rawLocationInput,
    locationQuery: input.rawLocationInput,
    geocodedLocation: input.geocodedLocation ?? null,
    source: input.source,
    status: 'new',
    notes: 'User outside developed region',
    createdAt: new Date().toISOString(),
  })
  window.localStorage.setItem(key, JSON.stringify(parsed.slice(-25)))
}
