import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { MascotBadge } from '../components/mascot/MascotBadge'
import { LevelProgressCard } from '../components/LevelProgressCard'
import { PackCard } from '../components/PackCard'
import { VIBE_CHIPS } from '../data/missions'
import { useAppState } from '../hooks/useAppState'
import { deriveAllProgress, pickFeaturedPack, summarizePacks } from '../lib/monthlyPacks'
import { buildPlaceIdentity } from '../lib/placeIdentity'

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
  const { state, dismissWelcomeBanner, rollPickForMe } = useAppState()
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
  const place = useMemo(() => buildPlaceIdentity(state), [state])
  const memoryAtlas = useMemo(() => {
    const places = new Set(
      state.recentAdventures.map((entry) => entry.locationHint?.trim()).filter((value): value is string => Boolean(value)),
    )
    return {
      knownPlaces: places.size,
      lastPlace: latest?.locationHint ?? place.locationLine,
    }
  }, [latest?.locationHint, place.locationLine, state.recentAdventures])
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
        <AccountStatusChip />
      </header>

      <div className='scroll'>
        <PostAdventureSavePrompt />
        <SaveProgressNudge />
        {!state.welcomeBannerDismissed ? (
          <div className='mx-5 mb-4 mt-4 rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] px-4 py-3'>
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
          <div className='mx-5 mb-4 mt-2 rounded-xl border border-[color:rgba(79,195,247,0.35)] bg-[var(--bg-elevated)] px-4 py-3'>
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

        <section
          className='mx-5 mt-5 rounded-[28px] bg-[radial-gradient(circle_at_80%_0%,rgba(79,195,247,0.18),transparent_34%),linear-gradient(165deg,rgba(22,27,34,0.98),rgba(12,18,28,0.96))] p-6 pb-5 shadow-[0_24px_58px_rgba(0,0,0,0.36)]'
          data-testid='dashboard-today-card'
        >
          <div className='flex items-start gap-4'>
            <div className='grid h-[72px] w-[72px] shrink-0 place-items-center rounded-3xl bg-[var(--bg-elevated)] text-[38px] shadow-[0_12px_32px_rgba(0,0,0,0.35)]'>
              🐕
            </div>
            <div className='min-w-0'>
              <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]'>
                Today&apos;s world
              </div>
              <h1 className='mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[30px] font-semibold italic leading-[1.05] text-[var(--text)]'>
                {state.dogName} in {place.worldName}
              </h1>
              <p
                data-testid='dashboard-hero-status'
                className={`mt-2 text-[15px] leading-relaxed ${state.todayAdventureDone ? 'text-[var(--green)]' : 'text-[var(--text-2)]'}`}
              >
                {state.todayAdventureDone
                  ? `${state.dogName} had a great day here.`
                  : `${state.dogName} is ready for a great day here.`}
              </p>
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-4'>
            <div
              className='flex min-h-[56px] min-w-0 flex-1 flex-col justify-center rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.04)] px-4 py-3'
              data-testid='dashboard-streak-chip'
            >
              <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]'>Streak</div>
              <div className='mt-1 flex items-baseline gap-2 font-[family-name:var(--fd),Fraunces,serif] text-[26px] font-semibold italic leading-none text-[var(--text)]'>
                <span aria-hidden>🔥</span>
                {state.currentStreak}
                <span className='text-[13px] font-normal not-italic text-[var(--text-2)]'>days showing up</span>
              </div>
            </div>
            <div className='min-w-0 w-full'>
              <LevelProgressCard xp={state.totalAdventureEnergy} variant='compact' />
            </div>
          </div>

          <div className='mt-6 rounded-[22px] bg-[rgba(255,255,255,0.055)] p-5 ring-1 ring-[color:rgba(255,107,53,0.12)]'>
            <div className='text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--orange)]'>
              Today&apos;s featured adventure
            </div>
            <div className='mt-3 flex items-start gap-3'>
              <span className='text-[36px] leading-none' aria-hidden>
                {state.generatedMission.emoji}
              </span>
              <div className='min-w-0'>
                <div className='font-[family-name:var(--fd),Fraunces,serif] text-[24px] font-semibold leading-[1.12] text-[var(--text)]'>
                  {state.generatedMission.title}
                </div>
                <p className='mt-2 text-[14px] leading-relaxed text-[var(--text-2)]'>
                  {place.atmosphere} {place.discoveryPrompt}
                </p>
              </div>
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-2'>
            <button
              className='btn-primary'
              type='button'
              data-testid='dashboard-start-adventure-cta'
              onClick={() => navigate('/adventure')}
            >
              Enter today&apos;s adventure →
            </button>
            <button
              type='button'
              onClick={rollPickForMe}
              className='w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-2)] transition-colors hover:border-[color:var(--border-md)] hover:text-[var(--text)]'
            >
              Roll another adventure
            </button>
          </div>

          <div className='mt-6' data-testid='dashboard-zone-previews'>
            <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]'>Zone tones</div>
            <p className='mt-1 text-[12px] leading-snug text-[var(--text-2)]'>
              Atmospheres that quietly shape what shows up in the draw.
            </p>
            <div className='-mx-1 mt-3 flex gap-2 overflow-x-auto pb-1 pt-0.5'>
              {VIBE_CHIPS.map((chip) => (
                <button
                  key={chip.vibe}
                  type='button'
                  onClick={() => navigate('/adventure')}
                  className='shrink-0 rounded-2xl border border-[color:var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-left transition-colors hover:border-[color:rgba(255,107,53,0.35)]'
                >
                  <div className='text-lg leading-none' aria-hidden>
                    {chip.icon}
                  </div>
                  <div className='mt-1 text-[11px] font-semibold text-[var(--text)]'>{chip.name}</div>
                  <div className='mt-0.5 max-w-[140px] text-[10px] leading-snug text-[var(--text-3)]'>{chip.blurb}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className='mx-5 mt-6 rounded-[24px] bg-[var(--bg-card)] p-5' data-testid='dashboard-memory-atlas'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]'>
                Memory atlas
              </div>
              <h2 className='mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[20px] font-semibold italic text-[var(--text)]'>
                {memoryAtlas.knownPlaces > 0
                  ? `${state.dogName} knows ${memoryAtlas.knownPlaces} ${place.atlasNoun}.`
                  : `${state.dogName}'s map starts today.`}
              </h2>
            </div>
            <button
              type='button'
              onClick={() => navigate('/story')}
              className='shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]'
            >
              Open atlas
            </button>
          </div>
          {latest ? (
            <div className='mt-4 flex gap-3'>
              <div className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--bg-elevated)] text-[24px]'>
                {latest.emoji}
              </div>
              <div className='min-w-0'>
                <div className='text-[13px] font-semibold text-[var(--text)]'>
                  {latest.missionTitle} · {memoryAtlas.lastPlace}
                </div>
                <div className='mt-0.5 text-[11px] text-[var(--text-3)]'>{relativeDayLabel(latest.completedAt)}</div>
                <p className='mt-2 text-[13px] italic leading-relaxed text-[var(--text-2)]'>
                  &ldquo;{latest.memoryText || latest.missionDescription || `${state.dogName} added another place to the story.`}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className='mt-4 flex items-center gap-3 rounded-2xl bg-[var(--bg-elevated)] p-3'>
              <MascotBadge mascot='bailey' size='sm' />
              <p className='text-[13px] leading-relaxed text-[var(--text-2)]'>
                No memories yet. The first doorway, park edge, or sidewalk corner can become chapter one.
              </p>
            </div>
          )}
        </section>

        <section className='mx-5 mt-6' data-testid='dashboard-featured-pack'>
          <div className='mb-2 flex items-end justify-between pl-0.5'>
            <div>
              <div className='eye'>World region opening</div>
              <div className='mt-0.5 text-[12px] text-[var(--text-2)]'>
                Packs are identities {state.dogName} can grow into.
              </div>
            </div>
            <button
              type='button'
              onClick={() => navigate('/packs')}
              className='text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)] transition-colors hover:text-[var(--text-2)]'
              data-testid='dashboard-featured-pack-cta'
            >
              Regions · {packSummary.completed}/{packSummary.total}
            </button>
          </div>
          <PackCard progress={featuredPack} variant='featured' />
        </section>

        <section
          data-testid='dashboard-tomorrow-tease'
          className='mx-5 mt-6 rounded-2xl border border-[color:rgba(167,139,250,0.22)] bg-[linear-gradient(135deg,rgba(167,139,250,0.08),transparent_55%)] px-5 py-4'
        >
          <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--purple)]'>Tomorrow</div>
          <p className='mt-2 text-[14px] leading-relaxed text-[var(--text-2)]'>
            Another beat in <span className='text-[var(--text)]'>{place.worldName}</span> — same dog, new light. The ritual
            continues.
          </p>
        </section>

        <section
          data-testid='dashboard-supporting-band'
          className='mx-5 mt-6 rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.025)] p-4'
          aria-label='Supporting progress'
        >
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]'>
                Supporting progress
              </div>
              <div className='mt-1 text-[12px] leading-snug text-[var(--text-2)]'>
                Day {state.currentStreak} · {state.totalAdventures} adventures · XP stays in the background.
              </div>
            </div>
            <div className='flex shrink-0 gap-2'>
              <button
                type='button'
                data-testid='dashboard-finds-cta'
                onClick={() => navigate('/badges')}
                className='rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]'
              >
                Finds
              </button>
              <button
                type='button'
                data-testid='dashboard-the-wild-cta'
                onClick={() => navigate('/wild')}
                className='rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]'
              >
                Wild
              </button>
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
