import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  signOut,
} from '../lib/auth'

type Mode = 'signin' | 'signup'

interface FeedbackState {
  tone: 'info' | 'success' | 'error'
  message: string
}

const SAMPLE_DOG_PHOTO = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'

const C = {
  bg:          '#0A0A0A',
  surface:     '#1A1A1A',
  surfaceLow:  '#131313',
  primary:     '#ffbd7f',
  primaryHex:  '#ff9500',
  onSurface:   '#e5e2e1',
  muted:       '#dbc2ad',
  border5:     'rgba(255,255,255,0.05)',
  border8:     'rgba(255,255,255,0.08)',
}
const FONT = "'Inter', sans-serif"

function floatingCard(extra?: CSSProperties): CSSProperties {
  return {
    background: C.surface,
    border: `1px solid ${C.border5}`,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    borderRadius: '16px',
    ...extra,
  }
}

export function AccountPage() {
  const navigate = useNavigate()
  const { state, session, authEnabled } = useAppState()
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'password' | 'magic-link' | 'sign-out' | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const isAuthed = Boolean(session)
  const dogName = state.dogName?.trim() || 'Your dog'
  const placeHints = new Set(
    state.recentAdventures.map((a) => a.locationHint?.trim()).filter(Boolean)
  ).size

  function clearFeedback() { setFeedback(null) }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!email || !password) {
      setFeedback({ tone: 'error', message: 'Email and password are required.' })
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setFeedback({ tone: 'error', message: 'Pick a password with at least 8 characters.' })
      return
    }
    setBusy('password')
    setFeedback(null)
    try {
      const result = mode === 'signup'
        ? await signUpWithPassword(email, password)
        : await signInWithPassword(email, password)
      if (!result.ok) {
        setFeedback({ tone: 'error', message: result.error?.message ?? 'Could not complete that.' })
        return
      }
      setFeedback({
        tone: 'success',
        message: mode === 'signup'
          ? 'Account created. Check your email if confirmation is required.'
          : 'Signed in.',
      })
    } finally {
      setBusy(null)
    }
  }

  async function handleMagicLink() {
    if (busy) return
    if (!email) {
      setFeedback({ tone: 'error', message: 'Enter your email first.' })
      return
    }
    setBusy('magic-link')
    setFeedback(null)
    try {
      const result = await signInWithMagicLink(email)
      if (!result.ok) {
        setFeedback({ tone: 'error', message: result.error?.message ?? 'Could not send link.' })
        return
      }
      setFeedback({ tone: 'success', message: 'Magic link sent — check your email.' })
    } finally {
      setBusy(null)
    }
  }

  async function handleSignOut() {
    if (busy) return
    setBusy('sign-out')
    try { await signOut() } finally { setBusy(null) }
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    height: '48px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${C.border8}`,
    borderRadius: '12px',
    padding: '0 14px',
    fontSize: '15px',
    color: C.onSurface,
    fontFamily: FONT,
    outline: 'none',
    marginBottom: '10px',
    boxSizing: 'border-box',
  }

  return (
    <div
      data-testid="account-page"
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
      {/* Fixed header */}
      <header style={{
        position: 'fixed',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: '390px',
        zIndex: 50,
        background: 'rgba(10,10,10,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            overflow: 'hidden', border: '1px solid rgba(255,189,127,0.3)', flexShrink: 0,
          }}>
            <img src={SAMPLE_DOG_PHOTO} alt={dogName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: C.primary }}>PawStreak</span>
        </div>
        <button
          type="button"
          data-testid="account-back"
          onClick={() => navigate('/app')}
          aria-label="Back to Today"
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={C.primary} strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </header>

      {/* Scrollable content */}
      <main style={{ padding: '72px 24px 0' }}>

        {/* Profile hero section */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', position: 'relative', paddingTop: '24px' }}>
          {/* Radial glow behind avatar */}
          <div style={{
            position: 'absolute', top: '-48px',
            width: '320px', height: '320px',
            background: 'radial-gradient(circle, rgba(255,149,0,0.15) 0%, rgba(10,10,10,0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Avatar */}
          <div style={{ position: 'relative', marginBottom: '20px', zIndex: 1 }}>
            <div style={{
              width: '144px', height: '144px', borderRadius: '50%',
              border: '3px solid #ff9500',
              boxShadow: '0 0 25px rgba(255,149,0,0.3)',
              background: C.surface,
              overflow: 'hidden',
            }}>
              <img
                src={SAMPLE_DOG_PHOTO}
                alt={dogName}
                style={{ width: '100%', height: '110%', objectFit: 'cover', transform: 'scale(1.1)' }}
              />
            </div>
          </div>

          {/* Name + subtitle */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: C.onSurface, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {dogName}
            </h1>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,189,127,0.8)', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>
              Adventure Dog
            </p>
          </div>

          {/* Stats row — 3 separate floating cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%', marginTop: '24px' }}>
            {[
              { emoji: '🔥', value: state.currentStreak,   label: 'Day Streak' },
              { emoji: '🐾', value: state.totalAdventures, label: 'Adventures' },
              { emoji: '📍', value: placeHints,             label: 'Places'     },
            ].map((s) => (
              <div key={s.label} style={floatingCard({
                padding: '16px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                gap: '4px',
              })}>
                <span style={{ fontSize: '22px', marginBottom: '2px' }}>{s.emoji}</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: C.onSurface, lineHeight: '1' }}>{s.value}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <div style={floatingCard({
            padding: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          })}>
            <span style={{ fontSize: '17px', fontWeight: 500, color: C.onSurface }}>Memories saved</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: C.primary }}>{state.recentAdventures.length}</span>
          </div>
        </section>


        {/* Account section */}
        <section style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isAuthed ? (
            <>
              <p style={{ fontSize: '14px', color: C.muted, margin: '0 0 12px', lineHeight: 1.5 }}>
                You&apos;re signed in. {dogName}&apos;s story is saved to your account.
              </p>

              <div style={floatingCard({ padding: '16px' })}>
                <button type="button" onClick={handleSignOut} disabled={Boolean(busy)} style={{
                  width: '100%', height: '48px', background: 'transparent',
                  border: `1px solid ${C.border8}`,
                  borderRadius: '12px', color: C.muted,
                  fontSize: '15px', cursor: 'pointer', fontFamily: FONT,
                }}>
                  {busy === 'sign-out' ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </>
          ) : authEnabled ? (
            <div style={floatingCard({ padding: '20px' })}>
              <div style={{ fontSize: '17px', fontWeight: '700', color: C.onSurface, marginBottom: '4px' }}>
                Save {dogName}&apos;s story
              </div>
              <div style={{ fontSize: '14px', color: C.muted, marginBottom: '20px', lineHeight: '1.5' }}>
                Create a free account to keep your streak and memories safe.
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['signup', 'signin'] as Mode[]).map((m) => (
                  <button key={m} type="button" onClick={() => { setMode(m); clearFeedback() }} style={{
                    flex: 1, height: '40px', borderRadius: '10px',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT,
                    background: mode === m ? 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)' : 'transparent',
                    color: mode === m ? '#FFFFFF' : C.muted,
                    border: mode === m ? 'none' : `1px solid ${C.border8}`,
                  }}>
                    {m === 'signup' ? 'Sign up' : 'Sign in'}
                  </button>
                ))}
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="email"
                  data-testid="account-email-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFeedback() }}
                  placeholder="Email address"
                  style={inputStyle}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFeedback() }}
                  placeholder="Password"
                  style={{ ...inputStyle, marginBottom: '14px' }}
                />
                {feedback && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '12px',
                    background: feedback.tone === 'error' ? 'rgba(248,113,113,0.10)' : 'rgba(34,197,94,0.10)',
                    color: feedback.tone === 'error' ? '#f87171' : '#22c55e',
                    border: `1px solid ${feedback.tone === 'error' ? 'rgba(248,113,113,0.20)' : 'rgba(34,197,94,0.20)'}`,
                  }}>
                    {feedback.message}
                  </div>
                )}
                <button type="submit" data-testid="account-password-submit" disabled={Boolean(busy)} style={{
                  width: '100%', height: '52px',
                  background: 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)',
                  border: 'none', borderRadius: '12px',
                  color: '#FFFFFF', fontSize: '16px', fontWeight: '700',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                  opacity: busy ? 0.6 : 1,
                  boxShadow: '0 4px 16px rgba(255,149,0,0.35)',
                  marginBottom: '10px',
                }}>
                  {busy === 'password' ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              </form>
              <button type="button" data-testid="account-magic-link" onClick={handleMagicLink} disabled={Boolean(busy)} style={{
                width: '100%', height: '48px', background: 'transparent',
                border: `1px solid ${C.border8}`,
                borderRadius: '12px', color: C.muted,
                fontSize: '14px', cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: FONT, opacity: busy ? 0.6 : 1,
              }}>
                {busy === 'magic-link' ? 'Sending…' : '✨ Send magic link instead'}
              </button>
            </div>
          ) : (
            <div
              data-testid="account-auth-not-configured"
              style={floatingCard({ padding: '20px', textAlign: 'center' })}
            >
              <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>
                Connect Supabase to enable accounts.
              </p>
            </div>
          )}
        </section>

      </main>

      <div style={{ display: 'none' }}><LegalFooter /></div>
      <BottomNav />
    </div>
  )
}
