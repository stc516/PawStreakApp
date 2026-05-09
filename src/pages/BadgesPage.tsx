import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { BadgeCard } from '../components/BadgeCard'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import { achievementSummary } from '../lib/gamification'

export function BadgesPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const achievementStats = achievementSummary(state.badges)
  const remaining = achievementStats.total - achievementStats.earned
  const nothingUnlocked = achievementStats.earned === 0

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  return (
    <section
      id='screen-badges'
      className='screen active'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px) + 1rem)' }}
    >
      <div className='screen-hdr'>
        <h1>{state.dogName}&apos;s Finds</h1>
        <p>
          {nothingUnlocked
            ? 'Every adventure surfaces something new — keep going.'
            : `${achievementStats.earned} unlocked · ${remaining} to go`}
        </p>
      </div>
      <div className='badges-grid'>
        {state.badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            icon={badge.icon}
            name={badge.name}
            description={badge.description}
            unlocked={badge.unlocked}
            mystery={badge.mystery}
          />
        ))}
      </div>
      <div className='px-6'>
        <LegalFooter />
      </div>
      <BottomNav />
    </section>
  )
}
