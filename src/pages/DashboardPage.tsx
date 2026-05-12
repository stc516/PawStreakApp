import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { LevelProgressCard } from '../components/LevelProgressCard'
import { MascotBadge } from '../components/mascot/MascotBadge'
import { PackCard } from '../components/PackCard'
import { useAppState } from '../hooks/useAppState'
import { personalityExtrasLabel, primaryPersonalityLabel } from '../lib/dogIdentity'
import { achievementSummary, buildLocalLeaderboard, leaderboardRank } from '../lib/gamification'
import { deriveAllProgress, pickFeaturedPack, summarizePacks } from '../lib/monthlyPacks'

const CATEGORY_FROM_VIBE = {
  pulse: 'social',
  wander: 'exploration',
  salt: 'chill',
  wild: 'chaos',
} as const

function relativeDayLabel(iso: string): string {
  const then = new Date(iso)
  if (!Number.isFinite(then.getTime())) return 'Recently'
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { state, dismissWelcomeBanner } = useAppState()
  const [awayDismissed, setAwayDismissed] = useState(false)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  useEffect(() => {
    if (!state.isAway) {
      queueMicrotask(() => setAwayDismissed(false))
    }
  }, [state.isAway])

  const latest = useMemo(() => state.latestCompletedAdventure ?? state.recentAdventures[0] ?? null, [state])
  const primaryPersonality = useMemo(
    () => primaryPersonalityLabel(state.dogProfile.personality),
    [state.dogProfile.personality],
  )
  const personalityExtra = useMemo(
    () => personalityExtrasLabel(state.dogProfile.personality),
    [state.dogProfile.personality],
  )
  const recap = useMemo(() => {
    const anchorTime = state.recentAdventures.reduce((maxTime, entry) => {
      const entryTime = new Date(entry.completedAt).getTime()
      return Number.isFinite(entryTime) ? Math.max(maxTime, entryTime) : maxTime
    }, 0)
    const weekEntries = state.recentAdventures.filter((entry) => {
      const t = new Date(entry.completedAt).getTime()
      return Number.isFinite(t) && anchorTime - t <= 7 * 24 * 60 * 60 * 1000
    })
    const totalWeek = weekEntries.length
    const categoryCounts = new Map<string, number>()
    const placeSet = new Set<string>()

    for (const entry of weekEntries) {
      const category = CATEGORY_FROM_VIBE[entry.vibe] ?? 'routine'
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
      if (entry.locationHint) placeSet.add(entry.locationHint.trim().toLowerCase())
    }

    const topCategory =
      [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? (totalWeek > 0 ? 'routine' : 'exploration')
    const topCategoryLabel = `${topCategory[0].toUpperCase()}${topCategory.slice(1)}`
    const newPlaces = placeSet.size

    let summary = `${state.dogName} had a ${topCategory} week.`
    if (totalWeek === 0) summary = `${state.dogName} is ready to kick off this week.`
    else if (totalWeek === 1) summary = `${state.dogName} made a strong first move this week.`

    return { totalWeek, topCategoryLabel, newPlaces, summary }
  }, [state.dogName, state.recentAdventures])
  const milestones = useMemo(() => {
    const socialCount = state.recentAdventures.filter((entry) => CATEGORY_FROM_VIBE[entry.vibe] === 'social').length
    const uniqueAreas = new Set(
      state.recentAdventures.map((entry) => entry.locationHint?.trim().toLowerCase()).filter(Boolean),
    ).size

    return [
      {
        id: 'first',
        label: 'First Adventure',
        done: state.totalAdventures >= 1,
        hint: state.totalAdventures >= 1 ? 'Unlocked' : 'Start your first story beat',
      },
      {
        id: 'streak',
        label: '7 Day Streak',
        done: state.currentStreak >= 7,
        hint:
          state.currentStreak >= 7
            ? 'Streak milestone hit'
            : `${Math.max(0, 7 - state.currentStreak)} more day${7 - state.currentStreak === 1 ? '' : 's'}`,
      },
      {
        id: 'social',
        label: '5 Social Adventures',
        done: socialCount >= 5,
        hint: socialCount >= 5 ? 'XP rank bump unlocked' : `${Math.max(0, 5 - socialCount)} more social adventures`,
      },
      {
        id: 'areas',
        label: 'New Area Explored',
        done: uniqueAreas >= 2,
        hint: uniqueAreas >= 2 ? `${uniqueAreas} places discovered` : 'Try a new neighborhood route',
      },
    ]
  }, [state.currentStreak, state.recentAdventures, state.totalAdventures])
  const leaderboard = useMemo(
    () => buildLocalLeaderboard(state.dogName, state.totalAdventureEnergy, state.currentStreak),
    [state.currentStreak, state.dogName, state.totalAdventureEnergy],
  )
  const yourRank = useMemo(() => leaderboardRank(leaderboard), [leaderboard])
  const achievements = useMemo(() => achievementSummary(state.badges), [state.badges])
  const packProgress = useMemo(() => deriveAllProgress(state.recentAdventures), [state.recentAdventures])
  const featuredPack = useMemo(() => pickFeaturedPack(packProgress), [packProgress])
  const packSummary = useMemo(() => summarizePacks(packProgress), [packProgress])

  return (
    <section
      id='s-home'
      className='screen active'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px))' }}
    >
      <header className='topbar'>
        <div className='wm'>
          Paw<span>Streak</span>
        </div>
        <div className='flex items-center gap-2'>
          <AccountStatusChip />
          <div className='streak-badge'>
            <span className='sb-flame'>🔥</span>
            <span className='sb-num'>{state.currentStreak}</span>
          </div>
          <span className='text-[19px] text-[var(--text-2)]'>🔔</span>
        </div>
      </header>

      <div className='scroll'>
        <PostAdventureSavePrompt />
        <SaveProgressNudge />
        {!state.welcomeBannerDismissed ? (
          <div className='mx-4 mb-3 mt-3 rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] px-4 py-3'>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-sm leading-snug text-[var(--text)]'>
                <strong>{state.dogName}</strong> is ready. Your first adventure is waiting.
              </p>
              <button
                type='button'
                className='shrink-0 text-lg leading-none text-[var(--text-3)]'
                aria-label='Dismiss'
                onClick={() => dismissWelcomeBanner()}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        {state.isAway && !awayDismissed ? (
          <div className='mx-4 mb-3 mt-1 rounded-xl border border-[color:rgba(79,195,247,0.35)] bg-[var(--bg-elevated)] px-4 py-3'>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-sm leading-snug text-[var(--text)]'>
                Looks like <strong>{state.dogName}</strong> is outside their usual territory. New ground. New adventures.
              </p>
              <button
                type='button'
                className='shrink-0 text-lg leading-none text-[var(--text-3)]'
                aria-label='Dismiss'
                onClick={() => setAwayDismissed(true)}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        <div className='dog-row'>
          <div className='dog-chip on'>
            <div className='dog-av on'>🐕</div>
            <span className='dog-nm'>{state.dogName}</span>
            <span className='rounded-full border border-[color:var(--border-md)] bg-[var(--bg-card)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--purple)]'>
              {primaryPersonality}
            </span>
          </div>
          <button className='dog-add' type='button'>
            +
          </button>
        </div>

        <div className='hero-row'>
          <div className='hero-mascot mascot'>
            <div className='m-ears'>
              <div className='m-ear l' />
              <div className='m-ear r' />
            </div>
            <div className='m-face'>🐕</div>
            <div className='m-tail'>🐾</div>
          </div>
          <div>
            <div className='hero-name'>{state.dogName}</div>
            <div
              data-testid='dashboard-hero-status'
              className={`hero-status ${state.todayAdventureDone ? 'won' : ''}`}
            >
              {state.todayAdventureDone
                ? 'had a great day. ✓'
                : 'is ready for a great day.'}
            </div>
            <div className='mt-1 text-[12px] text-[var(--text-2)]'>
              {primaryPersonality}
              {personalityExtra ? <span className='ml-1 text-[var(--text-3)]'>{personalityExtra}</span> : null}
            </div>
            <div className='mt-1.5'>
              <span className={`pill ${state.todayAdventureDone ? 'p-won' : 'p-risk'}`}>
                {state.todayAdventureDone ? '✓ A good day' : '🐾 Day waiting'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── PRIMARY: today's adventure CTA — emotional center ─── */}
        <div className='today-card mt-3' data-testid='dashboard-today-card'>
          <div className='tc-glow' />
          <div className='tc-eye'>Today&apos;s adventure</div>
          <div className='tc-head'>
            {state.todayAdventureDone
              ? `${state.dogName} already had a great day.`
              : `Give ${state.dogName} a great day.`}
          </div>
          <div className='tc-ctx'>
            {latest ? (
              <>
                Last time, <strong>{latest.missionTitle.toLowerCase()}</strong>
                {latest.locationHint ? (
                  <>
                    {' '}
                    around <strong>{latest.locationHint}</strong>
                  </>
                ) : null}
                . What does {state.dogName} get to do today?
              </>
            ) : (
              <>
                Every dog deserves a great day.{' '}
                <strong>{state.dogName}&apos;s first story</strong> starts with one walk out the door.
              </>
            )}
          </div>
          <button
            className='btn-primary'
            type='button'
            data-testid='dashboard-start-adventure-cta'
            onClick={() => navigate('/adventure')}
          >
            {state.todayAdventureDone ? 'Add another adventure →' : `Start ${state.dogName}\u2019s day →`}
          </button>
        </div>

        {/* ─── MEMORY: last adventure recap (emotional anchor) ─── */}
        <div className='recap mt-3'>
          <div className='eye mb-2 pl-0.5'>Last adventure</div>
          {latest ? (
            <div className='recap-item'>
              <div className='ri-icon'>{latest.emoji}</div>
              <div className='ri-info'>
                <div className='ri-title'>
                  {latest.missionTitle} · {latest.durationMinutes} min · {latest.groundCovered.toFixed(1)} mi
                </div>
                <div className='ri-meta'>{relativeDayLabel(latest.completedAt)}</div>
                {latest.memoryText ? (
                  <div className='ri-find'>&ldquo;{latest.memoryText}&rdquo;</div>
                ) : latest.missionDescription ? (
                  <div className='ri-find'>&ldquo;{latest.missionDescription}&rdquo;</div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className='recap-item flex items-center gap-3'>
              <MascotBadge mascot='bailey' size='sm' />
              <div className='ri-info'>
                <div className='ri-title'>{state.dogName}&apos;s story starts today.</div>
                <div className='ri-meta'>Every dog deserves a great day — let&apos;s make today the first.</div>
              </div>
              <button
                type='button'
                onClick={() => navigate('/adventure')}
                className='shrink-0 rounded-full border border-[color:rgba(255,107,53,0.4)] bg-[var(--orange-dim)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--orange)]'
              >
                Begin
              </button>
            </div>
          )}
        </div>

        {/* ─── EMOTIONAL: weekly recap (story summary) ─── */}
        <div className='mx-4 mt-3 rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(155deg,rgba(22,27,34,0.98),rgba(12,18,28,0.97))] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.28)]'>
          <div className='text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]'>This week with {state.dogName}</div>
          <div className='mt-1 font-[var(--fd)] text-[20px] text-[var(--text)]'>{recap.summary}</div>
          <div className='mt-3 grid grid-cols-2 gap-2'>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--text)]'>{recap.totalWeek}</div>
              <div className='text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]'>Adventures together</div>
            </div>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--blue)]'>{recap.topCategoryLabel}</div>
              <div className='text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]'>Favorite vibe</div>
            </div>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--gold)]'>{recap.newPlaces}</div>
              <div className='text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]'>New places</div>
            </div>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--green)]'>{state.currentStreak}</div>
              <div className='text-[10px] uppercase tracking-[0.08em] text-[var(--text-3)]'>Good days in a row</div>
            </div>
          </div>
          <div className='mt-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--border-md)] bg-[var(--bg-pill)] px-3 py-1 text-[11px] text-[var(--text-2)]'>
            <span className='text-[var(--purple)]'>{state.dogName} is:</span> {primaryPersonality}
            {personalityExtra ? <span className='text-[var(--text-3)]'>{personalityExtra}</span> : null}
          </div>
        </div>

        {/* ─── COLLECTION: featured pack ─── */}
        <div className='mx-4 mt-3' data-testid='dashboard-featured-pack'>
          <div className='mb-2 flex items-end justify-between pl-0.5'>
            <div className='eye'>This month&apos;s pack</div>
            <button
              type='button'
              onClick={() => navigate('/packs')}
              className='text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)] transition-colors hover:text-[var(--text-2)]'
              data-testid='dashboard-featured-pack-cta'
            >
              See all · {packSummary.completed}/{packSummary.total}
            </button>
          </div>
          <PackCard progress={featuredPack} variant='featured' />
        </div>

        {/* ─── MILESTONES + FINDS (small) ─── */}
        <div className='mx-4 mt-3'>
          <div className='mb-2 flex items-end justify-between pl-0.5'>
            <div className='text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]'>Milestones</div>
            <button
              type='button'
              data-testid='dashboard-finds-cta'
              onClick={() => navigate('/badges')}
              className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)] transition-colors hover:text-[var(--text-2)]'
            >
              See finds · {achievements.earned}/{achievements.total}
            </button>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`rounded-xl border p-2.5 transition-transform duration-150 active:scale-[0.98] ${
                  milestone.done
                    ? 'border-[color:rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.08)]'
                    : 'border-[color:var(--border)] bg-[var(--bg-card)]'
                }`}
              >
                <div className='text-[12px] font-semibold text-[var(--text)]'>{milestone.label}</div>
                <div className={`mt-1 text-[11px] ${milestone.done ? 'text-[var(--green)]' : 'text-[var(--text-2)]'}`}>
                  {milestone.hint}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SUPPORTING: progress / XP / level / numbers (de-emphasized) ─── */}
        <section
          data-testid='dashboard-supporting-band'
          className='mx-4 mt-5 rounded-2xl border border-dashed border-[color:var(--border)] bg-[var(--bg-card)] p-3'
          aria-label='Supporting progress'
        >
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]'>
              Progress (supporting)
            </div>
            <button
              type='button'
              data-testid='dashboard-the-wild-cta'
              onClick={() => navigate('/wild')}
              className='text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-2)] transition-colors hover:text-[var(--text)]'
            >
              The Wild · rank #{yourRank} →
            </button>
          </div>
          <button
            type='button'
            data-testid='dashboard-level-card'
            onClick={() => navigate('/wild')}
            className='block w-full text-left'
            aria-label='Open The Wild'
          >
            <LevelProgressCard xp={state.totalAdventureEnergy} variant='compact' />
          </button>
          <div className='mt-3 grid grid-cols-4 gap-1.5 text-center'>
            <div className='rounded-lg border border-[color:var(--border)] bg-[var(--bg-elevated)] p-1.5'>
              <div className='text-[14px] font-semibold text-[var(--text)]'>{state.currentStreak}</div>
              <div className='text-[9px] uppercase tracking-[0.1em] text-[var(--text-3)]'>Streak</div>
            </div>
            <div className='rounded-lg border border-[color:var(--border)] bg-[var(--bg-elevated)] p-1.5'>
              <div className='text-[14px] font-semibold text-[var(--text)]'>{state.totalAdventures}</div>
              <div className='text-[9px] uppercase tracking-[0.1em] text-[var(--text-3)]'>Adventures</div>
            </div>
            <div className='rounded-lg border border-[color:var(--border)] bg-[var(--bg-elevated)] p-1.5'>
              <div className='text-[14px] font-semibold text-[var(--text)]'>
                {state.totalGroundCovered.toFixed(1)}
              </div>
              <div className='text-[9px] uppercase tracking-[0.1em] text-[var(--text-3)]'>Miles</div>
            </div>
            <div className='rounded-lg border border-[color:var(--border)] bg-[var(--bg-elevated)] p-1.5'>
              <div className='text-[14px] font-semibold text-[var(--text-2)]'>
                {state.totalAdventureEnergy.toLocaleString()}
              </div>
              <div className='text-[9px] uppercase tracking-[0.1em] text-[var(--text-3)]'>XP</div>
            </div>
          </div>
        </section>

        <div className='h-5' />

        <LegalFooter />
      </div>
      <BottomNav />
    </section>
  )
}
