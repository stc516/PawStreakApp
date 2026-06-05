import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { useAppState } from '../hooks/useAppState'
import { displayTitleForEntry, narrativeForEntry } from '../lib/memoryNarrative'
import type { AdventureEntry } from '../types'

const PLACE_IMAGES: Record<string, string> = {
  salt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  wander: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  pulse: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  wild: 'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
}

const H = {
  page: '#FAF7F2',
  pageWash: 'linear-gradient(180deg, #FFFDF9 0%, #F5EFE6 48%, #FAF7F2 100%)',
  card: '#FFFFFF',
  cardSoft: '#FFFCF8',
  ink: '#2C2419',
  inkSoft: '#4A4036',
  muted: '#7A6E62',
  sage: '#5C7A6B',
  sageSoft: 'rgba(92, 122, 107, 0.12)',
  sageDeep: '#4A6359',
  terra: '#C67B5C',
  amber: '#D4956A',
  amberSoft: 'rgba(212, 149, 106, 0.18)',
  border: 'rgba(44, 36, 25, 0.08)',
  borderStrong: 'rgba(44, 36, 25, 0.12)',
  shadow: '0 12px 40px rgba(44, 36, 25, 0.06)',
  shadowSoft: '0 4px 20px rgba(44, 36, 25, 0.05)',
  serif: "'Literata', 'Fraunces', Georgia, 'Times New Roman', serif",
  sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
}

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
`

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

function relativeDayLabel(iso: string): string {
  const then = new Date(iso)
  if (!Number.isFinite(then.getTime())) return ''
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function scrapbookRotation(index: number): string {
  const angles = ['-1.2deg', '0.8deg', '-0.6deg', '1deg', '0deg']
  return angles[index % angles.length]
}

function memoryCaption(entry: AdventureEntry, dogName: string, zipCode: string): string {
  const narrative = narrativeForEntry(entry, dogName, zipCode)
  if (entry.memoryText?.trim()) return entry.memoryText.trim()
  if (narrative.reflectionSource !== 'fallback') return narrative.reflection
  return narrative.journeyCardSubtitle || narrative.reflection
}

function MemoryDetailSheet({
  entry,
  dogName,
  zipCode,
  onClose,
}: {
  entry: AdventureEntry
  dogName: string
  zipCode: string
  onClose: () => void
}) {
  const img = PLACE_IMAGES[entry.vibe] || PLACE_IMAGES.default
  const narrative = narrativeForEntry(entry, dogName, zipCode)
  const displayTitle = narrative.emotionalTitle

  async function handleShare() {
    const text = entry.memoryText
      ? `${displayTitle}: "${entry.memoryText}"`
      : `${displayTitle} — ${narrative.sealMetadata}`
    try {
      if (navigator.share) {
        await navigator.share({ title: displayTitle, text })
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
        background: 'rgba(44, 36, 25, 0.35)',
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
          background: H.card,
          borderRadius: '24px 24px 0 0',
          border: `1px solid ${H.border}`,
          boxShadow: H.shadow,
          padding: '0 0 32px',
        }}
      >
        <div style={{ position: 'relative', height: '240px' }}>
          <img
            src={img}
            alt={displayTitle}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(44, 36, 25, 0.45) 0%, transparent 55%)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 252, 248, 0.92)',
              border: `1px solid ${H.border}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={H.ink} strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '22px 24px 0' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: H.sage,
              margin: '0 0 8px',
              fontFamily: H.sans,
            }}
          >
            {formatDateLabel(entry.completedAt)}
          </p>
          <h2
            style={{
              fontFamily: H.serif,
              fontSize: '26px',
              fontWeight: 700,
              color: H.ink,
              margin: '0 0 8px',
              lineHeight: 1.2,
            }}
          >
            {displayTitle}
          </h2>
          {narrative.atmosphere.length > 0 ? (
            <div style={{ margin: '0 0 16px' }}>
              {narrative.atmosphere.map((line) => (
                <p
                  key={line}
                  style={{ fontSize: '14px', color: H.muted, margin: '0 0 4px', fontFamily: H.sans, lineHeight: 1.45 }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}
          <p
            style={{
              fontSize: '16px',
              color: H.inkSoft,
              fontStyle: 'italic',
              lineHeight: 1.55,
              margin: '0 0 12px',
              fontFamily: H.serif,
            }}
          >
            {entry.memoryText?.trim()
              ? `“${entry.memoryText.trim()}”`
              : narrative.reflection}
          </p>
          <p style={{ fontSize: '12px', color: H.muted, margin: '0 0 8px', fontFamily: H.sans }}>
            {narrative.sealMetadata}
          </p>
          {entry.durationMinutes > 0 ? (
            <p style={{ fontSize: '11px', color: H.muted, margin: '0 0 24px', fontFamily: H.sans, opacity: 0.85 }}>
              {entry.durationMinutes} min together
              {entry.adventureEnergy > 0 ? ` · +${entry.adventureEnergy} warmth` : ''}
            </p>
          ) : (
            <div style={{ marginBottom: '24px' }} />
          )}
          <button
            type="button"
            onClick={() => void handleShare()}
            style={{
              width: '100%',
              height: '52px',
              background: H.sage,
              border: 'none',
              borderRadius: '9999px',
              color: '#FFFCF8',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: H.sans,
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { state } = useAppState()
  const [selectedMemory, setSelectedMemory] = useState<AdventureEntry | null>(null)

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  const adventures = state.recentAdventures.slice(0, 20)
  const memoryIdParam = searchParams.get('memory')
  const memoryFromParam = memoryIdParam
    ? adventures.find((a) => a.id === memoryIdParam) ?? null
    : null
  const sheetEntry = selectedMemory ?? memoryFromParam

  function closeMemorySheet() {
    setSelectedMemory(null)
    if (memoryIdParam) {
      const next = new URLSearchParams(searchParams)
      next.delete('memory')
      setSearchParams(next, { replace: true })
    }
  }
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

  const placeCount = useMemo(
    () => new Set(adventures.map((a) => a.locationHint?.trim()).filter(Boolean)).size,
    [adventures],
  )

  const cardBase: CSSProperties = {
    background: H.card,
    borderRadius: '20px',
    border: `1px solid ${H.border}`,
    boxShadow: H.shadowSoft,
  }

  let cardIndex = 0

  return (
    <div
      id="screen-story"
      data-testid="story-page"
      style={{
        minHeight: '100dvh',
        background: H.page,
        backgroundImage: H.pageWash,
        color: H.ink,
        fontFamily: H.sans,
        maxWidth: '390px',
        margin: '0 auto',
        paddingBottom: '88px',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      <header
        style={{
          padding: '28px 24px 20px',
          borderBottom: `1px solid ${H.border}`,
          background: 'rgba(250, 247, 242, 0.92)',
        }}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: H.terra,
          }}
        >
          Life story
        </p>
        <h1
          style={{
            fontFamily: H.serif,
            fontSize: '34px',
            fontWeight: 700,
            color: H.ink,
            margin: '0 0 10px',
            lineHeight: 1.15,
          }}
        >
          This Month With {dogName}
        </h1>
        <p style={{ fontSize: '15px', color: H.inkSoft, margin: 0, lineHeight: 1.5, maxWidth: '320px' }}>
          The chapter you and {dogName} are writing right now — walks, places, and the little moments you&apos;ll want to remember.
        </p>
        {adventures.length > 0 ? (
          <p
            style={{
              margin: '14px 0 0',
              fontSize: '13px',
              color: H.muted,
              fontWeight: 500,
            }}
          >
            {adventures.length} {adventures.length === 1 ? 'memory' : 'memories'}
            {placeCount > 0 ? ` · ${placeCount} ${placeCount === 1 ? 'place' : 'places'}` : ''}
          </p>
        ) : null}
      </header>

      <main style={{ flex: 1, padding: '24px 24px 0', position: 'relative' }}>
        {adventures.length === 0 ? (
          <article
            style={{
              ...cardBase,
              padding: '36px 28px',
              textAlign: 'center',
              background: H.cardSoft,
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: H.sageSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
              aria-hidden
            >
              🐾
            </div>
            <h2
              style={{
                fontFamily: H.serif,
                fontSize: '22px',
                fontWeight: 700,
                color: H.ink,
                margin: '0 0 10px',
              }}
            >
              Your story starts with one walk
            </h2>
            <p style={{ fontSize: '15px', color: H.muted, margin: '0 0 28px', lineHeight: 1.55 }}>
              Every outing becomes a chapter — photos, places, and the feelings you capture along the way.
            </p>
            <button
              type="button"
              onClick={() => navigate('/adventure')}
              style={{
                background: H.sage,
                border: 'none',
                borderRadius: '9999px',
                color: '#FFFCF8',
                fontFamily: H.sans,
                fontSize: '15px',
                fontWeight: 700,
                padding: '14px 32px',
                cursor: 'pointer',
              }}
            >
              Start first walk
            </button>
          </article>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '28px' }}>
            <div
              style={{
                position: 'absolute',
                left: '5px',
                top: '8px',
                bottom: '24px',
                width: '2px',
                background: `linear-gradient(to bottom, ${H.sage} 0%, rgba(92, 122, 107, 0.15) 85%, transparent 100%)`,
                borderRadius: '2px',
              }}
            />

            {grouped.map(([month, entries]) => (
              <section key={month} style={{ marginBottom: '8px' }}>
                <div style={{ position: 'relative', marginBottom: '18px', paddingTop: '4px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '10px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: H.sage,
                      border: `2px solid ${H.page}`,
                      boxShadow: `0 0 0 2px ${H.sageSoft}`,
                      zIndex: 1,
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: H.serif,
                      fontSize: '18px',
                      fontWeight: 600,
                      color: H.inkSoft,
                      margin: 0,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {month}
                  </h2>
                </div>

                {entries.map((a) => {
                  const idx = cardIndex++
                  const rotate = scrapbookRotation(idx)
                  const img = PLACE_IMAGES[a.vibe] || PLACE_IMAGES.default
                  const caption = memoryCaption(a, dogName, state.zipCode ?? '')
                  const cardTitle = displayTitleForEntry(a, dogName, state.zipCode ?? '')
                  const isQuote = Boolean(a.memoryText?.trim())

                  return (
                    <div
                      key={a.id}
                      style={{
                        position: 'relative',
                        marginBottom: '28px',
                        transform: `rotate(${rotate})`,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '28px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: H.amber,
                          opacity: 0.65,
                          zIndex: 1,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedMemory(a)}
                        style={{
                          width: '100%',
                          ...cardBase,
                          padding: 0,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          fontFamily: H.sans,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden' }}>
                          <img
                            src={img}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(to top, rgba(44, 36, 25, 0.35) 0%, transparent 45%)',
                            }}
                          />
                        </div>
                        <div style={{ padding: '16px 18px 18px' }}>
                          <h3
                            style={{
                              fontFamily: H.serif,
                              fontSize: '20px',
                              fontWeight: 700,
                              color: H.ink,
                              margin: '0 0 8px',
                              lineHeight: 1.25,
                            }}
                          >
                            {cardTitle}
                          </h3>
                          <p
                            style={{
                              fontSize: isQuote ? '15px' : '14px',
                              color: isQuote ? H.inkSoft : H.muted,
                              fontStyle: isQuote ? 'italic' : 'normal',
                              lineHeight: 1.5,
                              margin: '0 0 12px',
                              fontFamily: isQuote ? H.serif : H.sans,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {isQuote ? `“${caption}”` : caption}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                              fontSize: '12px',
                              color: H.muted,
                            }}
                          >
                            <span>{relativeDayLabel(a.completedAt)}</span>
                            <span aria-hidden style={{ opacity: 0.5 }}>
                              ·
                            </span>
                            <span>{formatDateLabel(a.completedAt)}</span>
                            {a.locationHint ? (
                              <>
                                <span aria-hidden style={{ opacity: 0.5 }}>
                                  ·
                                </span>
                                <span>{a.locationHint}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })}
              </section>
            ))}
          </div>
        )}
      </main>

      {sheetEntry ? (
        <MemoryDetailSheet
          entry={sheetEntry}
          dogName={dogName}
          zipCode={state.zipCode ?? ''}
          onClose={closeMemorySheet}
        />
      ) : null}

      <BottomNav />
    </div>
  )
}
