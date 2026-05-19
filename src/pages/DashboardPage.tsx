import { useEffect, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { localeFromZip, localeLabel } from '../data/localAdventureEngine'
import { useAppState } from '../hooks/useAppState'
import type { DogMood, VibeArchetype } from '../types'

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
  const heroTitle = gm?.title ?? "Today's outing"
  const heroLocation = gm?.locationHint ?? 'Your neighborhood'

  const locale = localeFromZip(state.zipCode ?? '')
  const localeHuman = localeLabel(locale)

  const featuredMemory = useMemo(() => {
    const withNote = recent.find((a) => a.memoryText?.trim())
    return withNote ?? recent[0] ?? null
  }, [recent])

  const memories = recent.slice(0, 5).map((a, index) => ({
    id: a.id,
    title: a.missionTitle,
    date: relativeDayLabel(a.completedAt),
    img: PLACE_IMAGES[a.vibe] || PLACE_IMAGES.default,
    rotate: scrapbookRotation(index),
    memorySnippet: a.memoryText?.trim(),
  }))

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
                data-testid="dashboard-dog-name"
                style={{
                  fontFamily: H.serif,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: H.ink,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                {dogDisplayName}
              </div>
              <div
                data-testid="dashboard-streak-summary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
              >
                <span style={{ fontSize: '14px' }} aria-hidden>
                  🌿
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: H.muted }}>
                  {state.currentStreak > 0
                    ? `${state.currentStreak} day${state.currentStreak === 1 ? '' : 's'} together`
                    : 'First chapter starting'}
                </span>
              </div>
            </div>
          </div>
          <AccountStatusChip />
        </div>
      </header>

      <main style={{ padding: '8px 24px 108px' }}>
        <SaveProgressNudge />
        <PostAdventureSavePrompt />

        {/* 1. Dog hero */}
        <section style={{ marginBottom: '28px', paddingTop: '8px' }}>
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
              margin: '0 0 12px',
              fontFamily: H.serif,
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1.15,
              color: H.ink,
              letterSpacing: '-0.02em',
            }}
          >
            What kind of day are we having together?
          </h1>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.55, color: H.inkSoft }}>
            {moodEditorialLine(state.dogMood, dogDisplayName)}
          </p>
        </section>

        {/* 4. Subtle streak / progress strip */}
        <section
          style={{
            ...cardBase,
            marginBottom: '24px',
            padding: '14px 16px',
            background: H.cardSoft,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '999px',
              background: H.sageSoft,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, state.todayAdventureDone ? 100 : state.currentStreak > 0 ? 55 : 12)}%`,
                borderRadius: '999px',
                background: `linear-gradient(90deg, ${H.sage} 0%, ${H.amber} 100%)`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: H.muted, whiteSpace: 'nowrap' }}>
            {state.todayAdventureDone ? "Today's walk saved" : 'Your rhythm'}
          </span>
        </section>

        {/* 3. Quick experience chips */}
        <section style={{ margin: '0 -24px 24px' }}>
          <p
            style={{
              margin: '0 0 10px',
              padding: '0 24px',
              fontSize: '13px',
              fontWeight: 600,
              color: H.muted,
            }}
          >
            Quick ideas for today
          </p>
          <div
            data-testid="dashboard-adventure-chips"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '2px 24px 6px',
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
                    padding: '10px 18px',
                    borderRadius: '999px',
                    border: active ? 'none' : `1px solid ${H.borderStrong}`,
                    background: active ? H.sage : H.card,
                    color: active ? '#FFFDF9' : H.inkSoft,
                    fontSize: '14px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    fontFamily: H.sans,
                    boxShadow: active ? '0 4px 14px rgba(92, 122, 107, 0.25)' : H.shadowSoft,
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

        {/* 2. Featured outing card */}
        <section style={{ marginBottom: '24px' }}>
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
                disabled={state.todayAdventureDone}
                style={{
                  flexShrink: 0,
                  background: state.todayAdventureDone ? H.muted : H.sage,
                  border: 'none',
                  borderRadius: '14px',
                  color: '#FFFDF9',
                  fontFamily: H.sans,
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '14px 20px',
                  cursor: state.todayAdventureDone ? 'not-allowed' : 'pointer',
                  opacity: state.todayAdventureDone ? 0.65 : 1,
                  boxShadow: state.todayAdventureDone ? 'none' : '0 6px 20px rgba(92, 122, 107, 0.28)',
                  whiteSpace: 'nowrap',
                }}
              >
                {state.todayAdventureDone ? 'Saved ✓' : "Let's go"}
              </button>
            </div>
          </article>
        </section>

        {/* 5. Featured memory moment */}
        {featuredMemory ? (
          <section style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: H.muted }}>
              A moment worth keeping
            </p>
            <article
              style={{
                ...cardBase,
                padding: '18px 18px 16px',
                background: `linear-gradient(145deg, #FFFCF8 0%, ${H.amberSoft} 100%)`,
                border: `1px solid rgba(198, 123, 92, 0.15)`,
                position: 'relative',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  fontSize: '28px',
                  opacity: 0.35,
                  fontFamily: H.serif,
                }}
              >
                “
              </div>
              {featuredMemory.memoryText?.trim() ? (
                <p
                  style={{
                    margin: '0 0 12px',
                    fontFamily: H.serif,
                    fontSize: '18px',
                    fontStyle: 'italic',
                    lineHeight: 1.45,
                    color: H.ink,
                  }}
                >
                  {featuredMemory.memoryText.trim()}
                </p>
              ) : (
                <p style={{ margin: '0 0 12px', fontSize: '15px', lineHeight: 1.5, color: H.inkSoft }}>
                  {featuredMemory.missionTitle}
                  {featuredMemory.locationHint ? ` · ${featuredMemory.locationHint}` : ''}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: H.terra }}>
                  {relativeDayLabel(featuredMemory.completedAt)}
                </span>
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
                    padding: 0,
                  }}
                >
                  Open Journey →
                </button>
              </div>
            </article>
          </section>
        ) : null}

        {/* 6. Tomorrow / local tease */}
        <section style={{ marginBottom: '28px' }}>
          <article
            style={{
              ...cardBase,
              padding: '16px 18px',
              background: H.card,
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: H.sageSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
              aria-hidden
            >
              🌤
            </div>
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: H.sage,
                }}
              >
                Tomorrow &amp; nearby
              </p>
              <p style={{ margin: '0 0 6px', fontSize: '15px', lineHeight: 1.45, color: H.ink }}>
                {state.tomorrowTease}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: H.muted }}>
                {state.zipCode
                  ? `Rooted in your ${localeHuman} — walks that feel local to you.`
                  : 'Add your ZIP in Profile to tune local outings.'}
              </p>
            </div>
          </article>
        </section>

        {/* 7. Recent memories */}
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

        <div style={{ marginTop: '28px' }}>
          <LegalFooter />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
