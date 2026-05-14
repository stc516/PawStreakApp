import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { MascotBadge } from '../components/mascot/MascotBadge'
import { PackCard } from '../components/PackCard'
import { useAppState } from '../hooks/useAppState'
import { deriveAllProgress, summarizePacks } from '../lib/monthlyPacks'

export function PacksPage() {
  const navigate = useNavigate()
  const { state } = useAppState()

  const progress = useMemo(() => deriveAllProgress(state.recentAdventures), [state.recentAdventures])
  const summary = useMemo(() => summarizePacks(progress), [progress])

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  const inProgress = progress.filter((p) => !p.isComplete && p.completed > 0)
  const fresh = progress.filter((p) => p.completed === 0)
  const done = progress.filter((p) => p.isComplete)

  const hasAnyAdventure = state.recentAdventures.length > 0

  return (
    <section
      id='screen-packs'
      className='screen active flex flex-col bg-[var(--bg)] pt-2'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px) + 1rem)' }}
    >
      <header className='px-5 pt-10'>
        <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]'>
          {state.dogName}&apos;s world map
        </div>
        <h1 className='mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[28px] font-semibold italic leading-[1.1] text-[var(--text)]'>
          World Regions
        </h1>
        <p className='mt-2 text-[13px] leading-relaxed text-[var(--text-2)]'>
          Packs are places with an identity. Every repeated adventure makes the world feel more like
          {state.dogName}&apos;s.
        </p>
        <div className='mt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)]'>
          <span>
            <span className='font-bold text-[color:var(--orange)]'>{summary.completed}</span> / {summary.total} regions known
          </span>
          <span aria-hidden className='mx-2'>·</span>
          <span>{summary.inProgress} being explored</span>
        </div>
      </header>

      <div className='mx-auto mt-8 flex w-full max-w-[640px] flex-1 flex-col gap-8 px-5'>
        {!hasAnyAdventure ? (
          <div className='rounded-2xl border border-dashed border-[color:var(--border-md)] bg-[var(--bg-card)] p-5 text-center'>
            <div className='flex justify-center'>
              <MascotBadge mascot='duo' size='md' />
            </div>
            <h2 className='mt-3 font-[family-name:var(--fd),Fraunces,serif] text-[18px] font-semibold italic text-[var(--text)]'>
              {state.dogName}&apos;s collection starts today.
            </h2>
            <p className='mt-1 text-[13px] leading-relaxed text-[var(--text-2)]'>
              Choose a region below. The first visit makes the first mark on the atlas.
            </p>
          </div>
        ) : null}

        {inProgress.length > 0 ? (
          <PackSection title='Being explored' subtitle='Regions your dog is beginning to know.'>
            {inProgress.map((p) => (
              <PackCard key={p.pack.id} progress={p} />
            ))}
          </PackSection>
        ) : null}

        {fresh.length > 0 ? (
          <PackSection title='Undiscovered regions' subtitle='World identities waiting for the right day.'>
            {fresh.map((p) => (
              <PackCard key={p.pack.id} progress={p} />
            ))}
          </PackSection>
        ) : null}

        {done.length > 0 ? (
          <PackSection title='Known regions' subtitle='Earned identities — places that now feel like yours.'>
            {done.map((p) => (
              <PackCard key={p.pack.id} progress={p} />
            ))}
          </PackSection>
        ) : null}

        <LegalFooter />
      </div>
      <BottomNav />
    </section>
  )
}

interface PackSectionProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

function PackSection({ title, subtitle, children }: PackSectionProps) {
  return (
    <section className='flex flex-col gap-4' data-testid={`packs-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div>
        <div className='text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]'>
          {title}
        </div>
        <div className='mt-1 text-[12px] leading-relaxed text-[var(--text-2)]'>{subtitle}</div>
      </div>
      <div className='flex flex-col gap-4'>{children}</div>
    </section>
  )
}
