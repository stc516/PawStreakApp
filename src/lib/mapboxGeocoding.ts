import type { LocalMarketId } from '../data/localSpots/types'

const MAPBOX_GEOCODE_ENDPOINT = 'https://api.mapbox.com/search/geocode/v6'

type MapboxContextItem = {
  name?: string
  text?: string
}

type MapboxFeature = {
  id?: string
  relevance?: number
  score?: number
  properties?: {
    name?: string
    full_address?: string
    mapbox_id?: string
    relevance?: number
    score?: number
    match_code?: {
      confidence?: string
    }
    coordinates?: {
      latitude?: number
      longitude?: number
    }
    context?: {
      postcode?: MapboxContextItem
      place?: MapboxContextItem
      locality?: MapboxContextItem
      district?: MapboxContextItem
      region?: MapboxContextItem
      country?: MapboxContextItem
    }
  }
}

export type GeocodedLocation = {
  label: string
  lat: number | null
  lng: number | null
  zip: string
  city: string
  region: string
  district: string
  country: string
  mapboxId: string
  relevance: number | null
  confidence: string
  supportedMarket: LocalMarketId | null
  source: 'mapbox'
}

export type MapboxGeocodeResult =
  | { ok: true; location: GeocodedLocation }
  | { ok: false; reason: 'missing_token' | 'not_found' | 'network_error' }

function accessToken(): string {
  const envToken = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined)?.trim()
  if (envToken) return envToken
  if (typeof window !== 'undefined') {
    const testToken = (window as typeof window & { __PAWSTREAK_MAPBOX_ACCESS_TOKEN?: string })
      .__PAWSTREAK_MAPBOX_ACCESS_TOKEN
    if (testToken?.trim()) return testToken.trim()
    return window.localStorage.getItem('pawstreak-mapbox-test-token')?.trim() ?? ''
  }
  return ''
}

function contextName(item?: MapboxContextItem): string {
  return item?.name ?? item?.text ?? ''
}

function normalizeZip(input: string): string {
  const match = input.match(/\b\d{5}(?:-\d{4})?\b/)
  return match?.[0]?.slice(0, 5) ?? ''
}

function inBounds(
  lat: number | null,
  lng: number | null,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): boolean {
  return lat != null && lng != null && lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng
}

export function developedRegionForCoordinates(
  input: Pick<GeocodedLocation, 'lat' | 'lng'>,
): LocalMarketId | null {
  if (
    inBounds(input.lat, input.lng, {
      minLat: 32.5,
      maxLat: 33.55,
      minLng: -117.65,
      maxLng: -116.05,
    })
  ) {
    return 'san-diego'
  }

  if (
    inBounds(input.lat, input.lng, {
      minLat: 33.35,
      maxLat: 33.98,
      minLng: -118.2,
      maxLng: -117.35,
    })
  ) {
    return 'orange-county'
  }

  return null
}

export function supportedMarketForGeocodedLocation(
  input: Pick<GeocodedLocation, 'lat' | 'lng'> & Partial<Pick<GeocodedLocation, 'district' | 'region' | 'city'>>,
): LocalMarketId | null {
  return developedRegionForCoordinates(input)
}

function parseFeature(feature: MapboxFeature): GeocodedLocation | null {
  const props = feature.properties
  const lat = props?.coordinates?.latitude
  const lng = props?.coordinates?.longitude
  const label = props?.full_address ?? props?.name ?? ''
  const context = props?.context
  const city = contextName(context?.place) || contextName(context?.locality)
  const region = contextName(context?.region)
  const district = contextName(context?.district)
  const country = contextName(context?.country)
  const zip = normalizeZip(contextName(context?.postcode) || label)
  const relevance = props?.relevance ?? props?.score ?? feature.relevance ?? feature.score ?? null

  if (!label && !zip && lat == null && lng == null) return null

  const location: GeocodedLocation = {
    label,
    lat: typeof lat === 'number' ? lat : null,
    lng: typeof lng === 'number' ? lng : null,
    zip,
    city,
    region,
    district,
    country,
    mapboxId: props?.mapbox_id ?? feature.id ?? '',
    relevance,
    confidence: props?.match_code?.confidence ?? '',
    supportedMarket: null,
    source: 'mapbox',
  }

  return {
    ...location,
    supportedMarket: developedRegionForCoordinates(location),
  }
}

async function fetchMapbox(path: 'forward' | 'reverse', params: URLSearchParams): Promise<MapboxGeocodeResult> {
  const token = accessToken()
  if (!token) return { ok: false, reason: 'missing_token' }

  params.set('access_token', token)
  params.set('country', 'us')

  try {
    const response = await fetch(`${MAPBOX_GEOCODE_ENDPOINT}/${path}?${params.toString()}`)
    if (!response.ok) return { ok: false, reason: 'network_error' }
    const json = (await response.json()) as { features?: MapboxFeature[] }
    const feature = json.features?.[0]
    const location = feature ? parseFeature(feature) : null
    return location ? { ok: true, location } : { ok: false, reason: 'not_found' }
  } catch {
    return { ok: false, reason: 'network_error' }
  }
}

export function geocodeLocationQuery(query: string): Promise<MapboxGeocodeResult> {
  const params = new URLSearchParams({
    q: query.trim(),
    autocomplete: 'false',
    limit: '1',
    types: 'address,place,locality,neighborhood,postcode',
  })
  return fetchMapbox('forward', params)
}

export function reverseGeocodeCoords(lat: number, lng: number): Promise<MapboxGeocodeResult> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    limit: '1',
    types: 'address,place,locality,neighborhood,postcode',
  })
  return fetchMapbox('reverse', params)
}
