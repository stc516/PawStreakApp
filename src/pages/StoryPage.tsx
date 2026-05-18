import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { useAppState } from '../hooks/useAppState'
import type { AdventureEntry } from '../types'

const PLACE_IMAGES: Record<string, string> = {
  salt:    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  wander:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  pulse:   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  wild:    'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
}

const C = {
  bg:          '#0A0A0A',
  surface:     '#201f1f',
  primary:     '#ffbd7f',
  tertiary:    '#ffbe68',
  secondary:   '#ffb599',
  onSurface:   '#e5e2e1',
  muted:       '#dbc2ad',
  border5:     'rgba(255,255,255,0.05)',
}
const FONT = "'Inter', sans-serif"

function categoryColor(cat: string): string {
  const c = cat.toLowerCase()
  if (c.includes('coffee') || c.includes('cafe') || c.includes('pulse')) return C.tertiary
  if (c.includes('trail') || c.includes('walk') || c.includes('hike') || c.includes('wander')) return C.secondary
  return C.primary
}

function CategoryIcon({ category, color, size = 18 }: { category: string; color: string; size?: number }) {
  const b = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color,
    strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  const c = category.toLowerCase()
  if (c.includes('beach') || c.includes('salt') || c.includes('ocean')) return (
    <svg {...b}>
      <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>
      <path d="M2 18c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>
    </svg>
  )
  if (c.includes('coffee') || c.includes('cafe') || c.includes('pulse')) return (
    <svg {...b}>
      <path d="M18 8h1a4 4 0 010 8h-1"/>
      <path d="M3 8h15v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/>
    </svg>
  )
  if (c.includes('trail') || c.includes('walk') || c.includes('hike') || c.includes('wander')) return (
    <svg {...b}><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <circle cx="9" cy="8.5" r="2.5"/>
      <circle cx="15" cy="8.5" r="2.5"/>
      <circle cx="6" cy="13.5" r="2"/>
      <circle cx="18" cy="13.5" r="2"/>
      <path d="M12 14c-3.5 0-5 1.5-5 3.5S8.5 21 12 21s5-1.5 5-3.5S15.5 14 12 14z"/>
    </svg>
  )
}

function formatMonthLabel(iso: string): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function MemoryDetailSheet({
  entry,
  dogName,
  onClose,
}: {
  entry: AdventureEntry
  dogName: string
  onClose: () => void
}) {
  const img = PLACE_IMAGES[entry.vibe] || PLACE_IMAGES.default
  const color = categoryColor(entry.missionTitle)

  async function handleShare() {
    const text = entry.memoryText
      ? `${dogName} at ${entry.missionTitle}: "${entry.memoryText}"`
      : `${dogName} — ${entry.missionTitle}`
    try {
      if (navigator.share) {
        await navigator.share({ title: entry.missionTitle, text })
        return
      }
      await navigator.clipboard.writeText(text)
    } catch {
      /* cancelled */
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Memory detail"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '390px',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: C.surface,
          borderRadius: '24px 24px 0 0',
          border: `1px solid ${C.border5}`,
          padding: '0 0 32px',
        }}
      >
        <div style={{ position: 'relative', height: '220px' }}>
          <img
            src={img}
            alt={entry.missionTitle}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
          }} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: '16px', left: '16px',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px 24px 0' }}>
          <p style={{
            fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: C.primary, margin: '0 0 8px',
          }}>
            {formatDateLabel(entry.completedAt)}
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: C.onSurface, margin: '0 0 8px', lineHeight: '1.2' }}>
            {entry.missionTitle}
          </h2>
          {entry.locationHint ? (
            <p style={{ fontSize: '14px', color: C.muted, margin: '0 0 16px' }}>{entry.locationHint}</p>
          ) : null}
          {entry.memoryText ? (
            <p style={{
              fontSize: '15px', color: C.onSurface, fontStyle: 'italic', lineHeight: '1.5',
              margin: '0 0 20px', padding: '16px',
              background: 'rgba(255,149,0,0.06)', borderRadius: '12px',
              border: '1px solid rgba(255,149,0,0.15)',
            }}>
              &ldquo;{entry.memoryText}&rdquo;
            </p>
          ) : (
            <p style={{ fontSize: '14px', color: C.muted, margin: '0 0 20px', lineHeight: '1.5' }}>
              A moment from {dogName}&apos;s day — saved in your journey.
            </p>
          )}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '8px',
            background: `${color}20`, border: `1px solid ${color}30`,
            fontSize: '12px', fontWeight: '700', color, marginBottom: '24px',
          }}>
            +{entry.adventureEnergy} warmth
          </div>
          <button
            type="button"
            onClick={() => void handleShare()}
            style={{
              width: '100%', height: '52px',
              background: 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)',
              border: 'none', borderRadius: '9999px',
              color: '#FFFFFF', fontSize: '16px', fontWeight: '700',
              cursor: 'pointer', fontFamily: FONT,
            }}
          >
            Share this memory
          </button>
        </div>
      </div>
    </div>
  )
}

export function StoryPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const [selectedMemory, setSelectedMemory] = useState<AdventureEntry | null>(null)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  const adventures = state.recentAdventures.slice(0, 20)
  const dogName = state.dogName?.trim() || 'Your dog'

  const grouped = useMemo(() => {
    const map = new Map<string, AdventureEntry[]>()
    for (const a of adventures) {
      const key = formatMonthLabel(a.completedAt)
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(a)
      map.set(key, list)
    }
    return Array.from(map.entries())
  }, [adventures])

  return (
    <div
      id="screen-story"
      data-testid="story-page"
      style={{
        minHeight: '100dvh',
        background: C.bg,
        color: C.onSurface,
        fontFamily: FONT,
        maxWidth: '390px',
        margin: '0 auto',
        paddingBottom: '88px',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ padding: '32px 24px 16px', background: C.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80"
            alt={dogName}
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff9500' }}
          />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: C.onSurface, margin: 0, lineHeight: '1.2' }}>
            Journey
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: C.muted, margin: 0 }}>
          {dogName}&apos;s life, one memory at a time.
        </p>
      </header>

      <main style={{ flex: 1, padding: '0 24px', position: 'relative' }}>
        {adventures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden>🐾</div>
            <p style={{ fontSize: '16px', color: C.muted, margin: '0 0 24px', lineHeight: '1.5' }}>
              Start your first walk to capture the moments that matter most.
            </p>
            <button
              type="button"
              onClick={() => navigate('/adventure')}
              style={{
                background: 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)',
                border: 'none', borderRadius: '9999px',
                color: '#FFFFFF', fontFamily: FONT,
                fontSize: '15px', fontWeight: '700',
                padding: '14px 28px',
                cursor: 'pointer',
              }}
            >
              Start first walk
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '40px' }}>
            <div style={{
              position: 'absolute', left: '8px', top: 0, bottom: 0,
              width: '2px',
              background: 'linear-gradient(to bottom, #ff9500 0%, transparent 100%)',
              opacity: 0.2,
            }} />

            {grouped.map(([month, entries]) => (
              <div key={month}>
                <div style={{ position: 'relative', marginBottom: '16px', paddingTop: '8px' }}>
                  <div style={{
                    position: 'absolute', left: '-34px', top: '14px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#ff9500', boxShadow: '0 0 10px rgba(255,149,0,0.5)', zIndex: 1,
                  }} />
                  <h2 style={{
                    fontSize: '12px', fontWeight: '600', color: C.muted,
                    textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7, margin: 0,
                  }}>
                    {month}
                  </h2>
                </div>

                {entries.map((a) => {
                  const color = categoryColor(a.missionTitle)
                  const hasPhoto = Boolean(PLACE_IMAGES[a.vibe])
                  return (
                    <div key={a.id} style={{ position: 'relative', marginBottom: '24px' }}>
                      <div style={{
                        position: 'absolute', left: '-36px', top: '50%', transform: 'translateY(-50%)',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: 'rgba(255,149,0,0.4)', zIndex: 1,
                      }} />
                      <button
                        type="button"
                        onClick={() => setSelectedMemory(a)}
                        style={{
                          width: '100%',
                          background: 'rgba(28,28,30,0.6)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontFamily: FONT,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: hasPhoto ? '16px' : '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <CategoryIcon category={a.missionTitle} color={color} size={18} />
                            <h3 style={{
                              fontSize: '17px', fontWeight: '600', color: C.onSurface, margin: 0,
                              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            }}>
                              {a.missionTitle}
                            </h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: C.muted }}>{formatDateLabel(a.completedAt)}</span>
                            {a.locationHint ? (
                              <>
                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(85,67,52,0.8)' }} />
                                <span style={{ fontSize: '12px', color: C.muted }}>{a.locationHint}</span>
                              </>
                            ) : null}
                          </div>
                          <div style={{
                            marginTop: '8px', display: 'inline-flex', alignItems: 'center',
                            padding: '2px 8px', background: `${color}20`,
                            border: `1px solid ${color}30`, borderRadius: '6px',
                            fontSize: '11px', fontWeight: '700', color,
                          }}>
                            +{a.adventureEnergy} warmth
                          </div>
                        </div>
                        {hasPhoto ? (
                          <img
                            src={PLACE_IMAGES[a.vibe]}
                            alt=""
                            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%',
                            background: '#201f1f', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CategoryIcon category={a.missionTitle} color="rgba(219,194,173,0.4)" size={22} />
                          </div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedMemory ? (
        <MemoryDetailSheet
          entry={selectedMemory}
          dogName={dogName}
          onClose={() => setSelectedMemory(null)}
        />
      ) : null}

      <BottomNav />
    </div>
  )
}
