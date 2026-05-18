import { useMemo } from 'react'

import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { LevelProgressCard } from '../components/LevelProgressCard'
import { useAppState } from '../hooks/useAppState'
import { getCurrentLevel } from '../utils/xpLevels'

const PATH_NODES = [
  { id: 'first-walk',     name: 'First Walk',      requiredAdventures: 1,  isProgress: false, progressMax: 0  },
  { id: 'sunset-regular', name: 'Sunset Regular',   requiredAdventures: 5,  isProgress: false, progressMax: 0  },
  { id: 'coffee-pup',     name: 'Coffee Pup',       requiredAdventures: 10, isProgress: false, progressMax: 0  },
  { id: 'trail-scout',    name: 'Trail Scout',      requiredAdventures: 20, isProgress: false, progressMax: 0  },
  { id: 'memory-keeper',  name: 'Memory Keeper',    requiredAdventures: 40, isProgress: true,  progressMax: 40 },
  { id: 'local-legend',   name: 'Local Legend',     requiredAdventures: 80, isProgress: false, progressMax: 0  },
]

const C = {
  bg:          '#0A0A0A',
  surface:     '#201f1f',
  surfaceLow:  '#1c1b1b',
  surfaceMin:  '#0e0e0e',
  primary:     '#ffbd7f',
  onSurface:   '#e5e2e1',
  muted:       '#dbc2ad',
  border5:     'rgba(255,255,255,0.05)',
  border10:    'rgba(255,255,255,0.10)',
  outline:     'rgba(85,67,52,0.5)',
}
const FONT = "'Inter', sans-serif"

function PathNodeIcon({ id, color, size = 28 }: { id: string; color: string; size?: number }) {
  const b = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color,
    strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  if (id === 'first-walk') return (
    <svg {...b} fill={color} stroke="none">
      <circle cx="9"  cy="8.5"  r="2.5"/>
      <circle cx="15" cy="8.5"  r="2.5"/>
      <circle cx="6"  cy="13.5" r="2"/>
      <circle cx="18" cy="13.5" r="2"/>
      <path d="M12 14c-3.5 0-5 1.5-5 3.5S8.5 21 12 21s5-1.5 5-3.5S15.5 14 12 14z"/>
    </svg>
  )
  if (id === 'sunset-regular') return (
    <svg {...b}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
  if (id === 'coffee-pup') return (
    <svg {...b}>
      <path d="M18 8h1a4 4 0 010 8h-1"/>
      <path d="M3 8h15v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  )
  if (id === 'trail-scout') return (
    <svg {...b}><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>
  )
  if (id === 'memory-keeper') return (
    <svg {...b}>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
  if (id === 'local-legend') return (
    <svg {...b}>
      <polyline points="14 9 9 4 4 9"/><polyline points="20 20 15 15 20 10"/>
      <line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/>
    </svg>
  )
  return <svg {...b}><circle cx="12" cy="12" r="4"/></svg>
}

export function TheWildPage() {
  const { state } = useAppState()
  const tier = useMemo(() => getCurrentLevel(state.totalAdventureEnergy), [state.totalAdventureEnergy])
  const total = state.totalAdventures

  const circumference = 2 * Math.PI * 33.5

  return (
    <div
      id="screen-wild"
      data-testid="wild-page"
      style={{
        minHeight: '100dvh',
        background: C.bg,
        color: C.onSurface,
        fontFamily: FONT,
        maxWidth: '390px',
        margin: '0 auto',
        paddingBottom: '88px',
        overflowX: 'hidden',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wild-pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        .wild-pulse-ring { animation: wild-pulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
      ` }} />

      {/* Fixed header */}
      <header style={{
        position: 'fixed',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: '390px',
        zIndex: 50,
        background: 'rgba(0,0,0,0.80)',
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
            overflow: 'hidden', border: '2px solid rgba(255,189,127,0.2)', flexShrink: 0,
          }}>
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"
              alt={state.dogName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: C.primary }}>
            {state.dogName}
          </div>
        </div>
        <div style={{ width: '40px', flexShrink: 0 }} aria-hidden />
      </header>

      {/* Scrollable content */}
      <main style={{ padding: '72px 24px 0' }}>

        {/* Page title */}
        <section style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '16px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: C.onSurface, margin: '0 0 8px', lineHeight: '1.2' }}>
            Path
          </h2>
          <p style={{ fontSize: '15px', color: C.muted, margin: 0 }}>
            Every adventure shapes your story.
          </p>
        </section>

        {/* XP / level card */}
        <div
          data-testid="wild-current-card"
          style={{
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(255,149,0,0.10), rgba(255,94,0,0.04))',
            border: '1px solid rgba(255,149,0,0.20)',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(255,149,0,0.15)',
              border: '1px solid rgba(255,149,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', flexShrink: 0,
            }}>
              {tier.current.icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.primary, marginBottom: '2px' }}>
                This chapter
              </div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: C.onSurface }}>
                {state.dogName} · {tier.current.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[
              { value: state.currentStreak,   label: 'Streak' },
              { value: state.totalAdventures, label: 'Adventures' },
              { value: state.totalAdventureEnergy.toLocaleString(), label: 'Warmth', highlight: true },
            ].map((s) => (
              <div key={s.label} style={{
                background: C.surface,
                borderRadius: '10px',
                padding: '10px 6px',
                textAlign: 'center',
                border: `1px solid ${C.border5}`,
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: s.highlight ? C.primary : C.onSurface }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <LevelProgressCard xp={state.totalAdventureEnergy} variant="compact" />
        </div>

        {/* Path nodes */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '64px', marginBottom: '48px' }}>

          {/* Dotted connecting line */}
          <div style={{
            position: 'absolute',
            top: '40px', bottom: '40px',
            width: '2px',
            backgroundImage: 'radial-gradient(circle, rgba(255,149,0,0.6) 1.5px, transparent 1.5px)',
            backgroundSize: '2px 16px',
            opacity: 0.3,
          }} />

          {PATH_NODES.map((node, i) => {
            const completed = total >= node.requiredAdventures
            const isActive = !completed && (i === 0 || total >= PATH_NODES[i - 1].requiredAdventures)
            const locked = !completed && !isActive
            const nodeProgress = node.isProgress ? Math.min(total / node.progressMax, 1) : 0

            return (
              <div
                key={node.id}
                data-testid={`wild-tier-${i + 1}`}
                data-current={isActive ? 'true' : 'false'}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  position: 'relative', zIndex: 1,
                  opacity: locked ? 0.4 : 1,
                }}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <div
                    className="wild-pulse-ring"
                    style={{
                      position: 'absolute',
                      top: '-8px', left: '-8px',
                      width: '80px', height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(255,189,127,0.20)',
                    }}
                  />
                )}

                {/* Node circle */}
                <div style={{
                  position: 'relative',
                  width: '64px', height: '64px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  ...(completed ? {
                    background: 'linear-gradient(180deg, #FFB874 0%, #FF9500 100%)',
                    boxShadow: '0 4px 0 0 #D17A00',
                    filter: 'drop-shadow(0 0 12px rgba(255,149,0,0.6))',
                  } : isActive ? {
                    background: C.surfaceLow,
                    border: `3px solid ${C.primary}`,
                  } : {
                    background: C.surfaceMin,
                    border: '2px solid rgba(85,67,52,0.5)',
                  }),
                }}>
                  <PathNodeIcon
                    id={node.id}
                    color={completed ? '#4b2800' : locked ? C.muted : C.primary}
                    size={28}
                  />
                  {/* SVG progress arc for active progress node */}
                  {isActive && node.isProgress && (
                    <svg
                      style={{ position: 'absolute', inset: '-3px', width: '70px', height: '70px', transform: 'rotate(-90deg)' }}
                      viewBox="0 0 70 70"
                    >
                      <circle
                        cx="35" cy="35" r="33.5"
                        fill="none"
                        stroke={C.primary}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${nodeProgress * circumference} ${circumference}`}
                      />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '12px', fontWeight: '700', margin: '0 0 4px',
                    color: completed ? C.primary : isActive ? C.onSurface : C.muted,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                  }}>
                    {node.name}
                  </p>
                  {isActive && node.isProgress && (
                    <>
                      <div style={{ width: '128px', height: '6px', background: '#353534', borderRadius: '9999px', overflow: 'hidden', margin: '0 auto 4px' }}>
                        <div style={{ height: '100%', width: `${nodeProgress * 100}%`, background: C.primary, borderRadius: '9999px' }} />
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                        {total} / {node.progressMax} adventures
                      </p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </main>

      <div style={{ display: 'none' }} data-testid="wild-coming-soon" aria-hidden />

      <div style={{ marginTop: '8px' }}>
        <LegalFooter />
      </div>

      <BottomNav />
    </div>
  )
}
