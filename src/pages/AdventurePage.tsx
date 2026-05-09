import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdventureShareCard } from '../components/adventure/AdventureShareCard'
import { missionTimeLabel } from '../data/localAdventureEngine'
import { useAppState } from '../hooks/useAppState'
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
}

export function AdventurePage() {
  const navigate = useNavigate()
  const { state, completeAdventure } = useAppState()
  const m = state.generatedMission
  const [walkSeconds, setWalkSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [completionModal, setCompletionModal] = useState<CompletionViewState | null>(null)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

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
  const pace = useMemo(() => {
    const dist = Number.parseFloat(walkGround)
    if (dist <= 0.05) return '—'
    const paceValue = Math.floor((walkSeconds / 60) / dist)
    return paceValue > 0 && paceValue < 99 ? `${paceValue}'` : '—'
  }, [walkGround, walkSeconds])

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

  return (
    <section id='screen-walk' className='screen active'>
      <div className='walk-hdr'>
        <div className='walk-type-lbl'>
          {m.emoji} {visibleAdventureTitle(m.title, state.isAway)}
        </div>
        <div className='walk-dog-lbl'>{state.dogName}&apos;s story is being written...</div>
        <div className='walk-mission-meta'>
          <div className='wm-line'>
            {missionTimeLabel(m)} · {m.locationHint}
          </div>
          <div className='wm-desc'>&ldquo;{m.description}&rdquo;</div>
        </div>
      </div>
      <div className='walk-body'>
        <div className='timer-ring'>
          <svg viewBox='0 0 190 190' width='190' height='190'>
            <circle className='track' cx='95' cy='95' r='87' />
            <circle className='fill' cx='95' cy='95' r='87' style={{ strokeDashoffset: timerOffset }} />
          </svg>
          <div className='timer-center'>
            <div className='timer-time'>{walkTime}</div>
            {walkSeconds < 30 ? (
              <div className='timer-xp text-[var(--text-2)]'>Warming up…</div>
            ) : (
              <div className='timer-xp'>+{xpBreakdown.xp} Adventure XP</div>
            )}
            {walkSeconds >= 30 && m.rarity !== 'common' ? (
              <div className='mt-1 text-[11px] font-medium text-[var(--gold)]'>Includes rarity bonus</div>
            ) : null}
          </div>
        </div>
        <div className='walk-stats-row'>
          <div className='wstat'>
            <div className='wstat-val'>{walkGround}</div>
            <div className='wstat-lbl'>Ground covered</div>
          </div>
          <div className='wstat'>
            <div className='wstat-val'>{pace}</div>
            <div className='wstat-lbl'>Pace vibe</div>
          </div>
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
              title: visibleAdventureTitle(m.title, state.isAway),
              locationHint: m.locationHint,
              category: m.category,
              rarity: m.rarity,
              flavor: m.flavor,
              emoji: m.emoji,
              streakAfterCompletion: state.currentStreak + 1,
              completedAt: new Date().toISOString(),
            }
            completeAdventure(walkSeconds)
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
          <div className={`adventure-complete-modal rarity-${completionModal.rarity}`}>
            <div className='adventure-complete-kicker'>{state.dogName} completed:</div>
            <h2 className='adventure-complete-title'>{completionModal.title}</h2>
            <div className='adventure-complete-meta'>
              <span className='adventure-complete-chip'>{completionModal.category}</span>
              <span>{completionModal.locationHint}</span>
            </div>
            <div className='adventure-complete-streak'>🔥 Day {completionModal.streakAfterCompletion} streak</div>
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
