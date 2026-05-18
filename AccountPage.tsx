import { useState } from 'react'
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

const PLACE_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80',
  'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=200&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80',
]
const PLACE_NAMES = ['Coronado\nDog Beach', 'Balboa\nPark', 'Mission\nBay']
const SAMPLE_DOG_PHOTO = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '46px',
    background: '#1A2030',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '0 14px',
    fontSize: '14px',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    marginBottom: '8px',
  }

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
    >
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 8px' }}>
        <button type="button" style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer' }}>
          ⚙️
        </button>
      </div>

      {/* ── DOG HERO ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 20px 20px' }}>
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%',
          border: '3px solid #F97316',
          boxShadow: '0 0 24px rgba(249,115,22,0.35)',
          background: '#1A2030', overflow: 'hidden',
          marginBottom: '12px', flexShrink: 0,
        }}>
          <img src={SAMPLE_DOG_PHOTO} alt={dogName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF' }}>{dogName}</div>
          <button type="button" style={{ background: 'none', border: 'none', fontSize: '14px', color: '#9CA3AF', cursor: 'pointer' }}>✏️</button>
        </div>
        <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>Adventure Dog</div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{
        margin: '0 16px 16px', background: '#12171F', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
      }}>
        {([
          { icon: '🔥', value: state.currentStreak, label: 'Day Streak' },
          { icon: '🐾', value: state.totalAdventures, label: 'Adventures' },
          { icon: '📍', value: placeHints, label: 'Places' },
        ] as const).map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{ fontSize: '18px' }}>{s.icon}</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1', marginTop: '3px' }}>{s.value}</span>
            <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── FAVORITE PLACES ── */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>Favorite Places</span>
          <button type="button" style={{ background: 'none', border: 'none', fontSize: '13px', color: '#F97316', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>See all</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {PLACE_NAMES.map((name, i) => (
            <div key={i} style={{ flex: 1, background: '#12171F', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={PLACE_IMAGES[i]} alt={name.replace('\n', ' ')} style={{ width: '100%', height: '60px', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '6px 8px' }}>
                {name.split('\n').map((line, j) => (
                  <div key={j} style={{ fontSize: '11px', color: '#FFFFFF', lineHeight: '1.3' }}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MEMORY STATS ── */}
      <div style={{ margin: '0 16px 16px', background: '#12171F', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '14px', color: '#FFFFFF' }}>Memories Saved</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#F97316' }}>{state.recentAdventures.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <span style={{ fontSize: '14px', color: '#FFFFFF' }}>Photos Captured</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#F97316' }}>0</span>
        </div>
      </div>

      {/* ── ACCOUNT ── */}
      <div style={{ margin: '0 16px 16px', background: '#12171F', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        {isAuthed ? (
          <>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF' }}>Account</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Signed in</div>
              </div>
              <span style={{ color: '#9CA3AF' }}>›</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF' }}>Save &amp; Sync</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Last backup today</div>
              </div>
              <span style={{ color: '#22C55E' }}>✅</span>
            </div>
            <div style={{ padding: '0 16px 14px' }}>
              <button type="button" onClick={handleSignOut} disabled={Boolean(busy)}
                style={{ width: '100%', height: '44px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#9CA3AF', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {busy === 'sign-out' ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </>
        ) : authEnabled ? (
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>Save {dogName}&apos;s story</div>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>Create a free account to keep your streak and memories safe.</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {(['signup', 'signin'] as Mode[]).map((m) => (
                <button key={m} type="button" onClick={() => { setMode(m); clearFeedback() }}
                  style={{ flex: 1, height: '38px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: mode === m ? '#F97316' : 'transparent', color: mode === m ? '#FFFFFF' : '#9CA3AF', border: mode === m ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  {m === 'signup' ? 'Sign up' : 'Sign in'}
                </button>
              ))}
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearFeedback() }} placeholder="Email address" style={inputStyle} />
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); clearFeedback() }} placeholder="Password" style={{ ...inputStyle, marginBottom: '12px' }} />
              {feedback && (
                <div style={{ padding: '10px 12px', borderRadius: '10px', fontSize: '13px', marginBottom: '10px', background: feedback.tone === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(34,197,94,0.1)', color: feedback.tone === 'error' ? '#F87171' : '#22C55E', border: `1px solid ${feedback.tone === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
                  {feedback.message}
                </div>
              )}
              <button type="submit" disabled={Boolean(busy)}
                style={{ width: '100%', height: '48px', background: '#F97316', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: busy ? 0.6 : 1, boxShadow: '0 4px 16px rgba(249,115,22,0.35)', marginBottom: '10px' }}>
                {busy === 'password' ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
            <button type="button" onClick={handleMagicLink} disabled={Boolean(busy)}
              style={{ width: '100%', height: '44px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: busy ? 0.6 : 1 }}>
              {busy === 'magic-link' ? 'Sending…' : '✨ Send magic link instead'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#374151' }}>Connect Supabase to enable accounts.</div>
            <div data-testid="account-auth-not-configured" />
          </div>
        )}
      </div>

      <div style={{ display: 'none' }}><LegalFooter /></div>
      <BottomNav />
    </div>
  )
}
