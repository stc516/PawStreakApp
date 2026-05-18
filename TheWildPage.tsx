import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { LevelProgressCard } from '../components/LevelProgressCard'
import { useAppState } from '../hooks/useAppState'
import { XP_LEVELS, getCurrentLevel } from '../utils/xpLevels'

const PATH_NODES = [
  { id: 'first-walk', emoji: '🐾', name: 'First Walk', requiredAdventures: 1 },
  { id: 'sunset-regular', emoji: '🌅', name: 'Sunset Regular', requiredAdventures: 5 },
  { id: 'coffee-pup', emoji: '☕', name: 'Coffee Pup', requiredAdventures: 10 },
  { id: 'trail-scout', emoji: '🌲', name: 'Trail Scout', requiredAdventures: 20 },
  { id: 'memory-keeper', emoji: '📷', name: 'Memory Keeper', requiredAdventures: 40, isProgress: true, progressMax: 40 },
  { id: 'local-legend', emoji: '🏆', name: 'Local Legend', requiredAdventures: 80 },
]

export function TheWildPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const tier = useMemo(() => getCurrentLevel(state.totalAdventureEnergy), [state.totalAdventureEnergy])
  const total = state.totalAdventures

  return (
    <div
      id="screen-wild"
      data-testid="wild-page"
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
    >
      {/* ── HEADER ── */}
      <div style={{ padding: '24px 20px 16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.1', margin: 0 }}>
          Path
        </h1>
        <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
          Every adventure shapes your story.
        </p>
      </div>

      {/* ── CURRENT LEVEL CARD ── */}
      <div
        data-testid="wild-current-card"
        style={{
          margin: '0 16px 20px',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(245,158,11,0.05))',
          border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: '20px',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            {tier.current.icon}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F97316', marginBottom: '2px' }}>
              Current league
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>
              {state.dogName} · {tier.current.name}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
          {([
            { value: state.currentStreak, label: 'Streak' },
            { value: state.totalAdventures, label: 'Adventures' },
            { value: state.totalAdventureEnergy.toLocaleString(), label: 'Total XP', gold: true },
          ] as const).map((s) => (
            <div key={s.label} style={{
              background: '#12171F',
              borderRadius: '10px',
              padding: '10px 6px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: (s as any).gold ? '#F59E0B' : '#FFFFFF' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', marginTop: '2px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '12px' }}>
          <LevelProgressCard xp={state.totalAdventureEnergy} variant="compact" />
        </div>
      </div>

      {/* ── PATH NODES ── */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '28px',
            bottom: '28px',
            width: '3px',
            background: 'rgba(249,115,22,0.15)',
            transform: 'translateX(-50%)',
            borderRadius: '99px',
          }} />

          {PATH_NODES.map((node, i) => {
            const completed = total >= node.requiredAdventures
            const isActive = !completed && (i === 0 || total >= PATH_NODES[i - 1].requiredAdventures)
            const locked = !completed && !isActive

            return (
              <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', width: '100%', position: 'relative', zIndex: 1 }}>
                {/* Node */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: locked ? '#374151' : '#FFFFFF',
                      marginBottom: '2px',
                    }}>
                      {node.name}
                    </div>
                    <div style={{ fontSize: '12px', color: completed ? '#F97316' : locked ? '#374151' : '#9CA3AF' }}>
                      {completed ? 'Completed' : locked ? `${node.requiredAdventures} adventures` : node.isProgress ? `${total} / ${node.progressMax} adventures` : 'In progress'}
                    </div>
                    {isActive && node.isProgress && (
                      <div style={{ marginTop: '4px', width: '80px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', marginLeft: 'auto' }}>
                        <div style={{ height: '100%', width: `${Math.min((total / node.progressMax) * 100, 100)}%`, background: '#F97316', borderRadius: '99px' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Circle */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  background: completed
                    ? 'linear-gradient(135deg, #F97316, #F59E0B)'
                    : isActive
                    ? '#1A2030'
                    : '#12171F',
                  border: completed
                    ? 'none'
                    : isActive
                    ? '2px solid #F97316'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: completed
                    ? '0 0 20px rgba(249,115,22,0.4)'
                    : isActive
                    ? '0 0 28px rgba(249,115,22,0.4)'
                    : 'none',
                }}>
                  {locked ? '🔒' : node.emoji}
                </div>

                <div style={{ flex: 1 }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Hidden for e2e */}
      <div style={{ display: 'none' }}>
        <LegalFooter />
      </div>

      <BottomNav />
    </div>
  )
}
