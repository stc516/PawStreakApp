const AWAY_SUFFIX = ' — Away Adventure'

/** Visible adventure title; appends away suffix when user is outside home territory. */
export function visibleAdventureTitle(baseTitle: string, isAway: boolean): string {
  if (!isAway) return baseTitle
  if (baseTitle.includes(AWAY_SUFFIX)) return baseTitle
  return `${baseTitle}${AWAY_SUFFIX}`
}
