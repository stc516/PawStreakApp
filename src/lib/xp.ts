import type { AdventureRarity } from '../types'

interface CalculateAdventureXpArgs {
  walkSeconds: number
  rarity: AdventureRarity
}

interface AdventureXpBreakdown {
  minutes: number
  ground: number
  base: number
  multiplier: number
  xp: number
}

export function calculateAdventureXp(args: CalculateAdventureXpArgs): AdventureXpBreakdown {
  const minutes = Math.max(1, Math.floor(args.walkSeconds / 60))
  const ground = Number((args.walkSeconds * 0.00042).toFixed(1))
  const base = Math.max(Math.floor(minutes * 5 + ground * 10), 12)
  const multiplier = args.rarity === 'rare' ? 1.25 : args.rarity === 'uncommon' ? 1.12 : 1
  const xp = Math.floor(base * multiplier)
  return { minutes, ground, base, multiplier, xp }
}
