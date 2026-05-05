import { BadgeCard } from '../components/BadgeCard'
import { BottomNav } from '../components/BottomNav'
import { useAppState } from '../hooks/useAppState'

export function BadgesPage() {
  const { state } = useAppState()
  const earned = state.badges.filter((badge) => badge.unlocked).length
  const remaining = state.badges.length - earned

  return (
    <section id='screen-badges' className='screen active'>
      <div className='screen-hdr'>
        <h1>{state.dogName}&apos;s Badges</h1>
        <p>
          {earned} earned · {remaining} to discover
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
