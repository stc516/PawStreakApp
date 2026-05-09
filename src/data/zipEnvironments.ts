export type EnvironmentPrimary =
  | 'coastal'
  | 'trail'
  | 'urban'
  | 'social'
  | 'park'
  | 'residential'

export type ZipEnvironment = {
  zip: string
  neighborhood: string
  environmentPrimary: EnvironmentPrimary
  environmentTags: string[]
  isActive: boolean
  latCenter: number
  lngCenter: number
}

/** Haversine distance in kilometers (Earth mean radius). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const ZIP_ENVIRONMENTS: ZipEnvironment[] = [
  {
    zip: '92107',
    neighborhood: 'Point Loma / Ocean Beach',
    environmentPrimary: 'coastal',
    environmentTags: ['surf', 'bluffs', 'open sky'],
    isActive: true,
    latCenter: 32.7451,
    lngCenter: -117.2547,
  },
  {
    zip: '92109',
    neighborhood: 'Pacific Beach',
    environmentPrimary: 'social',
    environmentTags: ['boardwalk', 'beach', 'coastal', 'sunset'],
    isActive: true,
    latCenter: 32.7978,
    lngCenter: -117.2573,
  },
  {
    zip: '92037',
    neighborhood: 'La Jolla',
    environmentPrimary: 'coastal',
    environmentTags: ['coves', 'trails', 'upscale stroll'],
    isActive: true,
    latCenter: 32.8328,
    lngCenter: -117.2713,
  },
  {
    zip: '92103',
    neighborhood: 'Hillcrest / Mission Hills',
    environmentPrimary: 'urban',
    environmentTags: ['cafés', 'sidewalks', 'pocket parks'],
    isActive: true,
    latCenter: 32.7475,
    lngCenter: -117.16,
  },
  {
    zip: '92104',
    neighborhood: 'North Park / South Park',
    environmentPrimary: 'urban',
    environmentTags: ['neighborhood arts', 'walkable', 'dog-friendly patios'],
    isActive: true,
    latCenter: 32.7492,
    lngCenter: -117.1304,
  },
  {
    zip: '92116',
    neighborhood: 'Normal Heights / Kensington',
    environmentPrimary: 'residential',
    environmentTags: ['quiet blocks', 'shade trees', 'front-yard sniffing'],
    isActive: true,
    latCenter: 32.7631,
    lngCenter: -117.1165,
  },
  {
    zip: '92106',
    neighborhood: 'Harbor Island / Shelter Island',
    environmentPrimary: 'coastal',
    environmentTags: ['marina', 'breezes', 'wide paths'],
    isActive: true,
    latCenter: 32.7238,
    lngCenter: -117.1695,
  },
  {
    zip: '92101',
    neighborhood: 'Downtown San Diego',
    environmentPrimary: 'urban',
    environmentTags: ['city rhythm', 'explore', 'new smells'],
    isActive: true,
    latCenter: 32.7157,
    lngCenter: -117.1611,
  },
  {
    zip: '92102',
    neighborhood: 'Logan Heights / Sherman Heights',
    environmentPrimary: 'residential',
    environmentTags: ['neighborhood loops', 'urban grit'],
    isActive: true,
    latCenter: 32.7174,
    lngCenter: -117.1045,
  },
  {
    zip: '92108',
    neighborhood: 'Mission Valley',
    environmentPrimary: 'park',
    environmentTags: ['river path', 'greenbelt', 'mixed trail'],
    isActive: true,
    latCenter: 32.7738,
    lngCenter: -117.1478,
  },
  {
    zip: '92123',
    neighborhood: 'Scripps Ranch / Kearny Mesa',
    environmentPrimary: 'trail',
    environmentTags: ['canyon edges', 'residential hills', 'longer loops'],
    isActive: true,
    latCenter: 32.9047,
    lngCenter: -117.0987,
  },
  {
    zip: '92014',
    neighborhood: 'Del Mar',
    environmentPrimary: 'coastal',
    environmentTags: ['bluffs', 'fairgrounds edge', 'ocean air'],
    isActive: true,
    latCenter: 32.9595,
    lngCenter: -117.2653,
  },
]

const byZip = new Map(ZIP_ENVIRONMENTS.map((z) => [z.zip, z]))

export function getEnvironmentForZip(zip: string): ZipEnvironment | null {
  const normalized = zip.replace(/\D/g, '').slice(0, 5)
  return byZip.get(normalized) ?? null
}

/** Nearest known ZIP environment by distance to its center (active entries only). */
export function getEnvironmentForCoords(lat: number, lng: number): ZipEnvironment | null {
  let best: ZipEnvironment | null = null
  let bestKm = Infinity
  for (const z of ZIP_ENVIRONMENTS) {
    if (!z.isActive) continue
    const km = haversineKm(lat, lng, z.latCenter, z.lngCenter)
    if (km < bestKm) {
      bestKm = km
      best = z
    }
  }
  return best
}
