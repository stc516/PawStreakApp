import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LevelProgressCard } from '../components/LevelProgressCard'
import { ProgressBar } from '../components/ProgressBar'
import { RewardCard } from '../components/RewardCard'
import { bondArcProgress, identityArc } from '../data/missions'
import { useAppState } from '../hooks/useAppState'
import { didLevelUp, getCurrentLevel } from '../utils/xpLevels'

const confettiPalette = [
  '#FF9500', '#FFB874', '#FF5E00', '#ffbe68', '#ffbd7f', '#e5e2e1', '#ffb599',
]

const C = {
  bg:          '#0A0A0A',
  surface:     '#1c1b1b',
  primary:     '#ffbd7f',
  primaryGrad: 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)',
  onSurface:   '#e5e2e1',
  muted:       '#dbc2ad',
  border8:     'rgba(255,255,255,0.08)',
  border10:    'rgba(255,255,255,0.10)',
}
const FONT = "'Inter', sans-serif"

export function RewardPage() {
  const navigate = useNavigate()
  const { state, setReminder, resetRewardFlow } = useAppState()
  const [shareFeedback, setShareFeedback] = useState('')
  const latest = state.latestCompletedAdventure
  const bond = bondArcProgress(state.currentStreak)
  const identity = identityArc(state.totalAdventureEnergy, state.currentStreak)

  const previousXp = Math.max(0, state.totalAdventureEnergy - (latest?.adventureEnergy ?? 0))
  const leveledUp = didLevelUp(previousXp, state.totalAdventureEnergy)
  const currentTier = getCurrentLevel(state.totalAdventureEnergy)

  const unlockedBadge = state.latestUnlockedBadgeId
    ? state.badges.find((b) => b.id === state.latestUnlockedBadgeId)
    : null

  const confettiPieces = useMemo(
    () => Array.from({ length: 44 }, (_, idx) => ({
      id: idx,
      left: (idx * 11) % 100,
      size: 5 + (idx % 7),
      duration: 1.4 + (idx % 6) * 0.35,
      delay: (idx % 5) * 0.12,
      radius: idx % 2 === 0 ? '50%' : '2px',
      color: confettiPalette[idx % confettiPalette.length],
    })),
    [],
  )

  const shareCopy = `${state.dogName} had a great day. 🐾
Day ${state.currentStreak} of giving ${state.dogName === 'Your dog' ? 'them' : state.dogName} a story to remember. #PawStreak`

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${state.dogName}'s ${latest?.missionTitle ?? 'mission'}`,
          text: shareCopy,
        })
        setShareFeedback('Shared!')
        return
      }
      await navigator.clipboard.writeText(shareCopy)
      setShareFeedback('Copied! Paste it anywhere.')
    } catch {
      setShareFeedback('Sharing cancelled.')
    }
  }

  return (
    <section
      id="screen-reward"
      style={{
        minHeight: '100dvh',
        background: C.bg,
        color: C.onSurface,
        fontFamily: FONT,
        maxWidth: '390px',
        margin: '0 auto',
        overflowX: 'hidden',
        paddingBottom: '40px',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti-fall {
          0% { transform: translateY(-60px) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(60vh) rotateZ(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          animation: confetti-fall linear forwards;
          pointer-events: none;
        }
      ` }} />

      {/* Confetti */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 40 }}>
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              background: piece.color,
              animationDuration: `${piece.duration}s`,
              animationDelay: `${piece.delay}s`,
              borderRadius: piece.radius,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '480px',
        background: 'radial-gradient(circle at center, rgba(255,184,116,0.08) 0%, rgba(10,10,10,0) 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ padding: '48px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative' }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: C.primary, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Memory saved
          </p>
          <h2
            data-testid="reward-headline"
            style={{ fontSize: '28px', fontWeight: '700', color: C.onSurface, margin: '0 0 8px', lineHeight: '1.2' }}
          >
            {state.dogName} had a great day.
          </h2>
          <p style={{ fontSize: '15px', color: C.muted, margin: 0, lineHeight: '1.5' }}>
            {latest?.locationHint ? `${latest.locationHint} matters now.` : 'Every dog deserves a great day.'}
            {' · '}{identity.tagline}
          </p>
        </section>

        {/* Adventure summary card */}
        <div style={{
          width: '100%',
          background: C.surface,
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 0 30px 2px rgba(255,149,0,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: C.onSurface, margin: '0 0 4px', lineHeight: '1.3' }}>
                {latest?.missionTitle ?? state.generatedMission.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
                <span style={{ fontSize: '12px', fontWeight: '600', color: C.muted, letterSpacing: '0.05em' }}>Adventure</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,189,127,0.10)',
              border: '1px solid rgba(255,189,127,0.20)',
              borderRadius: '9999px', padding: '4px 12px',
              fontSize: '12px', fontWeight: '600', color: C.primary,
            }}>
              +{latest?.adventureEnergy ?? 0} warmth
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(85,67,52,0.3)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.primary} stroke="none">
              <path d="M12 2c0 0-5.5 5.5-5.5 11a5.5 5.5 0 0011 0C17.5 7.5 12 2 12 2z"/>
            </svg>
            <p style={{ fontSize: '15px', color: C.onSurface, margin: 0 }}>
              {state.currentStreak} Day Streak Protected
            </p>
          </div>
        </div>

        {/* Memory quote */}
        {latest?.memoryText ? (
          <div
            data-testid="reward-memory-card"
            style={{ width: '100%', padding: '8px 0', textAlign: 'center' }}
          >
            <blockquote style={{
              fontSize: '20px', fontWeight: '600', fontStyle: 'italic',
              color: '#ffb874', lineHeight: '1.5', opacity: 0.9, margin: 0,
            }}>
              &ldquo;{latest.memoryText}&rdquo;
            </blockquote>
          </div>
        ) : null}

        {/* XP progress block */}
        <RewardCard delayMs={380}>
          <div
            data-testid="reward-progress-block"
            style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.035)', padding: '12px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.16em', color: C.muted }}>
                Supporting progress
              </span>
              <span data-testid="reward-xp-mini" style={{ fontSize: '11px', fontWeight: '600', color: C.muted }}>
                +{latest?.adventureEnergy ?? 0} warmth
              </span>
            </div>
            <LevelProgressCard
              xp={state.totalAdventureEnergy}
              variant="compact"
              footnote={
                leveledUp
                  ? `⬆️ ${state.dogName} reached ${currentTier.current.name}!`
                  : currentTier.isMaxLevel
                    ? undefined
                    : `${currentTier.current.icon} ${currentTier.current.name} · ${currentTier.xpToNext.toLocaleString()} warmth until ${currentTier.next?.name}`
              }
            />
          </div>
        </RewardCard>

        {/* Streak / bond */}
        <RewardCard className="streak-protected" delayMs={200}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>🔥</span>
            <div>
              <div style={{ fontSize: '15px', color: C.onSurface, marginBottom: '4px' }}>
                {state.dogName} kept the streak alive — <strong>{state.currentStreak}</strong> good days in a row.
              </div>
              <div style={{ fontSize: '13px', color: C.muted }}>
                {bond.remaining > 0
                  ? `${bond.remaining} more adventure${bond.remaining === 1 ? '' : 's'} until the next chapter of your bond.`
                  : 'Your bond grew deeper — a new chapter begins.'}
              </div>
            </div>
          </div>
        </RewardCard>

        {/* Tomorrow tease */}
        <RewardCard className="next-ms" delayMs={260}>
          <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.16em', color: C.muted, marginBottom: '8px' }}>
            What&apos;s next for {state.dogName}
          </div>
          <div style={{ fontSize: '15px', color: C.onSurface }}>{state.tomorrowTease}</div>
        </RewardCard>

        {/* Badge unlock */}
        {unlockedBadge ? (
          <RewardCard className="badge-unlock" delayMs={320}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px', flexShrink: 0 }}>{unlockedBadge.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: C.onSurface, marginBottom: '2px' }}>{unlockedBadge.name}</div>
                <div style={{ fontSize: '13px', color: C.muted }}>{unlockedBadge.description}</div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: C.primary, border: `1px solid ${C.primary}`, borderRadius: '9999px', padding: '2px 8px', flexShrink: 0 }}>
                New!
              </div>
            </div>
          </RewardCard>
        ) : null}

        {/* Identity arc */}
        <RewardCard className="next-ms" delayMs={460}>
          <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.16em', color: C.muted, marginBottom: '8px' }}>
            Who {state.dogName} is becoming
          </div>
          <ProgressBar value={Math.min(state.currentStreak, bond.target)} max={bond.target} className="nm-prog" />
          <div style={{ fontSize: '15px', color: C.onSurface, marginTop: '8px' }}>
            Today, <span style={{ color: C.primary }}>{identity.title}</span>. Tomorrow, another chapter.
          </div>
        </RewardCard>

        {/* Share card */}
        <RewardCard className="share-wrap" delayMs={500}>
          <div style={{
            aspectRatio: '4/5', position: 'relative',
            borderRadius: '16px', overflow: 'hidden',
            marginBottom: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
              alt={`${state.dogName} on adventure`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, #0A0A0A 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
            }} />
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <button type="button" onClick={handleShare} style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '24px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h4 style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px', lineHeight: '1.2' }}>
                    {state.dogName}
                  </h4>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>
                    {(latest?.missionTitle ?? 'Adventure').toUpperCase()}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '48px', fontWeight: '300', letterSpacing: '-0.02em', lineHeight: '1', color: C.primary }}>
                    {state.currentStreak}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: '-4px', letterSpacing: '0.05em' }}>
                    DAYS
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button type="button" onClick={handleShare} style={{
            width: '100%', height: '48px',
            background: C.surface, border: `1px solid ${C.border10}`,
            borderRadius: '14px', color: C.onSurface,
            fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: FONT,
          }}>
            📤 Share {state.dogName}&apos;s day
          </button>
          {shareFeedback ? (
            <p style={{ fontSize: '12px', color: C.muted, textAlign: 'center', marginTop: '8px', margin: '8px 0 0' }}>
              {shareFeedback}
            </p>
          ) : null}
        </RewardCard>

        {/* Reminder card */}
        <RewardCard className="commitment-card" delayMs={580}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: C.onSurface, marginBottom: '16px' }}>
              Same time tomorrow?
            </div>
            <button
              type="button"
              onClick={() => { if (!state.reminderSet) setReminder(true) }}
              style={{
                width: '100%', height: '48px',
                background: state.reminderSet ? 'rgba(255,149,0,0.10)' : C.surface,
                border: `1px solid ${state.reminderSet ? C.primary : C.border8}`,
                borderRadius: '12px',
                color: state.reminderSet ? C.primary : C.muted,
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT,
                marginBottom: state.reminderSet ? '12px' : 0,
              }}
            >
              {state.reminderSet
                ? `Reminder set — ${state.dogName}'s next surprise is bookmarked.`
                : '🔔 Remind me'}
            </button>
            {state.reminderSet && (
              <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.5' }}>
                Tomorrow resets the board — <span style={{ color: C.onSurface }}>{state.dogName}&apos;s day {state.currentStreak + 1}</span> mission drops at midnight.
              </div>
            )}
          </div>
        </RewardCard>

        {/* Footer */}
        <footer style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <p style={{ fontSize: '15px', color: C.muted, textAlign: 'center', margin: 0 }}>
            Come back tomorrow — the story continues.
          </p>
          <button
            type="button"
            onClick={() => { resetRewardFlow(); navigate('/app') }}
            style={{
              width: '280px', height: '56px',
              background: C.primaryGrad,
              border: 'none', borderRadius: '9999px',
              color: '#FFFFFF', fontSize: '17px', fontWeight: '700',
              cursor: 'pointer', fontFamily: FONT,
              boxShadow: '0 4px 20px rgba(255,94,0,0.3)',
            }}
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => { if (!state.reminderSet) setReminder(true) }}
            style={{
              background: 'none', border: 'none',
              fontSize: '12px', fontWeight: '600', color: C.muted,
              cursor: 'pointer', fontFamily: FONT, padding: '8px',
            }}
          >
            Remind me
          </button>
        </footer>

      </div>
    </section>
  )
}
