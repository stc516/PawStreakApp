import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdventureShareCard } from '../components/adventure/AdventureShareCard'
import { missionTimeLabel } from '../data/localAdventureEngine'
import { useAppState } from '../hooks/useAppState'
import { getAdventureMilestone } from '../lib/adventureMilestones'
import { visibleAdventureTitle } from '../lib/adventureDisplayTitle'
import { shareAdventure } from '../lib/shareAdventure'
import { track } from '../lib/analytics'
import { calculateAdventureXp } from '../lib/xp'

interface CompletionViewState {
  title: string
  locationHint: string
  category: 'social' | 'exploration' | 'chill' | 'chaos' | 'routine'
  rarity: 'common' | 'uncommon' | 'rare'
  flavor: string
  emoji: string
  streakAfterCompletion: number
  completedAt: string
  /** Optional free-form memory the owner typed during the adventure. */
  memoryText: string
}

export function AdventurePage() {
  const navigate = useNavigate()
  const { state, completeAdventure } = useAppState()
  const m = state.generatedMission
  const [walkSeconds, setWalkSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [memoryDraft, setMemoryDraft] = useState('')
  const [completionModal, setCompletionModal] = useState<CompletionViewState | null>(null)
  const [shareStatus, setShareStatus] = useState<string | null>(null)
  const [photoStatus, setPhotoStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  // Track adventure_started exactly once per visit to /adventure.
  // Uses a ref so StrictMode double-invokes don't double-fire.
  const startedFiredRef = useRef(false)
  useEffect(() => {
    if (!state.onboardingComplete) return
    if (startedFiredRef.current) return
    startedFiredRef.current = true
    track('adventure_started', {
      adventure_category: m.category,
      adventure_rarity: m.rarity,
      is_away: state.isAway,
    })
  }, [state.onboardingComplete, m.category, m.rarity, state.isAway])

  useEffect(() => {
    if (paused) return
    const interval = window.setInterval(() => {
      setWalkSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [paused])

  const walkTime = useMemo(() => {
    const mins = Math.floor(walkSeconds / 60).toString().padStart(2, '0')
    const secs = (walkSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }, [walkSeconds])

  const xpBreakdown = useMemo(
    () =>
      calculateAdventureXp({
        walkSeconds,
        rarity: m.rarity,
      }),
    [m.rarity, walkSeconds],
  )
  const walkGround = (walkSeconds * 0.00042).toFixed(2)

  const milestone = useMemo(
    () => getAdventureMilestone(walkSeconds, state.dogName),
    [walkSeconds, state.dogName],
  )
  const timerOffset = 565 - (565 * Math.min(walkSeconds, 3600)) / 3600

  async function handleShareAdventure() {
    if (!completionModal) return
    try {
      const result = await shareAdventure({
        dogName: state.dogName,
        title: completionModal.title,
        category: completionModal.category,
        rarity: completionModal.rarity,
        streak: completionModal.streakAfterCompletion,
        locationHint: completionModal.locationHint,
        flavor: completionModal.flavor,
      })
      setShareStatus(result === 'shared' ? 'Shared successfully.' : 'Copied summary to clipboard.')
    } catch {
      setShareStatus('Could not share from this device yet.')
    }
  }

  const visibleTitle = visibleAdventureTitle(m.title, state.isAway)

  return (
    <section id='screen-walk' className='screen active' data-testid='adventure-page'>
      <div
        className='walk-hdr px-5 pb-4 text-left'
        style={{ paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 1.25rem))' }}
      >
        <button
          type='button'
          onClick={() => navigate('/app')}
          className='mb-3 text-[13px] text-[var(--text-2)]'
        >
          ← Back
        </button>
        <div data-testid='adventure-send-off' className='text-[12px] font-medium text-[var(--text-2)]'>
          {m.title}
        </div>
        <h1 className='mt-1 text-[22px] font-semibold leading-tight tracking-tight text-[var(--text)]'>{m.locationHint}</h1>
        <p className='mt-2 text-[13px] text-[var(--text-2)]'>{missionTimeLabel(m)}</p>
      </div>
      <div className='walk-body gap-3 px-5 py-3'>
        <article className='w-full rounded-2xl border border-[color:var(--border)] bg-[var(--bg-card)] p-4'>
          <div className='flex items-center gap-3'>
            <div className='grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--bg-elevated)] text-[28px]'>
              {m.emoji}
            </div>
            <div className='min-w-0'>
              <h2 className='text-[17px] font-semibold leading-tight text-[var(--text)]'>{visibleTitle}</h2>
              <p className='mt-0.5 text-[12px] text-[var(--text-2)]'>{m.locationHint}</p>
            </div>
          </div>
          {m.description ? (
            <p className='mt-3 text-[13px] leading-relaxed text-[var(--text-2)]'>&ldquo;{m.description}&rdquo;</p>
          ) : null}
        </article>

        <div className='w-full rounded-2xl border border-[color:var(--border)] bg-[var(--bg-card)] p-3 text-center' aria-label='Timer'>
          <div className='text-[10px] font-medium uppercase tracking-wide text-[var(--text-3)]'>Timer</div>
          <div className='mx-auto -my-7 scale-[0.72]'>
            <div className='timer-ring'>
              <svg viewBox='0 0 190 190' width='190' height='190'>
                <circle className='track' cx='95' cy='95' r='87' />
                <circle className='fill' cx='95' cy='95' r='87' style={{ strokeDashoffset: timerOffset }} />
              </svg>
              <div className='timer-center'>
                <div
                  data-testid='adventure-milestone-eyebrow'
                  className='text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--orange)]'
                >
                  {milestone.eyebrow}
                </div>
                <div className='timer-time'>{walkTime}</div>
                <div
                  data-testid='adventure-milestone-line'
                  className='mt-1 px-2 text-center text-[12px] leading-snug text-[var(--text-2)]'
                >
                  {milestone.line}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          data-testid='adventure-memory-block'
          className='mx-auto w-full max-w-[340px] rounded-[24px] bg-[var(--bg-card)] p-3.5'
        >
          <label htmlFor='adventure-memory-input' className='block text-[12px] font-medium text-[var(--text-2)]'>
            Note (optional)
          </label>
          <textarea
            id='adventure-memory-input'
            data-testid='adventure-memory-input'
            value={memoryDraft}
            onChange={(event) => setMemoryDraft(event.target.value)}
            rows={2}
            maxLength={240}
            placeholder={`What did ${state.dogName} notice?`}
            className='mt-2 w-full resize-none rounded-2xl border border-[color:var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] leading-snug text-[var(--text)] placeholder:text-[var(--text-3)] focus:border-[color:rgba(255,107,53,0.45)] focus:outline-none focus:ring-0'
          />
          <div className='mt-2 flex items-center justify-between'>
            <button
              type='button'
              data-testid='adventure-photo-button'
              onClick={() => setPhotoStatus('Photo capture is coming soon.')}
              className='inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-md)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-2)] transition-colors hover:text-[var(--text)]'
            >
              <span aria-hidden>📷</span>
              Take a photo
            </button>
            <div
              data-testid='adventure-ground-stat'
              className='text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]'
            >
              {walkGround} mi together
            </div>
          </div>
          {photoStatus ? (
            <p
              data-testid='adventure-photo-status'
              className='mt-2 text-[11px] italic leading-snug text-[var(--text-3)]'
            >
              {photoStatus}
            </p>
          ) : null}
        </div>
      </div>
      <div className='walk-actions'>
        <button type='button' className='btn-pause' onClick={() => setPaused((value) => !value)}>
          {paused ? '▶' : '⏸'}
        </button>
        <button
          type='button'
          className='btn-end'
          onClick={() => {
            const completionSnapshot: CompletionViewState = {
              title: visibleTitle,
              locationHint: m.locationHint,
              category: m.category,
              rarity: m.rarity,
              flavor: m.flavor,
              emoji: m.emoji,
              streakAfterCompletion: state.currentStreak + 1,
              completedAt: new Date().toISOString(),
              memoryText: memoryDraft.trim(),
            }
            completeAdventure(walkSeconds, { memoryText: completionSnapshot.memoryText })
            track('adventure_completed', {
              adventure_category: m.category,
              adventure_rarity: m.rarity,
              xp_earned: xpBreakdown.xp,
              streak_count: completionSnapshot.streakAfterCompletion,
              is_away: state.isAway,
            })
            setPaused(true)
            setCompletionModal(completionSnapshot)
            setShareStatus(null)
          }}
        >
          Wrap adventure →
        </button>
      </div>
      {completionModal ? (
        <div className='adventure-complete-modal-backdrop' role='dialog' aria-modal='true' aria-label='Adventure complete'>
          <div
            className={`adventure-complete-modal rarity-${completionModal.rarity}`}
            data-testid='adventure-complete-modal'
          >
            <div className='adventure-complete-kicker'>Memory saved</div>
            <h2
              data-testid='adventure-complete-headline'
              className='adventure-complete-title'
            >
              {state.dogName} had a great day.
            </h2>
            <p className='mt-1 text-[13px] leading-snug text-[var(--text-2)]'>
              {state.dogName} logged <span className='text-[var(--text)]'>{completionModal.title}</span>
              {completionModal.locationHint ? <> near {completionModal.locationHint}</> : null}.
            </p>

            {completionModal.memoryText ? (
              <div
                data-testid='adventure-complete-memory'
                className='mt-3 rounded-xl border border-[color:rgba(255,179,71,0.32)] bg-[color:rgba(255,179,71,0.06)] px-3 py-2 text-[13px] italic leading-snug text-[var(--text)]'
              >
                &ldquo;{completionModal.memoryText}&rdquo;
              </div>
            ) : null}

            <div className='mt-3 rounded-2xl bg-[rgba(255,255,255,0.045)] px-3 py-2 text-[12px] leading-relaxed text-[var(--text-2)]'>
              Day {completionModal.streakAfterCompletion} is safe. +{xpBreakdown.xp} XP moved quietly in the background.
            </div>

            <AdventureShareCard
              dogName={state.dogName}
              title={completionModal.title}
              neighborhoodOrLocation={completionModal.locationHint}
              category={completionModal.category}
              streak={completionModal.streakAfterCompletion}
              timestamp={completionModal.completedAt}
              flavor={completionModal.flavor}
              rarity={completionModal.rarity}
              emoji={completionModal.emoji}
            />
            <div className='adventure-complete-actions'>
              <button type='button' className='btn-share' onClick={handleShareAdventure}>
                Share Adventure
              </button>
              <button
                type='button'
                className='btn-ghost'
                onClick={() => setShareStatus('Photo capture is coming soon.')}
              >
                Take Photo
              </button>
              <button
                type='button'
                className='btn-done'
                onClick={() => {
                  setCompletionModal(null)
                  navigate('/character-moment')
                }}
              >
                Done
              </button>
            </div>
            {shareStatus ? <p className='adventure-complete-feedback'>{shareStatus}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
