import { BadgeCard } from '../components/BadgeCard'
import { BottomNav } from '../components/BottomNav'
import { HeroCard } from '../components/HeroCard'
import { StatCard } from '../components/StatCard'
import { VIBE_CHIPS } from '../data/missions'
import { useAppState } from '../hooks/useAppState'
import type { VibeArchetype } from '../types'

export function StoryPage() {
  const { state } = useAppState()
  const counts = state.recentAdventures.reduce<Record<VibeArchetype, number>>(
    (acc, a) => ({ ...acc, [a.vibe]: (acc[a.vibe] ?? 0) + 1 }),
    { pulse: 0, wander: 0, salt: 0, wild: 0 },
  )

  const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] as [VibeArchetype, number]
  const vibeChip = VIBE_CHIPS.find((c) => c.vibe === favorite[0]) ?? VIBE_CHIPS[0]

  return (
    <section id='screen-story' className='screen active'>
      <div className='story-scroll'>
        <HeroCard radialClassName='sh-radial'>
          <div className='sh-eyebrow'>The story so far</div>
          <div className='sh-headline'>{state.dogName}&apos;s Adventures</div>
          <div className='sh-sub'>
            {state.totalAdventures} missions · {state.totalGroundCovered.toFixed(1)} ground covered · longest streak:{' '}
            {state.longestStreak} days · {state.totalAdventureEnergy} Adventure Energy banked
          </div>
        </HeroCard>

        <div className='story-section'>
          <div className='story-section-title'>{state.dogName}&apos;s numbers</div>
          <div className='story-big-stats'>
            <StatCard variant='big' value={String(state.totalAdventures)} label='Missions lived' />
            <StatCard variant='big' value={state.totalGroundCovered.toFixed(1)} label='Ground covered (story miles)' />
            <StatCard variant='big' value={String(state.currentStreak)} label='Current streak' />
            <StatCard variant='big' value={String(state.longestStreak)} label='Longest streak ever' />
          </div>
        </div>

        <div className='story-section'>
          <div className='story-section-title'>This week</div>
          <div className='story-row-stats'>
            <StatCard variant='row' value={String(state.weekAdventures)} label='Missions logged this week' />
            <StatCard variant='row' value={`${state.weekAdventures * 25}m`} label={`Rhythm with ${state.dogName}`} />
            <StatCard variant='row' value={(state.weekAdventures * 1.5).toFixed(1)} label='Ground this week' />
          </div>
        </div>

        <div className='story-section'>
          <div className='story-section-title'>Favorite vibe lately</div>
          <div className='fav-type-card'>
            <div className='fav-icon'>{vibeChip.icon}</div>
            <div className='fav-info'>
              <div className='fav-label'>Most rolled</div>
              <div className='fav-name'>{vibeChip.name}</div>
              <div className='fav-sub'>
                {favorite[1]} recent pulls · {vibeChip.blurb}
              </div>
            </div>
          </div>
        </div>

        <div className='story-section'>
          <div className='story-section-title'>Recent chapters</div>
          <div className='timeline'>
            <div className='tl-line' />
            {state.recentAdventures.slice(0, 5).map((adventure) => (
              <div key={adventure.id} className='tl-item'>
                <div className='tl-dot' />
                <div className='tl-type'>
                  {adventure.emoji} {adventure.missionTitle}{' '}
                  <span className={`tl-rarity rarity-${adventure.rarity}`}>{adventure.rarity}</span>
                </div>
                <div className='tl-meta'>
                  {new Date(adventure.completedAt).toLocaleDateString()} · {adventure.durationMinutes} min ·{' '}
                  {adventure.groundCovered.toFixed(1)} ground
                  {adventure.locationHint ? <> · {adventure.locationHint}</> : null}
                </div>
                <div className='tl-xp'>
                  {state.dogName} banked +{adventure.adventureEnergy} Adventure Energy
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='story-section' style={{ paddingBottom: '1.5rem' }}>
          <div className='story-section-title'>Moments & badges</div>
          <div className='badges-mini'>
            {state.badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                compact
                icon={badge.icon}
                name={badge.name}
                description={badge.description}
                unlocked={badge.unlocked}
                mystery={badge.mystery}
              />
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </section>
  )
}
