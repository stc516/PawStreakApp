import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import { quickAdventurePicksForZip } from '../data/localAdventureEngine'

function relativeDayLabel(iso: string): string {
  const then = new Date(iso)
  if (!Number.isFinite(then.getTime())) return ''
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000)
  if (diffDays <= 0) return ''
  if (diffDays === 1) return '1d'
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function walkLabel(missionTitle: string, locationHint?: string | null): string {
  const place = locationHint?.trim()
  if (place && !missionTitle.includes(place)) return `${missionTitle} — ${place}`
  return missionTitle
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { state, dismissWelcomeBanner, pickSuggestedAdventure } = useAppState()
  const [awayDismissed, setAwayDismissed] = useState(false)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  useEffect(() => {
    if (!state.isAway) {
      queueMicrotask(() => setAwayDismissed(false))
    }
  }, [state.isAway])

  const zip = state.zipCode ?? ''
  const picks = useMemo(() => quickAdventurePicksForZip(zip), [zip])

  const recent = state.recentAdventures.slice(0, 10)
  const placeHints = useMemo(
    () => new Set(state.recentAdventures.map((a) => a.locationHint?.trim()).filter(Boolean)).size,
    [state.recentAdventures],
  )

  const heroStatus = state.todayAdventureDone
    ? `${state.dogName}'s walk is in for today.`
    : `Where should we take ${state.dogName} today?`

  return (
    <section
      id='s-home'
      className='screen active'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px))' }}
    >
      <header className='flex items-center justify-between border-b border-[color:var(--border)] bg-[var(--bg)] px-4 py-2.5'>
        <div className='text-[14px] font-semibold tracking-tight text-[var(--text)]'>
          Paw<span className='text-[color:var(--orange)]'>Streak</span>
        </div>
        <AccountStatusChip />
      </header>

      <div className='scroll'>
        <PostAdventureSavePrompt />
        <SaveProgressNudge />

        {!state.welcomeBannerDismissed ? (
          <div className='mx-4 mb-2 mt-3 rounded-lg border border-[color:var(--border)] bg-[var(--bg-card)] px-3 py-2'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-[12px] leading-snug text-[var(--text)]'>{state.dogName}</p>
              <button
                type='button'
                className='shrink-0 text-base leading-none text-[var(--text-3)]'
                aria-label='Dismiss'
                onClick={() => dismissWelcomeBanner()}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        {state.isAway && !awayDismissed ? (
          <div className='mx-4 mb-2 mt-2 rounded-lg border border-[color:rgba(79,195,247,0.3)] bg-[var(--bg-elevated)] px-3 py-2'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-[12px] text-[var(--text-2)]'>Away from usual area</p>
              <button
                type='button'
                className='shrink-0 text-base leading-none text-[var(--text-3)]'
                aria-label='Dismiss'
                onClick={() => setAwayDismissed(true)}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        <div className='mx-4 mt-3 rounded-2xl border border-[color:var(--border)] bg-[var(--bg-elevated)] p-3.5'>
          <div className='flex items-center gap-3'>
            <div className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--bg-card)] text-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'>
              🐕
            </div>
            <div className='min-w-0'>
              <h1 className='text-[20px] font-semibold leading-tight tracking-tight text-[var(--text)]' data-testid='dashboard-dog-name'>
                {state.dogName}
              </h1>
              <p className='mt-0.5 text-[12px] font-medium text-[var(--text-2)]' data-testid='dashboard-streak-summary'>
                {state.currentStreak}d streak <span aria-hidden>🔥</span>
              </p>
            </div>
          </div>

          <p
            data-testid='dashboard-hero-status'
            className={`mt-2.5 text-[13px] font-medium leading-snug ${state.todayAdventureDone ? 'text-[var(--green)]' : 'text-[var(--text)]'}`}
          >
            {heroStatus}
          </p>

          <div className='mt-3 border-t border-[color:var(--border)] pt-3'>
            <h2 className='mb-2 text-[13px] font-semibold tracking-tight text-[var(--text)]'>Pick a spot</h2>
            <div className='-mx-1 flex gap-1.5 overflow-x-auto pb-0.5 pt-0.5' data-testid='dashboard-adventure-chips'>
              {picks.map((pick, index) => (
                <button
                  key={pick.id}
                  type='button'
                  onClick={() => {
                    pickSuggestedAdventure(index)
                    navigate('/adventure')
                  }}
                  className='flex w-[96px] shrink-0 flex-col rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] px-2 py-2 text-left transition-colors active:scale-[0.98] hover:border-[color:rgba(255,107,53,0.45)]'
                >
                  <span className='text-[18px] leading-none' aria-hidden>
                    {pick.emoji}
                  </span>
                  <span className='mt-1 text-[11px] font-semibold leading-tight text-[var(--text)]'>{pick.title}</span>
                  <span className='mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--text-2)]'>{pick.place}</span>
                </button>
              ))}
            </div>
            <button
              type='button'
              data-testid='dashboard-start-adventure-cta'
              className='mt-2.5 inline-flex h-9 items-center justify-center rounded-full bg-[color:rgba(255,107,53,0.14)] px-4 text-[13px] font-semibold text-[color:var(--orange)] ring-1 ring-[color:rgba(255,107,53,0.35)] transition-colors active:scale-[0.98]'
              onClick={() => navigate('/adventure')}
            >
              Start walk →
            </button>
          </div>
        </div>

        <div className='mx-4 mt-5' data-testid='dashboard-recent-memories'>
          <h2 className='text-[12px] font-semibold text-[var(--text-2)]'>Recent</h2>
          {recent.length > 0 ? (
            <div className='-mx-1 mt-2 flex gap-1.5 overflow-x-auto pb-0.5'>
              {recent.map((a) => (
                <button
                  key={a.id}
                  type='button'
                  onClick={() => navigate('/story')}
                  className='flex w-[84px] shrink-0 flex-col rounded-lg border border-[color:var(--border)] bg-[var(--bg-card)] px-1.5 py-1.5 text-left'
                >
                  <span className='text-[20px] leading-none' aria-hidden>
                    {a.emoji}
                  </span>
                  <span className='mt-1 line-clamp-2 text-[10px] font-medium leading-snug text-[var(--text)]'>
                    {walkLabel(a.missionTitle, a.locationHint)}
                  </span>
                  {relativeDayLabel(a.completedAt) ? (
                    <span className='mt-0.5 text-[9px] text-[var(--text-3)]'>{relativeDayLabel(a.completedAt)}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div
          className='mx-4 mt-5 flex justify-between border-t border-[color:var(--border)] pt-3'
          data-testid='dashboard-stats-row'
        >
          <div>
            <div className='text-[15px] font-semibold tabular-nums text-[var(--text)]'>{state.totalAdventures}</div>
            <div className='text-[11px] text-[var(--text-2)]'>Walks</div>
          </div>
          <div className='text-center'>
            <div className='text-[15px] font-semibold tabular-nums text-[var(--text)]'>{state.currentStreak}</div>
            <div className='text-[11px] text-[var(--text-2)]'>Streak</div>
          </div>
          <div className='text-right'>
            <div className='text-[15px] font-semibold tabular-nums text-[var(--text)]'>{placeHints}</div>
            <div className='text-[11px] text-[var(--text-2)]'>Places</div>
          </div>
        </div>

        <div className='mx-4 mt-4 flex flex-wrap gap-1.5'>
          <button
            type='button'
            data-testid='dashboard-the-wild-cta'
            onClick={() => navigate('/wild')}
            className='rounded-full border border-[color:var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-2)]'
          >
            Progress
          </button>
          <button
            type='button'
            data-testid='dashboard-finds-cta'
            onClick={() => navigate('/badges')}
            className='rounded-full border border-[color:var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-2)]'
          >
            Finds
          </button>
          <button
            type='button'
            onClick={() => navigate('/packs')}
            className='rounded-full border border-[color:var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-2)]'
            data-testid='dashboard-featured-pack-cta'
          >
            Packs
          </button>
        </div>

        <div className='h-4' />
        <LegalFooter />
      </div>
      <BottomNav />
    </section>
  )
}
