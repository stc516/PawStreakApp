import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { BadgeCard } from '../components/BadgeCard'
import { BottomNav } from '../components/BottomNav'
import { useAppState } from '../hooks/useAppState'
import { achievementSummary } from '../lib/gamification'

export function BadgesPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const achievementStats = achievementSummary(state.badges)
  const remaining = achievementStats.total - achievementStats.earned

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  return (
    <section id='screen-badges' className='screen active'>
      <div className='screen-hdr'>
        <h1>{state.dogName}&apos;s Achievements</h1>
        <p>
          {achievementStats.earned} unlocked · {remaining} to go
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
      <BottomNav />
    </section>
  )
}
