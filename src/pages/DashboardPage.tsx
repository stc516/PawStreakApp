import { useEffect, useMemo, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { TonightChapter } from '../components/dashboard/TonightChapter'
import { TomorrowTeaseLine } from '../components/dashboard/TomorrowTeaseLine'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import { displayTitleForEntry, narrativeForEntry } from '../lib/memoryNarrative'
import type { AdventureEntry, DogMood, VibeArchetype } from '../types'

const PLACE_IMAGES: Record<string, string> = {
  salt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  wander: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  pulse: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  wild: 'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
}

const VIBE_CHIPS: { label: string; vibe: VibeArchetype }[] = [
  { label: 'Beach', vibe: 'salt' },
  { label: 'Coffee', vibe: 'pulse' },
  { label: 'Trail', vibe: 'wander' },
  { label: 'Brewery', vibe: 'wild' },
  { label: 'Park', vibe: 'wander' },
  { label: 'Social', vibe: 'wild' },
  { label: 'Sunset', vibe: 'salt' },
  { label: 'City Walk', vibe: 'pulse' },
]

/** Home-only editorial palette — light, warm, lifestyle */
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

function chipForVibe(vibe: VibeArchetype): string {
  return VIBE_CHIPS.find((c) => c.vibe === vibe)?.label ?? 'Beach'
}

function moodEditorialLine(mood: DogMood, name: string): string {
  const lines: Record<DogMood, string> = {
    restless: `${name} has that bright, ready-to-go energy today.`,
    curious: `${name} is in a sniff-everything, follow-the-nose kind of mood.`,
    explorer: `${name} wants a little farther, a little new today.`,
    social: `${name} is feeling people-and-pups social today.`,
    zoomie: `${name} is full of bounce — a joyful, busy day.`,
    chill: `${name} is in a slow-and-cozy mood — gentle is perfect.`,
  }
  return lines[mood] ?? `${name} is ready for a good day together.`
}

function moodShortLabel(mood: DogMood): string {
  const labels: Record<DogMood, string> = {
    restless: 'Restless & ready',
    curious: 'Curious',
    explorer: 'Explorer',
    social: 'Social',
    zoomie: 'Zoomie',
    chill: 'Chill',
  }
  return labels[mood] ?? 'Today'
}

function scrapbookRotation(index: number): string {
  const angles = ['-2deg', '1.5deg', '-1deg', '2deg', '0deg']
  return angles[index % angles.length]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, selectVibe, clearMemoryReturnHighlight } = useAppState()

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
  const heroTitle = gm?.title ?? "Today's outing"
  const heroLocation = gm?.locationHint ?? 'Your neighborhood'

  const featuredMemory = useMemo(() => {
    const withNote = recent.find((a) => a.memoryText?.trim())
    return withNote ?? recent[0] ?? null
  }, [recent])

  const isAfterglow = state.todayAdventureDone

  const memoryReturnEntry = useMemo(() => {
    if (!state.memoryReturnHighlightId) return null
    return (
      state.recentAdventures.find((a) => a.id === state.memoryReturnHighlightId) ??
      state.latestCompletedAdventure
    )
  }, [state.memoryReturnHighlightId, state.recentAdventures, state.latestCompletedAdventure])

  const tonightEntry = useMemo(() => {
    if (!isAfterglow) return null
    return memoryReturnEntry ?? state.latestCompletedAdventure ?? featuredMemory
  }, [isAfterglow, memoryReturnEntry, state.latestCompletedAdventure, featuredMemory])

  const rhythmHeaderLine = useMemo(() => {
    const streak =
      state.currentStreak > 0
        ? `${state.currentStreak} day${state.currentStreak === 1 ? '' : 's'} together`
        : 'First chapter starting'
    return `${streak} · your rhythm`
  }, [state.currentStreak])

  const memories = recent.slice(0, 5).map((a, index) => ({
    id: a.id,
    title: displayTitleForEntry(a, dogDisplayName, state.zipCode ?? ''),
    date: relativeDayLabel(a.completedAt),
    img: PLACE_IMAGES[a.vibe] || PLACE_IMAGES.default,
    rotate: scrapbookRotation(index),
    memorySnippet:
      a.memoryText?.trim() ??
      a.memoryNarrative?.journeyCardSubtitle ??
      narrativeForEntry(a, dogDisplayName, state.zipCode ?? '').journeyCardSubtitle,
  }))

  function openJourneyMemory(entry: AdventureEntry) {
    clearMemoryReturnHighlight()
    navigate(`/story?memory=${encodeURIComponent(entry.id)}`)
  }

  useEffect(() => {
    const memoryId = searchParams.get('memory')
    if (!memoryId) return
    clearMemoryReturnHighlight()
  }, [searchParams, clearMemoryReturnHighlight])

  function handleChipClick(vibe: VibeArchetype) {
    selectVibe(vibe)
  }

  function startAdventure() {
    if (state.todayAdventureDone) return
    navigate('/adventure')
  }

  const cardBase: CSSProperties = {
    background: H.card,
    borderRadius: '20px',
    border: `1px solid ${H.border}`,
    boxShadow: H.shadowSoft,
  }

  return (
    <div
      id="s-home"
      data-testid="dashboard-today-root"
      data-dashboard-mode={isAfterglow ? 'afterglow' : 'anticipation'}
      style={{
        minHeight: '100dvh',
        background: H.page,
        backgroundImage: H.pageWash,
        color: H.ink,
        fontFamily: H.sans,
        maxWidth: '390px',
        margin: '0 auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      <span
        data-testid="dashboard-hero-status"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {dogDisplayName}
      </span>

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250, 247, 242, 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${H.border}`,
          padding: '16px 24px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                position: 'relative',
                flexShrink: 0,
                padding: '3px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${H.sage} 0%, ${H.amber} 100%)`,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"
                alt={dogDisplayName}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #FFFDF9',
                  display: 'block',
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                data-testid="dashboard-app-title"
                style={{
                  fontFamily: H.serif,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: H.ink,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                PawStreak
              </div>
              {!isAfterglow ? (
                <div
                  data-testid="dashboard-streak-summary"
                  style={{ marginTop: '4px', fontSize: '13px', fontWeight: 500, color: H.muted }}
                >
                  {rhythmHeaderLine}
                </div>
              ) : (
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: H.muted, fontStyle: 'italic' }}>
                  Tonight&apos;s chapter is written
                </p>
              )}
            </div>
          </div>
          <AccountStatusChip />
        </div>
      </header>

      <main style={{ padding: '8px 24px 108px' }}>
        <SaveProgressNudge />
        <PostAdventureSavePrompt />

        {isAfterglow ? (
          <section style={{ marginBottom: '20px', paddingTop: '8px' }}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: H.sage,
              }}
            >
              Afterglow
            </p>
            <h1
              style={{
                margin: '0 0 10px',
                fontFamily: H.serif,
                fontSize: '30px',
                fontWeight: 700,
                lineHeight: 1.15,
                color: H.ink,
                letterSpacing: '-0.02em',
              }}
            >
              Tonight&apos;s memory is part of your story now.
            </h1>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.55, color: H.inkSoft }}>
              {moodEditorialLine(state.dogMood, dogDisplayName)}
            </p>
          </section>
        ) : (
          <section style={{ marginBottom: '22px', paddingTop: '8px' }}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: H.sage,
              }}
            >
              {moodShortLabel(state.dogMood)}
            </p>
            <h1
              style={{
                margin: '0 0 10px',
                fontFamily: H.serif,
                fontSize: '30px',
                fontWeight: 700,
                lineHeight: 1.15,
                color: H.ink,
                letterSpacing: '-0.02em',
              }}
            >
              One good outing is waiting.
            </h1>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.55, color: H.inkSoft }}>
              {moodEditorialLine(state.dogMood, dogDisplayName)}
            </p>
          </section>
        )}

        {isAfterglow && tonightEntry ? (
          <TonightChapter
            entry={tonightEntry}
            dogDisplayName={dogDisplayName}
            zipCode={state.zipCode ?? ''}
            onOpenJourney={() => openJourneyMemory(tonightEntry)}
          />
        ) : null}

        {isAfterglow ? <TomorrowTeaseLine text={state.tomorrowTease} subdued /> : null}

        {!isAfterglow ? (
          <>
        <section style={{ marginBottom: '20px' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: H.muted,
            }}
          >
            Today&apos;s outing
          </p>
          <article style={{ ...cardBase, padding: '14px', boxShadow: H.shadow }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '16 / 10',
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
                  background:
                    'linear-gradient(to top, rgba(44, 36, 25, 0.55) 0%, rgba(44, 36, 25, 0.05) 55%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '14px',
                  background: 'rgba(255, 253, 249, 0.92)',
                  backdropFilter: 'blur(6px)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: H.sageDeep,
                  padding: '5px 10px',
                  borderRadius: '999px',
                }}
              >
                {gm?.moodMatchesToday ? 'Feels right today' : 'Suggested for you'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  data-testid="dashboard-gm-title"
                  style={{
                    margin: '0 0 6px',
                    fontFamily: H.serif,
                    fontSize: '22px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: H.ink,
                  }}
                >
                  {heroTitle}
                </h2>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: H.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span aria-hidden>📍</span>
                  {heroLocation}
                </p>
                {gm?.description ? (
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: H.inkSoft }}>
                    {gm.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                data-testid="dashboard-start-adventure-cta"
                onClick={startAdventure}
                style={{
                  flexShrink: 0,
                  background: H.sage,
                  border: 'none',
                  borderRadius: '14px',
                  color: '#FFFDF9',
                  fontFamily: H.sans,
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '14px 20px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(92, 122, 107, 0.28)',
                  whiteSpace: 'nowrap',
                }}
              >
                Let&apos;s go
              </button>
            </div>
          </article>
        </section>

        <section style={{ margin: '0 -24px 20px' }}>
          <p
            style={{
              margin: '0 0 8px',
              padding: '0 24px',
              fontSize: '12px',
              fontWeight: 500,
              color: H.muted,
            }}
          >
            Or try a different mood
          </p>
          <div
            data-testid="dashboard-adventure-chips"
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '2px 24px 4px',
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
                    padding: '7px 14px',
                    borderRadius: '999px',
                    border: `1px solid ${active ? 'transparent' : H.border}`,
                    background: active ? H.sageSoft : 'transparent',
                    color: active ? H.sageDeep : H.muted,
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: H.sans,
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </section>

        <TomorrowTeaseLine text={state.tomorrowTease} />

        {/* Recent memories */}
        {memories.length > 0 ? (
          <section style={{ marginBottom: '28px' }} data-testid="dashboard-recent-memories">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily: H.serif,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: H.ink,
                }}
              >
                Recent memories
              </h2>
              <button
                type="button"
                onClick={() => navigate('/story')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: H.sage,
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: H.sans,
                }}
              >
                See all
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                margin: '0 -24px',
                padding: '8px 24px 12px',
              }}
            >
              {memories.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate('/story')}
                  style={{
                    flexShrink: 0,
                    width: '108px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: H.sans,
                    transform: `rotate(${m.rotate})`,
                  }}
                >
                  <div
                    style={{
                      padding: '6px 6px 10px',
                      background: H.card,
                      borderRadius: '12px',
                      border: `1px solid ${H.border}`,
                      boxShadow: H.shadowSoft,
                    }}
                  >
                    <div
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        marginBottom: '8px',
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
                        fontWeight: 700,
                        color: H.ink,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        margin: '0 0 2px',
                        padding: '0 4px',
                      }}
                    >
                      {m.title}
                    </p>
                    <p style={{ fontSize: '10px', color: H.muted, margin: 0, padding: '0 4px' }}>
                      {m.date}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section
            style={{
              ...cardBase,
              marginBottom: '28px',
              padding: '28px 20px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '15px', color: H.muted, margin: '0 0 16px', lineHeight: 1.55 }}>
              Your scrapbook is waiting for its first walk.
            </p>
            <button
              type="button"
              onClick={startAdventure}
              disabled={state.todayAdventureDone}
              style={{
                background: H.sage,
                border: 'none',
                borderRadius: '999px',
                color: '#FFFDF9',
                fontFamily: H.sans,
                fontSize: '14px',
                fontWeight: 700,
                padding: '14px 28px',
                cursor: state.todayAdventureDone ? 'not-allowed' : 'pointer',
                opacity: state.todayAdventureDone ? 0.65 : 1,
              }}
            >
              Start first walk
            </button>
          </section>
        )}

        {/* 8. Quiet stats row */}
        <section
          data-testid="dashboard-stats-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            marginBottom: '8px',
          }}
        >
          {[
            { value: state.totalAdventures, label: 'Walks', testId: undefined as string | undefined },
            {
              value: state.currentStreak,
              label: 'Streak',
              highlight: true,
              testId: undefined,
            },
            { value: placeHints, label: 'Places', testId: 'dashboard-the-wild-cta' },
          ].map((s) => {
            const content = (
              <>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: s.highlight ? H.sage : H.ink,
                    lineHeight: 1,
                    fontFamily: H.serif,
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: H.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: '6px',
                  }}
                >
                  {s.label}
                </span>
              </>
            )
            const boxStyle: CSSProperties = {
              background: H.card,
              borderRadius: '16px',
              padding: '14px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${H.border}`,
              textAlign: 'center',
            }
            if (s.testId) {
              return (
                <button
                  key={s.label}
                  type="button"
                  data-testid={s.testId}
                  onClick={() => navigate('/wild')}
                  style={{ ...boxStyle, cursor: 'pointer', fontFamily: H.sans }}
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
          </>
        ) : null}

        <div style={{ marginTop: '28px' }}>
          <LegalFooter />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
