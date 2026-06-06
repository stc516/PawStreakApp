import type { LocalSpotCategory } from './types'

export interface LocalSpotCategoryMeta {
  id: LocalSpotCategory
  label: string
  emoji: string
  /** Short line for UI chips — energetic, not poetic */
  hook: string
}

export const LOCAL_SPOT_CATEGORIES: Record<LocalSpotCategory, LocalSpotCategoryMeta> = {
  beach: {
    id: 'beach',
    label: 'Beach',
    emoji: '🏖️',
    hook: 'Sand, salt, and off-leash energy',
  },
  trail: {
    id: 'trail',
    label: 'Trail',
    emoji: '🥾',
    hook: 'Views, dirt, and a real workout',
  },
  coffee: {
    id: 'coffee',
    label: 'Coffee',
    emoji: '☕',
    hook: 'Grab a cup, hit the sidewalk',
  },
  brewery: {
    id: 'brewery',
    label: 'Brewery',
    emoji: '🍺',
    hook: 'Patio hangs dog people actually do',
  },
  park: {
    id: 'park',
    label: 'Park',
    emoji: '🌳',
    hook: 'Grass, loops, and room to roam',
  },
  patio: {
    id: 'patio',
    label: 'Patio',
    emoji: '🪑',
    hook: 'Sit outside, people-watch together',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    hook: 'Golden hour worth leaving the house',
  },
  weekend: {
    id: 'weekend',
    label: 'Weekend',
    emoji: '📅',
    hook: 'Where the crowd goes Saturday',
  },
  social: {
    id: 'social',
    label: 'Social',
    emoji: '🐕',
    hook: 'Other dogs, other owners, good vibes',
  },
}

export const LOCAL_SPOT_CATEGORY_LIST = Object.values(LOCAL_SPOT_CATEGORIES)
