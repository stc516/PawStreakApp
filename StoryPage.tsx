import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { useAppState } from '../hooks/useAppState'

const PLACE_IMAGES: Record<string, string> = {
  salt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  wander: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  pulse: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  wild: 'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
}

const DEMO_MEMORIES = [
  { title: 'Coronado Dog Beach', date: 'May 12, 2025', category: 'Dog Beach', xp: 120, vibe: 'salt', emoji: '🌊' },
  { title: 'Better Buzz', date: 'May 10, 2025', category: 'Coffee Run', xp: 80, vibe: 'pulse', emoji: '☕' },
  { title: 'Mission Bay Walk', date: 'May 8, 2025', category: 'Trail Walk', xp: 100, vibe: 'wander', emoji: '🌳' },
]

export function StoryPage() {
  const navigate = useNavigate()
  const { state } = useAppState()

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  const adventures = state.recentAdventures.length > 0
    ? state.recentAdventures.slice(0, 10).map((a) => ({
        title: a.missionTitle,
        date: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: a.missionTitle,
        xp: 80,
        vibe: (a as any).vibe || 'default',
        emoji: a.emoji || '🐾',
      }))
    : DEMO_MEMORIES

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0A0E14',
        color: '#FFFFFF',
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: '390px',
        margin: '0 auto',
        paddingBottom: '88px',
        overflowX: 'hidden',
      }}
      id="screen-story"
    >
      {/* ── HEADER ── */}
      <div style={{ padding: '24px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.1', margin: 0 }}>
            Journey
          </h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
            {state.dogName}&apos;s life, one memory at a time.
          </p>
        </div>
        <button
          type="button"
          style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
        >
          🗓
        </button>
      </div>

      {/* ── TIMELINE ── */}
      <div style={{ padding: '0 20px' }}>
        {/* Date group */}
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#9CA3AF', marginBottom: '12px', letterSpacing: '0.04em' }}>
          May 2025
        </div>

        {/* Timeline items */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: '4px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'linear-gradient(to bottom, #F97316, rgba(249,115,22,0.1))',
          }} />

          {adventures.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
              {/* Timeline dot */}
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#F97316',
                boxShadow: '0 0 8px rgba(249,115,22,0.5)',
                flexShrink: 0,
                marginTop: '8px',
                zIndex: 1,
              }} />

              {/* Memory card */}
              <div style={{
                flex: 1,
                background: '#12171F',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {/* Photo */}
                <div style={{
                  height: '160px',
                  position: 'relative',
                  backgroundImage: `url(${PLACE_IMAGES[a.vibe] || PLACE_IMAGES.default})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  background: PLACE_IMAGES[a.vibe] ? undefined : 'linear-gradient(135deg, #1A2030, #0A1420)',
                }}>
                  <img
                    src={PLACE_IMAGES[a.vibe] || PLACE_IMAGES.default}
                    alt={a.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                  }} />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    ···
                  </button>
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    fontSize: '17px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}>
                    {a.title}
                  </div>
                </div>

                {/* Card body */}
                <div style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    📅 {a.date}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {a.emoji} {a.category}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#F97316', fontWeight: '600' }}>
                    +{a.xp} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {adventures.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#374151',
            fontSize: '14px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐾</div>
            <p>Your first adventure will appear here.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
