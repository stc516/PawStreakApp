import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import { quickAdventurePicksForZip } from '../data/localAdventureEngine'
import { resolveUserEnvironment } from '../lib/resolveUserEnvironment'

function relativeDayLabel(iso: string): string {
  const then = new Date(iso)
  if (!Number.isFinite(then.getTime())) return ''
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
  const env = useMemo(() => resolveUserEnvironment(zip), [zip])
  const areaLabel = env.source === 'handcrafted' ? env.environment.neighborhood.split('/')[0]?.trim() ?? 'Nearby' : 'Nearby'

  const recent = state.recentAdventures.slice(0, 8)
  const placeHints = useMemo(
    () => new Set(state.recentAdventures.map((a) => a.locationHint?.trim()).filter(Boolean)).size,
    [state.recentAdventures],
  )

  return (
    <section
      id='s-home'
      className='screen active'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px))' }}
    >
      <header className='flex items-center justify-between border-b border-[color:var(--border)] bg-[var(--bg)] px-5 py-3'>
        <div className='text-[15px] font-semibold tracking-tight text-[var(--text)]'>
          Paw<span className='text-[color:var(--orange)]'>Streak</span>
        </div>
        <AccountStatusChip />
      </header>

      <div className='scroll'>
        <PostAdventureSavePrompt />
        <SaveProgressNudge />

        {!state.welcomeBannerDismissed ? (
          <div className='mx-5 mb-3 mt-4 rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] px-4 py-3'>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-[13px] leading-snug text-[var(--text)]'>
                <strong>{state.dogName}</strong> — pick a walk when you&apos;re ready.
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
          <div className='mx-5 mb-3 mt-2 rounded-xl border border-[color:rgba(79,195,247,0.35)] bg-[var(--bg-elevated)] px-4 py-3'>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-[13px] leading-snug text-[var(--text)]'>
                New area today — same dog, new smells.
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

        <div className='mx-5 mt-5 flex items-center gap-3'>
          <div className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--bg-card)] text-[26px]'>
            🐕
          </div>
          <div className='min-w-0'>
            <h1 className='text-[20px] font-semibold leading-tight tracking-tight text-[var(--text)]' data-testid='dashboard-dog-name'>
              {state.dogName}
            </h1>
            <p className='mt-0.5 text-[13px] text-[var(--text-2)]' data-testid='dashboard-streak-summary'>
              {state.currentStreak} day streak <span aria-hidden>🔥</span>
            </p>
          </div>
        </div>

        <p
          data-testid='dashboard-hero-status'
          className={`mx-5 mt-2 text-[13px] ${state.todayAdventureDone ? 'text-[var(--green)]' : 'text-[var(--text-2)]'}`}
        >
          {state.todayAdventureDone ? 'Walk logged for today.' : 'Ready when you are.'}
        </p>

        <div className='mx-5 mt-6'>
          <h2 className='text-[13px] font-semibold text-[var(--text)]'>Pick today&apos;s adventure</h2>
          <p className='mt-0.5 text-[12px] text-[var(--text-2)]'>{areaLabel}</p>
          <div className='-mx-1 mt-3 flex gap-2 overflow-x-auto pb-1' data-testid='dashboard-adventure-chips'>
            {picks.map((pick, index) => (
              <button
                key={pick.id}
                type='button'
                onClick={() => {
                  pickSuggestedAdventure(index)
                  navigate('/adventure')
                }}
                className='flex w-[112px] shrink-0 flex-col rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-left transition-colors active:scale-[0.98] hover:border-[color:rgba(255,107,53,0.4)]'
              >
                <span className='text-[20px] leading-none' aria-hidden>
                  {pick.emoji}
                </span>
                <span className='mt-1.5 text-[12px] font-semibold leading-tight text-[var(--text)]'>{pick.title}</span>
                <span className='mt-0.5 text-[11px] leading-snug text-[var(--text-2)]'>{pick.place}</span>
              </button>
            ))}
          </div>
          <button
            type='button'
            data-testid='dashboard-start-adventure-cta'
            className='btn-primary mt-4 !h-11 !rounded-xl !text-[14px]'
            onClick={() => navigate('/adventure')}
          >
            Start with current pick
          </button>
        </div>

        <div className='mx-5 mt-8' data-testid='dashboard-recent-memories'>
          <h2 className='text-[13px] font-semibold text-[var(--text)]'>Recent</h2>
          {recent.length > 0 ? (
            <div className='-mx-1 mt-3 flex gap-2 overflow-x-auto pb-1'>
              {recent.map((a) => (
                <button
                  key={a.id}
                  type='button'
                  onClick={() => navigate('/story')}
                  className='flex w-[100px] shrink-0 flex-col rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2 text-left'
                >
                  <span className='text-[22px]' aria-hidden>
                    {a.emoji}
                  </span>
                  <span className='mt-1 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--text)]'>{a.missionTitle}</span>
                  <span className='mt-0.5 text-[10px] text-[var(--text-3)]'>{relativeDayLabel(a.completedAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className='mt-2 text-[12px] text-[var(--text-2)]'>Your first walk shows up here.</p>
          )}
        </div>

        <div
          className='mx-5 mt-8 flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] px-4 py-3 text-center'
          data-testid='dashboard-stats-row'
        >
          <div>
            <div className='text-[16px] font-semibold tabular-nums text-[var(--text)]'>{state.totalAdventures}</div>
            <div className='text-[10px] text-[var(--text-3)]'>walks</div>
          </div>
          <div>
            <div className='text-[16px] font-semibold tabular-nums text-[var(--text)]'>{state.currentStreak}</div>
            <div className='text-[10px] text-[var(--text-3)]'>streak</div>
          </div>
          <div>
            <div className='text-[16px] font-semibold tabular-nums text-[var(--text)]'>{placeHints}</div>
            <div className='text-[10px] text-[var(--text-3)]'>places</div>
          </div>
        </div>

        <div className='mx-5 mt-6 flex flex-wrap gap-2'>
          <button
            type='button'
            data-testid='dashboard-the-wild-cta'
            onClick={() => navigate('/wild')}
            className='rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-2)]'
          >
            Progress
          </button>
          <button
            type='button'
            data-testid='dashboard-finds-cta'
            onClick={() => navigate('/badges')}
            className='rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-2)]'
          >
            Finds
          </button>
          <button
            type='button'
            onClick={() => navigate('/packs')}
            className='rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-2)]'
            data-testid='dashboard-featured-pack-cta'
          >
            Packs
          </button>
        </div>

        <div className='h-6' />
        <LegalFooter />
      </div>
      <BottomNav />
    </section>
  )
}
