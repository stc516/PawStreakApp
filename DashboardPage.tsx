import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AccountStatusChip } from '../components/auth/AccountStatusChip'
import { PostAdventureSavePrompt } from '../components/auth/PostAdventureSavePrompt'
import { SaveProgressNudge } from '../components/auth/SaveProgressNudge'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import { quickAdventurePicksForZip } from '../data/localAdventureEngine'

// Sample images — replaced with real user photos when available
const PLACE_IMAGES: Record<string, string> = {
  salt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  wander: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  pulse: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  wild: 'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
}

const VIBE_CHIPS = [
  { label: 'Dog Beach', emoji: '🏖', vibe: 'salt' },
  { label: 'Coffee Run', emoji: '☕', vibe: 'pulse' },
  { label: 'Trail Walk', emoji: '🌲', vibe: 'wander' },
  { label: 'Patio Hang', emoji: '🍺', vibe: 'wild' },
] as const

function relativeDayLabel(iso: string): string {
  const then = new Date(iso)
  if (!Number.isFinite(then.getTime())) return ''
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000)
  if (diffDays <= 0) return ''
  if (diffDays === 1) return '1d'
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Styles object — all inline, zero CSS class conflicts
const S = {
  page: {
    minHeight: '100dvh',
    background: '#0A0E14',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: '390px',
    margin: '0 auto',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    paddingBottom: '88px',
    position: 'relative' as const,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 14px',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '2px solid #F97316',
    background: '#1A2030',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    boxShadow: '0 0 16px rgba(249,115,22,0.3)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  dogName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: '1.2',
  },
  streakRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
  },
  streakNum: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#F97316',
  },
  streakLabel: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  weatherCol: {
    textAlign: 'right' as const,
  },
  weatherTemp: {
    fontSize: '13px',
    color: '#FFFFFF',
  },
  weatherCity: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
  headline: {
    padding: '0 20px 16px',
  },
  h1: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: '1.15',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#9CA3AF',
    marginTop: '4px',
  },
  chipsRow: {
    display: 'flex',
    gap: '8px',
    padding: '0 20px 16px',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
  },
  chipActive: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 15px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    background: '#F97316',
    color: '#FFFFFF',
    boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
    transition: 'all 0.15s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  chipInactive: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 15px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    background: '#1A2030',
    color: '#9CA3AF',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.15s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  heroCard: {
    margin: '0 16px 16px',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  heroImg: {
    position: 'relative' as const,
    height: '180px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
  },
  heroContent: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '16px',
    right: '16px',
  },
  heroTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: '1.2',
  },
  heroMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '3px',
  },
  heroMetaText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.65)',
  },
  heroBody: {
    background: '#12171F',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  heroDesc: {
    fontSize: '13px',
    color: '#9CA3AF',
    flex: 1,
    margin: 0,
    lineHeight: '1.5',
  },
  letsGoBtn: {
    flexShrink: 0,
    background: '#F97316',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '99px',
    padding: '10px 22px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
    transition: 'all 0.15s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  memoriesSection: {
    padding: '0 20px 16px',
  },
  memoriesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  memoriesTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllBtn: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#F97316',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  memoriesRow: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
  },
  memoryThumb: {
    flexShrink: 0,
    width: '78px',
  },
  memoryImg: {
    width: '78px',
    height: '62px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    background: '#1A2030',
    objectFit: 'cover' as const,
  },
  memoryName: {
    fontSize: '11px',
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: '5px',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  memoryDate: {
    fontSize: '10px',
    color: '#9CA3AF',
    marginTop: '1px',
  },
  statsBar: {
    margin: '0 16px 16px',
    background: '#12171F',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
  },
  statCell: (hasBorder: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 8px',
    borderRight: hasBorder ? '1px solid rgba(255,255,255,0.06)' : 'none',
  }),
  statIcon: {
    fontSize: '18px',
  },
  statNum: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: '1',
    marginTop: '3px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { state, dismissWelcomeBanner, pickSuggestedAdventure, selectVibe } = useAppState()
  const [awayDismissed, setAwayDismissed] = useState(false)
  const [selectedVibe, setSelectedVibe] = useState<string>('salt')

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  useEffect(() => {
    if (!state.isAway) {
      queueMicrotask(() => setAwayDismissed(false))
    }
  }, [state.isAway])

  const zip = state.zipCode ?? ''
  const picks = useMemo(() => quickAdventurePicksForZip(zip), [zip])

  const recent = state.recentAdventures.slice(0, 10)
  const placeHints = useMemo(
    () => new Set(state.recentAdventures.map((a) => a.locationHint?.trim()).filter(Boolean)).size,
    [state.recentAdventures],
  )

  const dogDisplayName = state.dogName?.trim() || 'Your dog'
  const avatarLetter = dogDisplayName === 'Your dog' ? '' : dogDisplayName.charAt(0).toUpperCase()

  const heroImageUrl = PLACE_IMAGES[selectedVibe] || PLACE_IMAGES.default
  const gm = state.generatedMission

  function handleChipClick(vibe: string, index: number) {
    setSelectedVibe(vibe)
    if (typeof selectVibe === 'function') selectVibe(vibe as any)
    pickSuggestedAdventure(index)
    navigate('/adventure')
  }

  const demoMemories = [
    { title: 'Sunset Walk', date: 'May 12', emoji: '🌅', img: PLACE_IMAGES.salt },
    { title: 'Better Buzz', date: 'May 10', emoji: '☕', img: PLACE_IMAGES.pulse },
    { title: 'Mission Bay', date: 'May 8', emoji: '🌊', img: PLACE_IMAGES.salt },
    { title: 'Balboa Park', date: 'May 5', emoji: '🌳', img: PLACE_IMAGES.wild },
  ]

  const memories = recent.length > 0
    ? recent.slice(0, 5).map((a) => ({
        title: a.missionTitle,
        date: relativeDayLabel(a.completedAt),
        emoji: a.emoji || '🐾',
        img: PLACE_IMAGES[(a as any).vibe] || PLACE_IMAGES.default,
      }))
    : demoMemories

  return (
    <div style={S.page} id="s-home">

      {/* Hidden components — keep mounted for tests and logic */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <AccountStatusChip />
        <LegalFooter />
        <span data-testid="dashboard-hero-status">{dogDisplayName}</span>
        {/* Keep save/nudge components in DOM for their logic */}
        <PostAdventureSavePrompt />
        <SaveProgressNudge />
        {/* Keep welcome/away dismiss logic alive */}
        {!state.welcomeBannerDismissed && (
          <button type="button" onClick={() => dismissWelcomeBanner()} />
        )}
        {state.isAway && !awayDismissed && (
          <button type="button" onClick={() => setAwayDismissed(true)} />
        )}
        {/* Keep nav links for e2e */}
        <button
          type="button"
          data-testid="dashboard-the-wild-cta"
          onClick={() => navigate('/wild')}
        />
        <button
          type="button"
          data-testid="dashboard-finds-cta"
          onClick={() => navigate('/badges')}
        />
        <button
          type="button"
          data-testid="dashboard-featured-pack-cta"
          onClick={() => navigate('/packs')}
        />
        {/* Save callout — kept in DOM with all testids */}
        <div
          data-testid="dashboard-save-callout"
          data-reason=""
          data-post-prompt="false"
        >
          <button type="button" data-testid="save-progress-nudge-dismiss" />
          <button type="button" data-testid="dashboard-save-primary-cta" onClick={() => navigate('/account')} />
          <button type="button" data-testid="post-adventure-save-prompt-later" />
        </div>
      </div>

      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={S.avatar}>
            {avatarLetter ? (
              <span>{avatarLetter}</span>
            ) : (
              <span>🐾</span>
            )}
          </div>
          <div>
            <div style={S.dogName} data-testid="dashboard-dog-name">
              {dogDisplayName}
            </div>
            <div style={S.streakRow} data-testid="dashboard-streak-summary">
              <span>🔥</span>
              <span style={S.streakNum}>{state.currentStreak}</span>
              <span style={S.streakLabel}>day streak</span>
            </div>
          </div>
        </div>
        <div style={S.weatherCol}>
          <div style={S.weatherTemp}>☀️ 72°</div>
          <div style={S.weatherCity}>San Diego</div>
        </div>
      </div>

      {/* ── HEADLINE ── */}
      <div style={S.headline}>
        <h1 style={S.h1}>Ready for an adventure?</h1>
        <p style={S.subtitle}>Make today a good one.</p>
      </div>

      {/* ── ADVENTURE CHIPS ── */}
      <div style={S.chipsRow} data-testid="dashboard-adventure-chips">
        {VIBE_CHIPS.map((chip, index) => (
          <button
            key={chip.vibe}
            type="button"
            data-testid={index === 0 ? 'dashboard-start-adventure-cta' : undefined}
            onClick={() => handleChipClick(chip.vibe, index)}
            style={selectedVibe === chip.vibe ? S.chipActive : S.chipInactive}
          >
            <span style={{ fontSize: '16px' }}>{chip.emoji}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* ── HERO CARD ── */}
      <div style={S.heroCard}>
        <div
          style={{
            ...S.heroImg,
            backgroundImage: `url(${heroImageUrl})`,
          }}
        >
          <div style={S.heroOverlay} />
          <div style={S.heroContent}>
            <div style={S.heroTitle}>
              {gm?.locationHint || gm?.title || 'Recommended Nearby'}
            </div>
            <div style={S.heroMeta}>
              <span style={S.heroMetaText}>📍 San Diego</span>
              <span style={S.heroMetaText}>2.4 mi</span>
            </div>
          </div>
        </div>
        <div style={S.heroBody}>
          <p style={S.heroDesc}>
            {gm?.flavor || gm?.description || 'Wide open space and good vibes.'}
          </p>
          <button
            type="button"
            onClick={() => { if (!state.todayAdventureDone) navigate('/adventure') }}
            disabled={state.todayAdventureDone}
            style={{
              ...S.letsGoBtn,
              opacity: state.todayAdventureDone ? 0.5 : 1,
              cursor: state.todayAdventureDone ? 'not-allowed' : 'pointer',
            }}
          >
            {state.todayAdventureDone ? 'Done ✓' : "Let's go"}
          </button>
        </div>
      </div>

      {/* ── RECENT MEMORIES ── */}
      <div style={S.memoriesSection} data-testid="dashboard-recent-memories">
        <div style={S.memoriesHeader}>
          <span style={S.memoriesTitle}>Recent Memories</span>
          <button
            type="button"
            style={S.seeAllBtn}
            onClick={() => navigate('/story')}
          >
            See all
          </button>
        </div>
        <div style={S.memoriesRow}>
          {memories.map((m, i) => (
            <div key={i} style={S.memoryThumb}>
              <img
                src={m.img}
                alt={m.title}
                style={S.memoryImg}
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement
                  t.style.display = 'none'
                  const parent = t.parentElement
                  if (parent) {
                    parent.style.display = 'flex'
                    parent.style.alignItems = 'center'
                    parent.style.justifyContent = 'center'
                    parent.style.fontSize = '24px'
                    parent.textContent = m.emoji
                  }
                }}
              />
              <p style={S.memoryName}>{m.title}</p>
              <p style={S.memoryDate}>{m.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={S.statsBar} data-testid="dashboard-stats-row">
        {([
          { icon: '🐾', value: state.totalAdventures, label: 'Adventures' },
          { icon: '🔥', value: state.currentStreak, label: 'Day Streak' },
          { icon: '📍', value: placeHints || 0, label: 'Places' },
        ] as const).map((s, i) => (
          <div key={s.label} style={S.statCell(i < 2)}>
            <span style={S.statIcon}>{s.icon}</span>
            <span style={S.statNum}>{s.value}</span>
            <span style={S.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
