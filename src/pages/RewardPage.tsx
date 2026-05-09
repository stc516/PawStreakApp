import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ProgressBar } from '../components/ProgressBar'
import { RewardCard } from '../components/RewardCard'
import { bondArcProgress, identityArc } from '../data/missions'
import { useAppState } from '../hooks/useAppState'

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

  const shareCopy = `${state.dogName} just protected a ${state.currentStreak}-day adventure streak 🐾🔥
Trying not to let ${state.dogName === 'Your dog' ? 'them' : state.dogName} down tomorrow. #PawStreak`

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
        <div className='rew-mission-complete'>Mission completed</div>
        <div className='rew-won'>{state.dogName} won the day</div>
        <div className='rew-headline'>
          <em>{state.dogName}</em> completed <strong>{latest?.missionTitle ?? state.generatedMission.title}</strong>
        </div>
        <div className='rew-subline'>
          Day {state.currentStreak} — streak protected · {identity.tagline}
        </div>
      </div>
      <div className='rew-body'>
        <RewardCard className='xp-pop' delayMs={150}>
          <div className='xp-num'>+{latest?.adventureEnergy ?? 0}</div>
          <div className='xp-lbl'>Adventure XP earned</div>
        </RewardCard>
        <RewardCard className='streak-protected' delayMs={250}>
          <div className='sp-icon'>🔥</div>
          <div>
            <div className='sp-text'>
              Streak protected — <strong>{state.currentStreak}</strong> days and counting.
            </div>
            <div className='sp-sub'>
              {bond.remaining > 0
                ? `Bond Arc: ${bond.remaining} more mission${bond.remaining === 1 ? '' : 's'} until the badge seals`
                : 'Bond Arc: sealed — your duo levelled up'}
            </div>
          </div>
        </RewardCard>
        <RewardCard className='streak-protected' delayMs={300}>
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
        <RewardCard className='next-ms' delayMs={340}>
          <div className='nm-label'>Tomorrow&apos;s tease</div>
          <div className='nm-text'>{state.tomorrowTease}</div>
        </RewardCard>
        {unlockedBadge ? (
          <RewardCard className='badge-unlock' delayMs={380}>
            <div className='bu-icon'>{unlockedBadge.icon}</div>
            <div className='bu-info'>
              <div className='bu-title'>{unlockedBadge.name}</div>
              <div className='bu-desc'>{unlockedBadge.description}</div>
            </div>
            <div className='bu-new'>New!</div>
          </RewardCard>
        ) : null}
        <RewardCard className='next-ms' delayMs={420}>
          <div className='nm-label'>Dog identity progress</div>
          <ProgressBar value={Math.min(state.currentStreak, bond.target)} max={bond.target} className='nm-prog' />
          <div className='nm-text'>
            You&apos;re <span>{identity.title}</span> — next chapter loads after tomorrow&apos;s surprise mission.
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
            📤 Share {state.dogName}&apos;s streak
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
          Done — see you tomorrow 🐾
        </button>
      </div>
    </section>
  )
}
