import type { AdventureEntry, PawstreakState } from '../types'

import { bondArcProgress } from './missions'

export type QuestKind = 'weekly' | 'monthly' | 'rare' | 'streak'

export interface QuestVM {
  id: string
  kind: QuestKind
  label: string
  progress: number
  target: number
  icon: string
  /** Short reward-feel subtitle */
  rewardHint: string
}

function countRareMissions(recent: AdventureEntry[]): number {
  return recent.filter((a) => a.rarity === 'rare').length
}

function missionsThisCalendarMonth(recent: AdventureEntry[], weekAdventures: number): number {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const fromRecent = recent.filter((a) => {
    const d = new Date(a.completedAt)
    return d.getFullYear() === y && d.getMonth() === m
  }).length
  if (fromRecent > 0) return fromRecent
  /** Demo fallback: blend weekly rhythm when month history is empty */
  return Math.min(weekAdventures * 2, 12)
}

/**
 * Medium-term quests derived from existing state — no new persistence.
 */
export function buildQuestList(state: PawstreakState): QuestVM[] {
  const bond = bondArcProgress(state.currentStreak)
  const weeklyTarget = 5
  const monthlyTarget = 12
  const rareTarget = 3

  const streakQuest: QuestVM = {
    id: 'streak-arc',
    kind: 'streak',
    label: 'Streak ritual',
    progress: bond.progress,
    target: bond.target,
    icon: '🔥',
    rewardHint: bond.remaining === 0 ? 'Arc sealed' : `${bond.remaining} to seal`,
  }

  const weekly: QuestVM = {
    id: 'weekly-circuit',
    kind: 'weekly',
    label: 'Weekly circuit',
    progress: Math.min(state.weekAdventures, weeklyTarget),
    target: weeklyTarget,
    icon: '🗓️',
    rewardHint:
      state.weekAdventures >= weeklyTarget
        ? 'Weekly cleared'
        : `${Math.max(0, weeklyTarget - state.weekAdventures)} left`,
  }

  const monthCount = missionsThisCalendarMonth(state.recentAdventures, state.weekAdventures)
  const monthly: QuestVM = {
    id: 'monthly-trail',
    kind: 'monthly',
    label: 'Month trail',
    progress: Math.min(monthCount, monthlyTarget),
    target: monthlyTarget,
    icon: '🌙',
    rewardHint: monthCount >= monthlyTarget ? 'Trail badge vibe' : `${Math.max(0, monthlyTarget - monthCount)} this month`,
  }

  const rareCount = countRareMissions(state.recentAdventures)
  const rareQuest: QuestVM = {
    id: 'rare-hunter',
    kind: 'rare',
    label: 'Rare finds',
    progress: Math.min(rareCount, rareTarget),
    target: rareTarget,
    icon: '✨',
    rewardHint: rareCount >= rareTarget ? 'Rare streak on lock' : `${Math.max(0, rareTarget - rareCount)} rare pulls`,
  }

  return [weekly, monthly, rareQuest, streakQuest]
}
