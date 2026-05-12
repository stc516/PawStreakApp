import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LevelProgressCard } from '../components/LevelProgressCard'
import { ProgressBar } from '../components/ProgressBar'
import { RewardCard } from '../components/RewardCard'
import { bondArcProgress, identityArc } from '../data/missions'
import { useAppState } from '../hooks/useAppState'
import { didLevelUp, getCurrentLevel } from '../utils/xpLevels'

const confettiColors = [
  'var(--orange)',
  'var(--gold)',
  'var(--green)',
  'var(--blue)',
  'var(--purple)',
  'var(--text-2)',
  'var(--red)',
]

export function RewardPage() {
  const navigate = useNavigate()
  const { state, setReminder, resetRewardFlow } = useAppState()
  const [shareFeedback, setShareFeedback] = useState('')
  const latest = state.latestCompletedAdventure
  const bond = bondArcProgress(state.currentStreak)
  const identity = identityArc(state.totalAdventureEnergy, state.currentStreak)

  // Derive previous XP using the just-completed adventure energy. This is safe
  // because XP math itself is untouched — we're only inferring what the user
  // had *before* this adventure landed in `totalAdventureEnergy`.
  const previousXp = Math.max(0, state.totalAdventureEnergy - (latest?.adventureEnergy ?? 0))
  const leveledUp = didLevelUp(previousXp, state.totalAdventureEnergy)
  const currentTier = getCurrentLevel(state.totalAdventureEnergy)

  const unlockedBadge = state.latestUnlockedBadgeId
    ? state.badges.find((b) => b.id === state.latestUnlockedBadgeId)
    : null

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, idx) => ({
        id: idx,
        left: (idx * 11) % 100,
        size: 5 + (idx % 7),
        duration: 1.4 + (idx % 6) * 0.35,
        delay: (idx % 5) * 0.12,
        radius: idx % 2 === 0 ? '50%' : '2px',
        color: confettiColors[idx % confettiColors.length],
      })),
    [],
  )

  const shareCopy = `${state.dogName} had a great day. 🐾
Day ${state.currentStreak} of giving ${state.dogName === 'Your dog' ? 'them' : state.dogName} a story to remember. #PawStreak`

  async function handleShare() {
    console.log('share_clicked')

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
    <section id='screen-reward' className='screen active'>
      <div className='rew-hero'>
        <div className='rew-confetti'>
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className='confetti-piece'
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
        <div className='rew-mission-complete'>Today&apos;s win</div>
        <div className='rew-won' data-testid='reward-headline'>
          {state.dogName} had a great day.
        </div>
        <div className='rew-headline'>
          <em>{state.dogName}</em> completed <strong>{latest?.missionTitle ?? state.generatedMission.title}</strong>
        </div>
        <div className='rew-subline'>
          Every dog deserves a great day · {identity.tagline}
        </div>
      </div>
      <div className='rew-body'>
        {latest?.memoryText ? (
          <RewardCard className='next-ms' delayMs={120}>
            <div
              data-testid='reward-memory-card'
              className='flex flex-col gap-2'
            >
              <div className='nm-label'>Today&apos;s memory</div>
              <div className='font-[family-name:var(--fd),Fraunces,serif] text-[18px] font-semibold italic leading-snug text-[var(--text)]'>
                &ldquo;{latest.memoryText}&rdquo;
              </div>
            </div>
          </RewardCard>
        ) : null}
        <RewardCard className='streak-protected' delayMs={200}>
          <div className='sp-icon'>🔥</div>
          <div>
            <div className='sp-text'>
              {state.dogName} kept the streak alive — <strong>{state.currentStreak}</strong> good days in a row.
            </div>
            <div className='sp-sub'>
              {bond.remaining > 0
                ? `${bond.remaining} more adventure${bond.remaining === 1 ? '' : 's'} until the next chapter of your bond.`
                : 'Your bond just levelled up — a new chapter begins.'}
            </div>
          </div>
        </RewardCard>
        <RewardCard className='next-ms' delayMs={260}>
          <div className='nm-label'>What&apos;s next for {state.dogName}</div>
          <div className='nm-text'>{state.tomorrowTease}</div>
        </RewardCard>
        {unlockedBadge ? (
          <RewardCard className='badge-unlock' delayMs={320}>
            <div className='bu-icon'>{unlockedBadge.icon}</div>
            <div className='bu-info'>
              <div className='bu-title'>{unlockedBadge.name}</div>
              <div className='bu-desc'>{unlockedBadge.description}</div>
            </div>
            <div className='bu-new'>New!</div>
          </RewardCard>
        ) : null}
        <RewardCard delayMs={380}>
          <div
            data-testid='reward-progress-block'
            className='rounded-2xl border border-[color:var(--border)] bg-[var(--bg-card)] p-3'
          >
            <div className='mb-2 flex items-center justify-between'>
              <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]'>
                Progress (supporting)
              </div>
              <div
                data-testid='reward-xp-mini'
                className='text-[11px] font-semibold text-[var(--text-2)]'
              >
                +{latest?.adventureEnergy ?? 0} XP
              </div>
            </div>
            <LevelProgressCard
              xp={state.totalAdventureEnergy}
              variant='compact'
              footnote={
                leveledUp
                  ? `\u2B06\uFE0F ${state.dogName} reached ${currentTier.current.name}!`
                  : currentTier.isMaxLevel
                    ? undefined
                    : `${currentTier.current.icon} ${currentTier.current.name} \u00B7 ${currentTier.xpToNext.toLocaleString()} XP until ${currentTier.next?.name}`
              }
            />
          </div>
        </RewardCard>
        <RewardCard className='streak-protected' delayMs={420}>
          <div className='sp-icon'>🍖</div>
          <div>
            <div className='sp-text'>
              Emergency Treat —{' '}
              <strong>{state.emergencyTreatAvailable ? 'still ready' : 'already used'}</strong>
            </div>
            <div className='sp-sub'>
              {state.emergencyTreatAvailable
                ? `${state.dogName}'s cushion for hectic days is stocked.`
                : `You'll refill this perk as you keep showing up.`}
            </div>
          </div>
        </RewardCard>
        <RewardCard className='next-ms' delayMs={460}>
          <div className='nm-label'>Who {state.dogName} is becoming</div>
          <ProgressBar value={Math.min(state.currentStreak, bond.target)} max={bond.target} className='nm-prog' />
          <div className='nm-text'>
            Today, <span>{identity.title}</span>. Tomorrow, another chapter.
          </div>
        </RewardCard>
        <RewardCard className='share-wrap' delayMs={500}>
          <div className='share-card'>
            <div className='sc-radial' />
            <div className='sc-inner'>
              <div className='sc-paw'>🐾</div>
              <div className='sc-dog'>{state.dogName}</div>
              <div className='sc-type'>{latest?.missionTitle ?? state.selectedMissionTitle}</div>
              <div className='sc-streak'>{state.currentStreak}</div>
              <div className='sc-streak-lbl'>day adventure streak</div>
              <div className='sc-tag'>PawStreak</div>
            </div>
          </div>
          <button type='button' className='btn-share' onClick={handleShare}>
            📤 Share {state.dogName}&apos;s day
          </button>
          {shareFeedback ? <p className='share-feedback'>{shareFeedback}</p> : null}
        </RewardCard>
        <RewardCard className='commitment-card' delayMs={580}>
          <div className='commit-q'>Same time tomorrow?</div>
          <button
            type='button'
            className={`btn-remind ${state.reminderSet ? 'set' : ''}`}
            onClick={() => {
              if (!state.reminderSet) {
                setReminder(true)
              }
            }}
          >
            {state.reminderSet
              ? `Reminder set — ${state.dogName}'s next surprise is bookmarked.`
              : '🔔 Remind me'}
          </button>
          {state.reminderSet ? (
            <div className='forward-hook'>
              Tomorrow resets the board — <span>{state.dogName}&apos;s day {state.currentStreak + 1}</span> mission drops at midnight.
            </div>
          ) : null}
        </RewardCard>
        <button
          type='button'
          className='btn-done'
          onClick={() => {
            resetRewardFlow()
            navigate('/app')
          }}
        >
          Done — give {state.dogName} a great day tomorrow 🐾
        </button>
      </div>
    </section>
  )
}
