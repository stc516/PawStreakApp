import type { LocalSpotBestTime, LocalSpotSeasonalTag, LocalSpotRecurringTag } from './types'

/** Discovery tags — searchable, filterable, human-readable */
export const LOCAL_VIBE_TAGS = [
  'off-leash',
  'on-leash-only',
  'patio-friendly',
  'water-access',
  'boardwalk',
  'trail-views',
  'flat-easy',
  'steep-climb',
  'craft-beer',
  'third-wave-coffee',
  'harbor-views',
  'dog-beach',
  'family-friendly',
  'date-night',
  'post-work',
  'parking-easy',
  'shade-trees',
  'wide-open',
  'urban-stroll',
  'weekend-crowd',
] as const

export type LocalVibeTag = (typeof LOCAL_VIBE_TAGS)[number]

export const LOCAL_BEST_TIME_LABELS: Record<LocalSpotBestTime, string> = {
  'early-morning': 'Early morning',
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  'golden-hour': 'Golden hour',
  sunset: 'Sunset',
  evening: 'Evening',
  'weekend-morning': 'Weekend morning',
  'weekend-afternoon': 'Weekend afternoon',
  'weekday-evening': 'Weekday evening',
}

export const LOCAL_SEASONAL_LABELS: Record<LocalSpotSeasonalTag, string> = {
  summer: 'Summer',
  'winter-swell': 'Winter swell season',
  'spring-wildflowers': 'Spring wildflowers',
  'holiday-lights': 'Holiday lights',
  'farmers-market-season': 'Farmers market season',
}

export const LOCAL_RECURRING_LABELS: Record<LocalSpotRecurringTag, string> = {
  'saturday-market': 'Saturday market',
  'sunday-beach-crowd': 'Sunday beach crowd',
  'weeknight-patio': 'Weeknight patio',
  'monthly-art-walk': 'Monthly art walk',
  'holiday-weekend': 'Holiday weekend',
}
