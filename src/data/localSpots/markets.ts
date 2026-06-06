import type { LocalMarket, LocalMarketId } from './types'

export const LOCAL_MARKETS: Record<LocalMarketId, LocalMarket> = {
  'san-diego': {
    id: 'san-diego',
    name: 'San Diego',
    zipPrefixes: ['919', '920', '921'],
    tagline: 'Beach mornings, brewery evenings, trails when you mean it.',
  },
  'orange-county': {
    id: 'orange-county',
    name: 'Orange County',
    zipPrefixes: ['926', '927', '928'],
    tagline: 'Dog beaches, harbor walks, and patio weekends.',
  },
}

export const LOCAL_MARKET_LIST = Object.values(LOCAL_MARKETS)

/** True when ZIP falls in a Phase 1 curated market. */
export function isLocalMarketZip(zip: string): boolean {
  return getLocalMarketForZip(zip) !== null
}

export function getLocalMarketForZip(zip: string): LocalMarket | null {
  const normalized = zip.replace(/\D/g, '').slice(0, 5)
  if (normalized.length !== 5) return null
  const prefix = normalized.slice(0, 3)
  for (const market of LOCAL_MARKET_LIST) {
    if (market.zipPrefixes.some((p) => prefix.startsWith(p) || prefix === p)) {
      return market
    }
  }
  return null
}
