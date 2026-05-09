import type { AdventureRarity, DogMood, VibeArchetype } from '../types'

export const DOG_MOODS: { id: DogMood; label: string; emoji: string; tease: string }[] = [
  { id: 'restless', label: 'Restless', emoji: '⚡', tease: 'wants an adventure with teeth' },
  { id: 'curious', label: 'Curious', emoji: '👀', tease: 'is following every lead' },
  { id: 'explorer', label: 'Explorer Mode', emoji: '🧭', tease: 'is ready to get a little lost' },
  { id: 'social', label: 'Social Pup', emoji: '🫶', tease: 'wants to be seen and sniffed' },
  { id: 'zoomie', label: 'Zoomie Energy', emoji: '💨', tease: 'has main-character momentum' },
  { id: 'chill', label: 'Chill Day', emoji: '☁️', tease: 'wants soft light and easy wins' },
]

export const VIBE_CHIPS: {
  vibe: VibeArchetype
  icon: string
  name: string
  blurb: string
}[] = [
  { vibe: 'pulse', icon: '⚡', name: 'Pulse & Treats', blurb: 'fast, snacky, close to home' },
  { vibe: 'wander', icon: '🌿', name: 'Wander & Wonder', blurb: 'longer legs, new corners' },
  { vibe: 'salt', icon: '🌅', name: 'Salt & Sky', blurb: 'air, distance, big feels' },
  { vibe: 'wild', icon: '✨', name: 'Chaos / Wildcard', blurb: 'surprise rules, no script' },
]

const PULSE: { title: string; emoji: string }[] = [
  { title: 'Treat Run', emoji: '🍖' },
  { title: 'Coffee Walk', emoji: '☕' },
  { title: 'Golden Hour Walk', emoji: '🌇' },
  { title: 'The Long Way Home', emoji: '🏡' },
  { title: 'Chaos Goblin Energy Burn', emoji: '🌀' },
  { title: 'Neighborhood Patrol', emoji: '🚶' },
  { title: 'Sniff & Sprint', emoji: '💨' },
]

const WANDER: { title: string; emoji: string }[] = [
  { title: 'Sniffari', emoji: '👃' },
  { title: 'Green Loop', emoji: '🌳' },
  { title: 'The Scenic Detour', emoji: '🛤' },
  { title: 'New Mail, New Smells', emoji: '📬' },
  { title: 'Side Street Safari', emoji: '🦒' },
  { title: 'Puddle Physics Lab', emoji: '💧' },
]

const SALT: { title: string; emoji: string }[] = [
  { title: 'Ocean Air Adventure', emoji: '🌊' },
  { title: 'Sunset Sniff Adventure', emoji: '🌅' },
  { title: 'Coronado Loop', emoji: '🏝' },
  { title: 'Boardwalk Spotlight', emoji: '🎬' },
  { title: 'Breeze & Belly Rubs', emoji: '🫧' },
]

const WILD: { title: string; emoji: string }[] = [
  { title: 'Mystery Route', emoji: '🎲' },
  { title: 'Plot Twist Path', emoji: '📖' },
  { title: '“We’re Not Coming Home Yet”', emoji: '🧨' },
  { title: 'Chaos Field Trip', emoji: '🎪' },
  { title: 'Adventure Roulette', emoji: '🎯' },
]

const CROSS_RARE: { title: string; emoji: string }[] = [
  { title: 'Sunset Sniff Adventure', emoji: '🌅' },
  { title: 'The Long Way Home', emoji: '🏡' },
  { title: 'Coronado Loop', emoji: '🏝' },
  { title: 'Sniffari', emoji: '👃' },
  { title: 'Chaos Goblin Energy Burn', emoji: '🌀' },
]

const poolByVibe: Record<VibeArchetype, { title: string; emoji: string }[]> = {
  pulse: PULSE,
  wander: WANDER,
  salt: SALT,
  wild: WILD,
}

export function hashString(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function moodForDay(dogName: string, dayKey: string): DogMood {
  const idx = hashString(`${dogName}|${dayKey}`) % DOG_MOODS.length
  return DOG_MOODS[idx].id
}

function pickFrom<T>(list: T[], seed: string) {
  return list[hashString(seed) % list.length]
}

function rollRarity(seed: string, streak: number, forceSpicy: boolean): AdventureRarity {
  const roll = (hashString(`${seed}|rarity`) % 100) + (streak >= 5 ? 3 : 0) + (forceSpicy ? 6 : 0)
  if (roll >= 92) return 'rare'
  if (roll >= 72) return 'uncommon'
  return 'common'
}

export function flavorForMission(params: { mood: DogMood; title: string; dogName: string; rarity: AdventureRarity }) {
  const { mood, title, dogName, rarity } = params
  const hooks: Record<DogMood, string[]> = {
    restless: [
      `${dogName} doesn’t want “fine.” ${dogName} wants GO.`,
      'Tiny chaos is medicine.',
      'Translation: run it out before dinner judges us.',
    ],
    curious: [
      'Follow curiosity like it pays rent.',
      'Sniff first. Narrative later.',
      `${dogName} has questions only pavement can answer.`,
    ],
    explorer: [
      'New corners > old routines.',
      `${dogName} is auditioning for National Geographic (household division).`,
      'Discovery mode: polite mayhem.',
    ],
    social: [
      `${dogName} wants witnesses.`,
      'Community vibes. Tail diplomacy.',
      'Say hi like it’s a skill tree.',
    ],
    zoomie: [
      'Physics optional.',
      `${dogName} has velocity opinions.`,
      'If nothing breaks, did we even adventure?',
    ],
    chill: [
      'Soft goals. Big feelings.',
      `${dogName} rewards patience with pure loyalty.`,
      'Low stakes. High heart.',
    ],
  }

  const rarityNotes: Record<AdventureRarity, string> = {
    common: 'Solid pick — warmth beats perfection.',
    uncommon: 'Spicy enough to remember.',
    rare: 'Rare pull — this one glows.',
  }

  const picked = pickFrom(hooks[mood], `${title}|${dogName}|${mood}`)
  return `${picked} ${rarityNotes[rarity]}`
}

export function rollMission(params: {
  vibe: VibeArchetype
  mood: DogMood
  dogName: string
  streak: number
  nonce: string
}): { title: string; emoji: string; rarity: AdventureRarity; flavor: string } {
  const { vibe, mood, dogName, streak, nonce } = params
  const rarity = rollRarity(`${nonce}|${vibe}`, streak, vibe === 'wild')
  const pool = rarity === 'rare' ? [...poolByVibe[vibe], ...CROSS_RARE] : poolByVibe[vibe]
  const pick = pickFrom(pool, `${nonce}|${vibe}|${rarity}|${mood}`)
  const flavor = flavorForMission({ mood, title: pick.title, dogName, rarity })
  return { title: pick.title, emoji: pick.emoji, rarity, flavor }
}

export function rollVibe(nonce: string): VibeArchetype {
  const vibes: VibeArchetype[] = ['pulse', 'wander', 'salt', 'wild']
  return vibes[hashString(`${nonce}|vibe`) % vibes.length]
}

export function tomorrowRarePossible(dogName: string, today = new Date()) {
  const t = new Date(today)
  t.setDate(t.getDate() + 1)
  const key = `${dogName}|next-${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`
  return hashString(key) % 6 === 0
}

export function identityArc(totalEnergy: number, streak: number) {
  if (streak >= 14 && totalEnergy >= 800)
    return { title: 'Neighborhood Legend', tagline: 'your bond shows up in strangers’ smiles' }
  if (streak >= 7 || totalEnergy >= 400)
    return { title: 'Trailblazer Duo', tagline: `${streak}-day streak — the ritual is real` }
  if (totalEnergy >= 120)
    return { title: 'Adventure Partner', tagline: 'consistent mischief, dependable heart' }
  return { title: 'Story Starter', tagline: 'early chapters hit different' }
}

export function bondArcProgress(streak: number) {
  const target = 7
  const progress = Math.min(streak, target)
  const remaining = Math.max(target - streak, 0)
  return { target, progress, remaining }
}
