import type { BadgeDefinition } from '../types'

export interface LeaderboardEntry {
  id: string
  label: string
  xp: number
  isCurrent: boolean
}

export function buildLocalLeaderboard(dogName: string, totalXp: number, currentStreak: number): LeaderboardEntry[] {
  const baseline = Math.max(250, totalXp)
  const entries: LeaderboardEntry[] = [
    { id: 'p1', label: 'Luna', xp: baseline + 420, isCurrent: false },
    { id: 'p2', label: 'Mochi', xp: baseline + 210, isCurrent: false },
    { id: 'p3', label: 'Scout', xp: baseline + 110, isCurrent: false },
    { id: 'me', label: dogName, xp: totalXp, isCurrent: true },
    { id: 'p4', label: 'Juniper', xp: Math.max(120, baseline - 180 - currentStreak * 4), isCurrent: false },
  ]

  return entries.sort((a, b) => b.xp - a.xp)
}

export function leaderboardRank(entries: LeaderboardEntry[]): number {
  return entries.findIndex((entry) => entry.isCurrent) + 1
}

export function achievementSummary(badges: BadgeDefinition[]): {
  earned: number
  total: number
  nextAchievementName: string
} {
  const earned = badges.filter((badge) => badge.unlocked).length
  const total = badges.length
  const nextAchievementName = badges.find((badge) => !badge.unlocked)?.name ?? 'All achievements unlocked'
  return { earned, total, nextAchievementName }
}
