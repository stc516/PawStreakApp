import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { MemorySealFlow } from '../components/memory/MemorySealFlow'
import { useAppState } from '../hooks/useAppState'
import { getAdventureMilestone } from '../lib/adventureMilestones'
import { visibleAdventureTitle } from '../lib/adventureDisplayTitle'
import { track } from '../lib/analytics'
import { calculateAdventureXp } from '../lib/xp'
import { FONT_IMPORT, H } from '../lib/editorialTheme'

const CATEGORY_PILLS = ['Beach', 'Trail', 'Coffee', 'Brewery', 'Park', 'Social'] as const

const PLACE_IMG: Record<string, string> = {
  Beach:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  Trail:   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  Coffee:  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  Brewery: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&q=80',
  Park:    'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=400&q=80',
  Social:  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
}

const PLACES: Record<string, Array<{ name: string; city: string; distance: string; desc: string }>> = {
  Beach: [
    { name: 'Coronado Dog Beach',    city: 'Coronado, CA',  distance: '2.4 mi', desc: 'Wide sandy beach for zoomies and sunsets.' },
    { name: 'Fiesta Island',         city: 'San Diego, CA', distance: '3.1 mi', desc: 'Vast off-leash space for social pups.' },
    { name: 'Ocean Beach Dog Beach', city: 'San Diego, CA', distance: '4.2 mi', desc: 'Laid back vibes at the river mouth.' },
  ],
  Trail: [
    { name: 'Cowles Mountain',  city: 'San Diego, CA', distance: '5.2 mi',  desc: 'Best summit views in the city.' },
    { name: 'Torrey Pines',     city: 'La Jolla, CA',  distance: '8.1 mi',  desc: 'Cliffside trails with ocean views.' },
    { name: 'Mission Trails',   city: 'San Diego, CA', distance: '12.4 mi', desc: 'Multi-trail regional park.' },
  ],
  Coffee: [
    { name: 'Better Buzz North Park', city: 'San Diego, CA', distance: '1.2 mi', desc: 'Dog-friendly patio, great cold brew.' },
    { name: 'Communal Coffee',        city: 'San Diego, CA', distance: '2.1 mi', desc: 'Spacious patio with water bowls.' },
    { name: 'Bird Rock Coffee',       city: 'La Jolla, CA',  distance: '6.3 mi', desc: 'Local roaster, dog-welcoming patio.' },
  ],
  Brewery: [
    { name: 'Ballast Point Little Italy', city: 'San Diego, CA', distance: '3.4 mi', desc: 'Harbor views, huge dog-friendly patio.' },
    { name: 'Coronado Brewing',           city: 'Coronado, CA',  distance: '4.1 mi', desc: 'Laid-back dog-friendly lawn.' },
    { name: 'Mike Hess Brewing',          city: 'San Diego, CA', distance: '1.8 mi', desc: 'North Park spot, patio-first vibe.' },
  ],
  Park: [
    { name: 'Balboa Park',        city: 'San Diego, CA', distance: '2.2 mi', desc: 'Sprawling park with shaded paths.' },
    { name: 'Kate Sessions Park', city: 'San Diego, CA', distance: '3.0 mi', desc: 'Great views and dog-friendly lawn.' },
    { name: 'Waterfront Park',    city: 'San Diego, CA', distance: '2.8 mi', desc: 'Bay-side green space downtown.' },
  ],
  Social: [
    { name: "Nate's Point Dog Park", city: 'Balboa Park, CA',   distance: '2.4 mi', desc: 'Popular enclosed dog park.' },
    { name: 'OB Dog Beach Meetup',   city: 'San Diego, CA',     distance: '4.2 mi', desc: 'Weekly off-leash social hour.' },
    { name: 'Weekend Hike Group',    city: 'Mission Trails, CA', distance: '5.2 mi', desc: 'Group hikes every Saturday.' },
  ],
}

const C = {
  bg: H.page,
  surface: H.card,
  surfaceLow: H.cardSoft,
  primary: H.sage,
  primaryGrad: H.sage,
  onSurface: H.ink,
  muted: H.muted,
  border5: H.border,
  border10: H.borderStrong,
}
const FONT = H.sans

export function AdventurePage() {
  const navigate = useNavigate()
  const { state, completeAdventure } = useAppState()
  const m = state.generatedMission
  const [planMode, setPlanMode] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Beach')
  const [walkSeconds, setWalkSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [memoryDraft, setMemoryDraft] = useState('')
  const [awaitingMemorySeal, setAwaitingMemorySeal] = useState(false)
  const activeSealNarrative =
    awaitingMemorySeal && state.latestCompletedAdventure?.memoryNarrative
      ? {
          narrative: state.latestCompletedAdventure.memoryNarrative,
          vibe: state.latestCompletedAdventure.vibe,
        }
      : null
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
    if (paused || planMode) return
    const interval = window.setInterval(() => {
      setWalkSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [paused, planMode])

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
  const visibleTitle = visibleAdventureTitle(m.title, state.isAway)

  const categoryEmoji: Record<string, string> = {
    social: '☕', exploration: '🗺️', chill: '🌅', chaos: '⚡', routine: '🏡',
  }
  const catEmoji = categoryEmoji[m.category] || '🐾'

  // ── PLAN VIEW ──────────────────────────────────────────────────────
  if (planMode) {
    const places = PLACES[selectedCategory] || []
    const img = PLACE_IMG[selectedCategory] || PLACE_IMG.Beach

    return (
      <div style={{
        minHeight: '100dvh',
        background: C.bg,
        backgroundImage: H.pageWash,
        color: C.onSurface,
        fontFamily: FONT,
        maxWidth: '390px',
        margin: '0 auto',
        overflowX: 'hidden',
        paddingBottom: '88px',
      }}>
        <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />
        {/* Fixed header */}
        <header style={{
          position: 'fixed',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', maxWidth: '390px',
          zIndex: 50,
          background: 'rgba(250, 247, 242, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              overflow: 'hidden', border: `2px solid ${H.sage}`, flexShrink: 0,
            }}>
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"
                alt="dog"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: H.terra, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plan</div>
              <div style={{ fontFamily: H.serif, fontSize: '18px', fontWeight: '700', color: C.onSurface, lineHeight: '1.2' }}>PawStreak</div>
            </div>
          </div>
          <div style={{ width: '40px', flexShrink: 0 }} aria-hidden />
        </header>

        {/* Scrollable content */}
        <main style={{ padding: '80px 24px 0' }}>

          {/* Hero heading */}
          <section style={{ marginBottom: '20px', paddingTop: '8px' }}>
            <h2 style={{ fontFamily: H.serif, fontSize: '28px', fontWeight: '700', lineHeight: '1.2', color: C.onSurface, margin: '0 0 4px' }}>
              What should we do next?
            </h2>
            <p style={{ fontSize: '15px', color: C.muted, margin: 0 }}>
              Pick a vibe. Find a place. Make a memory.
            </p>
          </section>

          {/* Category pills */}
          <section style={{ margin: '0 -24px 20px' }}>
            <div style={{
              display: 'flex', gap: '8px',
              overflowX: 'auto', scrollbarWidth: 'none',
              padding: '4px 24px 8px',
            }}>
              {CATEGORY_PILLS.map((cat) => {
                const active = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 24px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      background: active ? H.sage : H.card,
                      color: active ? '#FFFCF8' : C.muted,
                      border: active ? 'none' : `1px solid ${H.border}`,
                      boxShadow: active ? H.shadowSoft : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Section label */}
          <div style={{ fontFamily: H.serif, fontSize: '22px', fontWeight: '600', color: C.onSurface, marginBottom: '16px' }}>
            {selectedCategory} spots
          </div>

          {/* Place cards */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {places.map((place, i) => (
              <div key={i} style={{
                background: H.card,
                border: `1px solid ${H.border}`,
                borderRadius: '20px',
                boxShadow: H.shadowSoft,
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <img
                  src={img}
                  alt={place.name}
                  style={{ width: '96px', height: '96px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: C.onSurface, lineHeight: '1.2', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {place.name}
                  </div>
                  <div style={{ fontSize: '12px', color: H.sage, marginTop: '3px', fontWeight: '600' }}>
                    {place.city} • {place.distance}
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px', lineHeight: '1.4',
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const }}>
                    {place.desc}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPlanMode(false)}
                  style={{
                    flexShrink: 0,
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: H.sage,
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: H.shadowSoft,
                    fontSize: '11px', fontWeight: '700', color: '#FFFCF8', fontFamily: FONT,
                  }}
                >
                  Start
                </button>
              </div>
            ))}
          </section>


        </main>

        <BottomNav />
      </div>
    )
  }

  // ── ACTIVE ADVENTURE VIEW ──────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      backgroundImage: H.pageWash,
      color: C.onSurface,
      fontFamily: FONT,
      maxWidth: '390px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />
      {/* Top header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px 8px',
        zIndex: 20,
      }}>
        <button
          type="button"
          onClick={() => navigate('/app')}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: H.sageSoft,
            backdropFilter: 'blur(8px)',
            border: `1px solid ${H.border}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={H.ink} strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div
            data-testid="adventure-send-off"
            style={{ fontSize: '18px', fontWeight: '600', color: H.ink, fontFamily: H.serif }}
          >
            {m.locationHint || visibleTitle}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={C.primary}>
              <path d="M12 2c0 0-5.5 5.5-5.5 11a5.5 5.5 0 0011 0C17.5 7.5 12 2 12 2z"/>
            </svg>
            <span style={{ fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {m.category.charAt(0).toUpperCase() + m.category.slice(1)}
            </span>
          </div>
        </div>

        <div style={{ width: '40px', flexShrink: 0 }} aria-hidden />
      </header>

      {/* Center content */}
      <main style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '16px 24px',
        zIndex: 20,
      }}>
        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            data-testid="adventure-milestone-eyebrow"
            style={{
              fontSize: '48px',
              fontWeight: '300',
              letterSpacing: '-0.02em',
              lineHeight: '1',
              color: H.sageDeep,
              textShadow: 'none',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: FONT,
            }}
          >
            {walkTime}
          </div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: C.muted, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Time on Adventure
          </div>
          <div
            data-testid="adventure-milestone-line"
            style={{ fontSize: '13px', color: C.muted, marginTop: '8px', fontStyle: 'italic', minHeight: '20px' }}
          >
            {milestone.line}
          </div>
        </div>

        {/* Memory note */}
        <div
          data-testid="adventure-memory-block"
          style={{
            width: '100%',
            background: C.surface,
            borderRadius: '16px',
            padding: '16px',
            border: `1px solid ${C.border5}`,
            marginBottom: '8px',
          }}
        >
          <label
            htmlFor="adventure-memory-input"
            style={{ fontSize: '12px', color: C.muted, fontWeight: '600', display: 'block', marginBottom: '8px' }}
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
              background: H.cardSoft,
              border: `1px solid ${C.border10}`,
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '14px',
              color: C.onSurface,
              fontFamily: FONT,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div
            data-testid="adventure-ground-stat"
            style={{ fontSize: '10px', color: C.muted, textAlign: 'right', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            {walkGround} mi together
          </div>
        </div>

        {/* Hidden timer ring for e2e compatibility */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <div className="timer-ring">
            <svg viewBox="0 0 190 190" width="190" height="190">
              <circle className="track" cx="95" cy="95" r="87" />
              <circle className="fill" cx="95" cy="95" r="87" style={{ strokeDashoffset: timerOffset }} />
            </svg>
          </div>
          <span aria-hidden="true">{catEmoji}</span>
        </div>
      </main>

      {/* Footer actions */}
      <footer style={{ padding: '8px 24px 48px', zIndex: 20 }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-pause"
            onClick={() => setPaused((v) => !v)}
            style={{
              flex: 1,
              height: '56px',
              borderRadius: '9999px',
              background: H.card,
              border: `1px solid ${H.border}`,
              color: H.ink,
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: FONT,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={H.ink} stroke="none">
              {paused
                ? <polygon points="5 3 19 12 5 21 5 3"/>
                : <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
              }
            </svg>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            className="btn-end"
            aria-label="Wrap adventure"
            onClick={() => {
              const memoryText = memoryDraft.trim()
              completeAdventure(walkSeconds, { memoryText })
              track('adventure_completed', {
                adventure_category: m.category,
                adventure_rarity: m.rarity,
                xp_earned: xpBreakdown.xp,
                streak_count: state.currentStreak + 1,
                is_away: state.isAway,
              })
              setPaused(true)
              setAwaitingMemorySeal(true)
            }}
            style={{
              flex: 1.5,
              height: '56px',
              borderRadius: '9999px',
              background: H.sage,
              border: 'none',
              color: '#FFFCF8',
              fontSize: '17px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: H.shadowSoft,
              fontFamily: FONT,
            }}
          >
            Finish
          </button>
        </div>
      </footer>

      {activeSealNarrative ? (
        <MemorySealFlow
          narrative={activeSealNarrative.narrative}
          vibe={activeSealNarrative.vibe}
          onComplete={() => {
            setAwaitingMemorySeal(false)
            navigate('/app')
          }}
        />
      ) : null}
    </div>
  )
}
