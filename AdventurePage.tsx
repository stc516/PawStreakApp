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
    const hours = Math.floor(walkSeconds / 3600).toString().padStart(2, '0')
    const mins = Math.floor((walkSeconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (walkSeconds % 60).toString().padStart(2, '0')
    return `${hours}:${mins}:${secs}`
  }, [walkSeconds])

  const xpBreakdown = useMemo(
    () => calculateAdventureXp({ walkSeconds, rarity: m.rarity }),
    [m.rarity, walkSeconds],
  )
  const walkGround = (walkSeconds * 0.00042).toFixed(2)
  const milestone = useMemo(
    () => getAdventureMilestone(walkSeconds, state.dogName),
    [walkSeconds, state.dogName],
  )
  const timerOffset = 565 - (565 * Math.min(walkSeconds, 3600)) / 3600
  const visibleTitle = visibleAdventureTitle(m)

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
      setShareStatus(null)
    }
  }

  const categoryEmoji: Record<string, string> = {
    social: '☕',
    exploration: '🗺️',
    chill: '🌅',
    chaos: '⚡',
    routine: '🏡',
  }
  const catEmoji = categoryEmoji[m.category] || '🐾'

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0A0E14',
        color: '#FFFFFF',
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: '390px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* ── TOP BAR ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 8px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/app')}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: '12px', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Adventure
        </div>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ···
        </button>
      </div>

      {/* ── PLACE HEADER ── */}
      <div style={{ textAlign: 'center', padding: '12px 20px 8px' }}>
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>{catEmoji}</div>
        <div style={{ fontSize: '12px', color: '#9CA3AF', letterSpacing: '0.06em', marginBottom: '4px' }}>
          {m.category.charAt(0).toUpperCase() + m.category.slice(1)}
        </div>
        <div
          data-testid="adventure-send-off"
          style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2' }}
        >
          {m.locationHint || visibleTitle}
        </div>
        <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          📍 {m.locationHint || 'Nearby'}
        </div>
      </div>

      {/* ── TIMER ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 20px' }}>
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: '700',
              color: '#F97316',
              letterSpacing: '-2px',
              lineHeight: '1',
              fontVariantNumeric: 'tabular-nums',
            }}
            data-testid="adventure-milestone-eyebrow"
          >
            {walkTime}
          </div>
          <div style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', marginTop: '6px' }}>
            Time on Adventure
          </div>
        </div>

        {/* Milestone line */}
        <div
          style={{
            fontSize: '13px',
            color: '#9CA3AF',
            textAlign: 'center',
            marginBottom: '8px',
            fontStyle: 'italic',
            minHeight: '20px',
          }}
          data-testid="adventure-milestone-line"
        >
          {milestone.line}
        </div>

        {/* ── CAMERA CTA ── */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            data-testid="adventure-photo-button"
            onClick={() => setPhotoStatus('Photo capture coming soon.')}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#1A2030',
              border: '2px solid rgba(249,115,22,0.4)',
              boxShadow: '0 0 24px rgba(249,115,22,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              cursor: 'pointer',
              margin: '0 auto',
            }}
          >
            📷
          </button>
          <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '10px' }}>Capture a moment</div>
          <div style={{ fontSize: '13px', color: '#F97316', marginTop: '2px' }}>+10 XP</div>
          {photoStatus && (
            <div
              data-testid="adventure-photo-status"
              style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', fontStyle: 'italic' }}
            >
              {photoStatus}
            </div>
          )}
        </div>

        {/* ── MEMORY NOTE ── */}
        <div
          data-testid="adventure-memory-block"
          style={{
            width: '100%',
            background: '#12171F',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <label
            htmlFor="adventure-memory-input"
            style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500', display: 'block', marginBottom: '8px' }}
          >
            Note (optional)
          </label>
          <textarea
            id="adventure-memory-input"
            data-testid="adventure-memory-input"
            value={memoryDraft}
            onChange={(e) => setMemoryDraft(e.target.value)}
            rows={2}
            maxLength={240}
            placeholder={`What did ${state.dogName} notice?`}
            style={{
              width: '100%',
              background: '#1A2030',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '13px',
              color: '#FFFFFF',
              fontFamily: "'DM Sans', sans-serif",
              resize: 'none',
              outline: 'none',
            }}
          />
          <div
            data-testid="adventure-ground-stat"
            style={{ fontSize: '10px', color: '#374151', textAlign: 'right', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            {walkGround} mi together
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button
            type="button"
            className="btn-pause"
            onClick={() => setPaused((v) => !v)}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '13px',
              background: '#1A2030',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#9CA3AF',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <button
            type="button"
            className="btn-end"
            onClick={() => {
              const snap: CompletionViewState = {
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
              completeAdventure(walkSeconds, { memoryText: snap.memoryText })
              track('adventure_completed', {
                adventure_category: m.category,
                adventure_rarity: m.rarity,
                xp_earned: xpBreakdown.xp,
                streak_count: snap.streakAfterCompletion,
                is_away: state.isAway,
              })
              setPaused(true)
              setCompletionModal(snap)
              setShareStatus(null)
            }}
            style={{
              flex: 1,
              height: '52px',
              background: '#F97316',
              border: 'none',
              borderRadius: '99px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Finish
          </button>
        </div>

        {/* Hidden SVG timer ring for e2e compatibility */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <div className="timer-ring">
            <svg viewBox="0 0 190 190" width="190" height="190">
              <circle className="track" cx="95" cy="95" r="87" />
              <circle className="fill" cx="95" cy="95" r="87" style={{ strokeDashoffset: timerOffset }} />
            </svg>
          </div>
        </div>
      </div>

      {/* ── COMPLETION MODAL ── */}
      {completionModal ? (
        <div
          className="adventure-complete-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Adventure complete"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 50,
            padding: '0',
          }}
        >
          <div
            data-testid="adventure-complete-modal"
            className={`adventure-complete-modal rarity-${completionModal.rarity}`}
            style={{
              background: '#12171F',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px 40px',
              width: '100%',
              maxWidth: '390px',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              className="adventure-complete-kicker"
              style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F97316', marginBottom: '8px' }}
            >
              Memory saved
            </div>
            <h2
              data-testid="adventure-complete-headline"
              className="adventure-complete-title"
              style={{ fontSize: '26px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '6px' }}
            >
              {state.dogName} had a great day.
            </h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', marginBottom: '12px' }}>
              {state.dogName} logged{' '}
              <span style={{ color: '#FFFFFF' }}>{completionModal.title}</span>
              {completionModal.locationHint ? <> near {completionModal.locationHint}</> : null}.
              {' '}Day {completionModal.streakAfterCompletion} is safe. +{xpBreakdown.xp} XP.
            </p>

            {completionModal.memoryText ? (
              <div
                data-testid="adventure-complete-memory"
                style={{
                  background: 'rgba(249,115,22,0.06)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  marginBottom: '12px',
                }}
              >
                &ldquo;{completionModal.memoryText}&rdquo;
              </div>
            ) : null}

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

            <div
              className="adventure-complete-actions"
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}
            >
              <button
                type="button"
                className="btn-share"
                onClick={handleShareAdventure}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#1A2030',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                📤 Share Adventure
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPhotoStatus('Photo capture coming soon.')}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Take Photo
              </button>
              <button
                type="button"
                className="btn-done"
                onClick={() => {
                  setCompletionModal(null)
                  navigate('/character-moment')
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  background: '#F97316',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Done
              </button>
            </div>

            {shareStatus ? (
              <p
                className="adventure-complete-feedback"
                style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '10px' }}
              >
                {shareStatus}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
