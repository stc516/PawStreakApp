import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { BadgeCard } from '../components/BadgeCard'
import { BottomNav } from '../components/BottomNav'
import { HeroCard } from '../components/HeroCard'
import { MascotBadge } from '../components/mascot/MascotBadge'
import { VIBE_CHIPS } from '../data/missions'
import { useAppState } from '../hooks/useAppState'
import { buildPlaceIdentity } from '../lib/placeIdentity'
import type { VibeArchetype } from '../types'

export function StoryPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const counts = state.recentAdventures.reduce<Record<VibeArchetype, number>>(
    (acc, a) => ({ ...acc, [a.vibe]: (acc[a.vibe] ?? 0) + 1 }),
    { pulse: 0, wander: 0, salt: 0, wild: 0 },
  )

  const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] as [VibeArchetype, number]
  const vibeChip = VIBE_CHIPS.find((c) => c.vibe === favorite[0]) ?? VIBE_CHIPS[0]
  const place = buildPlaceIdentity(state)
  const knownPlaces = new Set(
    state.recentAdventures.map((entry) => entry.locationHint?.trim()).filter((value): value is string => Boolean(value)),
  )
  const rememberedMoments = state.recentAdventures.filter((entry) => entry.memoryText).length

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  return (
    <section
      id='screen-story'
      className='screen active'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px))' }}
    >
      <div className='story-scroll'>
        <HeroCard radialClassName='sh-radial'>
          <div className='sh-eyebrow'>Memory atlas</div>
          <div className='sh-headline'>{state.dogName}&apos;s Known World</div>
          <div className='sh-sub'>
            {place.worldName} · {knownPlaces.size} remembered places · {rememberedMoments} written memories
          </div>
        </HeroCard>

        <div className='story-section'>
          <div className='story-section-title'>Atlas feeling</div>
          <div className='fav-type-card'>
            <div className='fav-icon'>🗺️</div>
            <div className='fav-info'>
              <div className='fav-label'>Where {state.dogName} is becoming local</div>
              <div className='fav-name'>{place.worldName}</div>
              <div className='fav-sub'>{place.atmosphere}</div>
            </div>
          </div>
        </div>

        <div className='story-section'>
          <div className='story-section-title'>Places that matter</div>
          <div className='story-big-stats'>
            <div className='sbs-card'>
              <div className='sbs-val'>{knownPlaces.size}</div>
              <div className='sbs-lbl'>{place.atlasNoun} known</div>
            </div>
            <div className='sbs-card'>
              <div className='sbs-val'>{state.totalAdventures}</div>
              <div className='sbs-lbl'>days made memorable</div>
            </div>
          </div>
          <div className='mt-3 rounded-2xl bg-[var(--bg-card)] p-4 text-[13px] leading-relaxed text-[var(--text-2)]'>
            The numbers are quiet here: day {state.currentStreak} of showing up, {state.totalGroundCovered.toFixed(1)} story miles,
            longest ritual {state.longestStreak} days.
          </div>
        </div>

        <div className='story-section'>
          <div className='story-section-title'>Dog identity lately</div>
          <div className='fav-type-card'>
            <div className='fav-icon'>{vibeChip.icon}</div>
            <div className='fav-info'>
              <div className='fav-label'>Most repeated atmosphere</div>
              <div className='fav-name'>{vibeChip.name}</div>
              <div className='fav-sub'>
                {favorite[1]} recent memories · {vibeChip.blurb}
              </div>
            </div>
          </div>
        </div>

        <div className='story-section'>
          <div className='story-section-title'>Recent atlas entries</div>
          {state.recentAdventures.length > 0 ? (
            <div className='timeline'>
              <div className='tl-line' />
              {state.recentAdventures.slice(0, 5).map((adventure) => (
                <div key={adventure.id} className='tl-item'>
                  <div className='tl-dot' />
                  <div className='tl-type'>
                    {adventure.emoji} {adventure.missionTitle}{' '}
                    {adventure.locationHint ? (
                      <span className='text-[var(--text-2)]'>near {adventure.locationHint}</span>
                    ) : null}
                  </div>
                  <div className='tl-meta'>
                    {new Date(adventure.completedAt).toLocaleDateString()} · {adventure.durationMinutes} min together
                  </div>
                  <div className='tl-xp'>
                    {adventure.memoryText
                      ? `“${adventure.memoryText}”`
                      : adventure.missionDescription || `${state.dogName} learned this place a little better.`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-[color:var(--border-md)] bg-[var(--bg-card)] p-5 text-center'>
              <div className='flex justify-center'>
                <MascotBadge mascot='meiomi' size='md' />
              </div>
              <div className='mt-3 font-[family-name:var(--fd),Fraunces,serif] text-[18px] font-semibold italic text-[var(--text)]'>
                {state.dogName}&apos;s story starts today.
              </div>
              <div className='mt-1 text-[13px] leading-relaxed text-[var(--text-2)]'>
                The first adventure becomes the first place on the atlas.
              </div>
            </div>
          )}
        </div>

        <div className='story-section' style={{ paddingBottom: '1.5rem' }}>
          <div className='story-section-title'>Quiet finds</div>
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
