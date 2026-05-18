import { useEffect, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import type { VibeArchetype } from '../types'

const PLACE_IMAGES: Record<string, string> = {
  salt:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  wander:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  pulse:   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  wild:    'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
}

const VIBE_CHIPS: { label: string; vibe: VibeArchetype }[] = [
  { label: 'Beach',     vibe: 'salt'   },
  { label: 'Coffee',    vibe: 'pulse'  },
  { label: 'Trail',     vibe: 'wander' },
  { label: 'Brewery',   vibe: 'wild'   },
  { label: 'Park',      vibe: 'wander' },
  { label: 'Social',    vibe: 'wild'   },
  { label: 'Sunset',    vibe: 'salt'   },
  { label: 'City Walk', vibe: 'pulse'  },
]

function relativeDayLabel(iso: string): string {
  const then = new Date(iso)
  if (!Number.isFinite(then.getTime())) return ''
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return '1d'
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const C = {
  bg:          '#0A0A0A',
  surface:     '#201f1f',
  primary:     '#ffbd7f',
  onSurface:   '#e5e2e1',
  muted:       '#dbc2ad',
  border5:     'rgba(255,255,255,0.05)',
  border10:    'rgba(255,255,255,0.10)',
}
const FONT = "'Inter', sans-serif"

function chipForVibe(vibe: VibeArchetype): string {
  return VIBE_CHIPS.find((c) => c.vibe === vibe)?.label ?? 'Beach'
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { state, selectVibe } = useAppState()
  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  const selectedChip = chipForVibe(state.selectedVibe)

  const recent = state.recentAdventures.slice(0, 10)
  const placeHints = useMemo(
    () => new Set(state.recentAdventures.map((a) => a.locationHint?.trim()).filter(Boolean)).size,
    [state.recentAdventures],
  )

  const dogDisplayName = state.dogName?.trim() || 'Your dog'
  const gm = state.generatedMission
  const heroImageUrl = PLACE_IMAGES[state.selectedVibe] || PLACE_IMAGES.default
  const heroTitle = gm?.title ?? "Today's adventure"
  const heroLocation = gm?.locationHint ?? 'Your neighborhood'

  const memories = recent.slice(0, 5).map((a) => ({
    id: a.id,
    title: a.missionTitle,
    date: relativeDayLabel(a.completedAt),
    img: PLACE_IMAGES[a.vibe] || PLACE_IMAGES.default,
  }))

  function handleChipClick(vibe: VibeArchetype) {
    selectVibe(vibe)
  }

  function startAdventure() {
    if (state.todayAdventureDone) return
    navigate('/adventure')
  }

  return (
    <div
      id="s-home"
      style={{
        minHeight: '100dvh',
        background: C.bg,
        color: C.onSurface,
        fontFamily: FONT,
        maxWidth: '390px',
        margin: '0 auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <span
        data-testid="dashboard-hero-status"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {dogDisplayName}
      </span>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '390px',
          zIndex: 50,
          background: 'rgba(10,10,10,0.80)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: '-3px',
                borderRadius: '50%',
                border: '2px solid rgba(255,189,127,0.4)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `1px solid ${C.border10}`,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"
                alt={dogDisplayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          <div>
            <h2 style={{ margin: 0 }}>
              <span
                data-testid="dashboard-dog-name"
                style={{
                  color: C.onSurface,
                  fontWeight: '700',
                  fontSize: '18px',
                  lineHeight: '1.2',
                  fontFamily: FONT,
                }}
              >
                {dogDisplayName}
              </span>
            </h2>
            <div
              data-testid="dashboard-streak-summary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={C.primary} aria-hidden>
                <path d="M12 2c0 0-5.5 5.5-5.5 11a5.5 5.5 0 0011 0C17.5 7.5 12 2 12 2z" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: '500', color: C.muted }}>
                {state.currentStreak} day streak
              </span>
            </div>
          </div>
        </div>
        <AccountStatusChip />
      </header>

      <main style={{ padding: '88px 24px 100px' }}>
        <SaveProgressNudge />
        <PostAdventureSavePrompt />

        <section style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1.2', color: C.onSurface, margin: 0 }}>
            Ready for an adventure?
          </h1>
        </section>

        <section style={{ margin: '0 -24px 24px' }}>
          <div
            data-testid="dashboard-adventure-chips"
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '4px 24px 8px',
            }}
          >
            {VIBE_CHIPS.map((chip) => {
              const active = selectedChip === chip.label
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.vibe)}
                  style={{
                    flexShrink: 0,
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    background: active
                      ? 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)'
                      : '#201f1f',
                    color: active ? '#FFFFFF' : C.muted,
                    fontSize: '14px',
                    fontWeight: active ? '700' : '500',
                    cursor: 'pointer',
                    fontFamily: FONT,
                    boxShadow: active ? '0 0 15px rgba(255,149,0,0.25)' : 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <div
            style={{
              background: '#201f1f',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '16/10',
                marginBottom: '16px',
              }}
            >
              <img
                src={heroImageUrl}
                alt={heroTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                }}
              />
              <div style={{ position: 'absolute', bottom: '12px', left: '16px' }}>
                <span
                  style={{
                    background: 'rgba(255,149,0,0.9)',
                    backdropFilter: 'blur(4px)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    letterSpacing: '0.12em',
                    color: '#FFFFFF',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {gm?.moodMatchesToday ? 'Perfect for today' : 'Recommended'}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 8px 8px',
              }}
            >
              <div style={{ flex: 1, marginRight: '16px' }}>
                <h3
                  data-testid="dashboard-gm-title"
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: C.onSurface,
                    margin: '0 0 4px',
                    lineHeight: '1.2',
                  }}
                >
                  {heroTitle}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={C.muted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ fontSize: '13px', color: C.muted }}>{heroLocation}</span>
                </div>
                {gm?.description ? (
                  <p style={{ fontSize: '13px', color: C.muted, margin: '8px 0 0', lineHeight: '1.4' }}>
                    {gm.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                data-testid="dashboard-start-adventure-cta"
                onClick={startAdventure}
                disabled={state.todayAdventureDone}
                style={{
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontFamily: FONT,
                  fontSize: '15px',
                  fontWeight: '700',
                  padding: '12px 24px',
                  cursor: state.todayAdventureDone ? 'not-allowed' : 'pointer',
                  opacity: state.todayAdventureDone ? 0.55 : 1,
                  boxShadow: '0 4px 20px rgba(255,149,0,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {state.todayAdventureDone ? 'Done ✓' : "Let's go"}
              </button>
            </div>
          </div>
        </section>

        {memories.length > 0 ? (
          <section style={{ marginBottom: '24px' }} data-testid="dashboard-recent-memories">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: C.onSurface, margin: 0 }}>
                Recent Memories
              </h2>
              <button
                type="button"
                onClick={() => navigate('/story')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.primary,
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: FONT,
                }}
              >
                See all
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                margin: '0 -24px',
                padding: '0 24px',
              }}
            >
              {memories.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate('/story')}
                  style={{
                    flexShrink: 0,
                    width: '96px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: FONT,
                  }}
                >
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `1px solid ${C.border5}`,
                      marginBottom: '8px',
                      background: C.surface,
                    }}
                  >
                    <img
                      src={m.img}
                      alt={m.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      margin: '0 0 2px',
                    }}
                  >
                    {m.title}
                  </p>
                  <p style={{ fontSize: '10px', color: C.muted, margin: 0 }}>{m.date}</p>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section style={{ marginBottom: '24px', textAlign: 'center', padding: '24px 16px' }}>
            <p style={{ fontSize: '15px', color: C.muted, margin: '0 0 16px', lineHeight: '1.5' }}>
              Start your first walk to capture the moments that matter most.
            </p>
            <button
              type="button"
              onClick={startAdventure}
              disabled={state.todayAdventureDone}
              style={{
                background: 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)',
                border: 'none',
                borderRadius: '9999px',
                color: '#FFFFFF',
                fontFamily: FONT,
                fontSize: '14px',
                fontWeight: '700',
                padding: '14px 28px',
                cursor: state.todayAdventureDone ? 'not-allowed' : 'pointer',
                opacity: state.todayAdventureDone ? 0.55 : 1,
              }}
            >
              Start first walk
            </button>
          </section>
        )}

        <section
          data-testid="dashboard-stats-row"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}
        >
          {[
            { value: state.totalAdventures, label: 'Adventures', testId: undefined as string | undefined },
            { value: state.currentStreak, label: 'Day Streak', highlight: true, testId: undefined },
            { value: placeHints, label: 'Places', testId: 'dashboard-the-wild-cta' },
          ].map((s) => {
            const content = (
              <>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1' }}>
                  {s.value}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: s.highlight ? C.primary : C.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: '4px',
                  }}
                >
                  {s.label}
                </span>
              </>
            )
            const boxStyle: CSSProperties = {
              background: 'rgba(32,31,31,0.5)',
              borderRadius: '16px',
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }
            if (s.testId) {
              return (
                <button
                  key={s.label}
                  type="button"
                  data-testid={s.testId}
                  onClick={() => navigate('/wild')}
                  style={{ ...boxStyle, cursor: 'pointer', fontFamily: FONT }}
                >
                  {content}
                </button>
              )
            }
            return (
              <div key={s.label} style={boxStyle}>
                {content}
              </div>
            )
          })}
        </section>

        <div style={{ marginTop: '32px' }}>
          <LegalFooter />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
