import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LegalFooter } from '../components/legal/LegalFooter'
import { MascotBadge } from '../components/mascot/MascotBadge'
import { useAppState } from '../hooks/useAppState'
import {
  signInWithMagicLink,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '../lib/auth'

type Mode = 'signin' | 'signup'

interface FeedbackState {
  tone: 'info' | 'success' | 'error'
  message: string
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

  function clearFeedback() {
    setFeedback(null)
  }

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
      const result =
        mode === 'signup'
          ? await signUpWithPassword(email, password)
          : await signInWithPassword(email, password)
      if (!result.ok) {
        setFeedback({ tone: 'error', message: result.error?.message ?? 'Could not complete that.' })
        return
      }
      setFeedback({
        tone: 'success',
        message:
          mode === 'signup'
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
      setFeedback({
        tone: 'success',
        message: 'Check your email for a one-tap sign-in link.',
      })
    } finally {
      setBusy(null)
    }
  }

  async function handleSignOut() {
    if (busy) return
    setBusy('sign-out')
    setFeedback(null)
    try {
      const result = await signOut()
      if (!result.ok) {
        setFeedback({ tone: 'error', message: result.error?.message ?? 'Could not sign out.' })
      } else {
        setFeedback({ tone: 'info', message: 'Signed out. Your local progress stays on this device.' })
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <section
      data-testid='account-page'
      className='screen active flex flex-col bg-[var(--bg)] px-5 pt-8'
      style={{ paddingBottom: 'calc(2rem + var(--safe-bot, 0px))' }}
    >
      <header className='mx-auto flex w-full max-w-[480px] items-center justify-between'>
        <button
          type='button'
          data-testid='account-back'
          onClick={() => navigate('/app')}
          className='text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text)]'
        >
          ← Back
        </button>
        <span className='text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--text-2)]'>
          PawStreak
        </span>
      </header>

      <div className='mx-auto mt-8 flex w-full max-w-[480px] flex-col gap-6'>
        <div className='flex items-start gap-3'>
          <MascotBadge mascot='duo' size='md' />
          <div>
            <div className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]'>
              {isAuthed ? 'Account' : 'Save progress'}
            </div>
            <h1 className='mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[26px] font-semibold italic leading-tight text-[var(--text)]'>
              {isAuthed
                ? `${state.dogName}\u2019s story is saved.`
                : `Keep ${state.dogName}\u2019s story forever.`}
            </h1>
            <p className='mt-1 text-[13px] leading-relaxed text-[var(--text-2)]'>
              {isAuthed
                ? 'Your streak, packs, and adventures sync across every device you sign in on.'
                : 'Sign up in seconds. Free forever, no credit card. Your dog\u2019s adventures follow you anywhere.'}
            </p>
          </div>
        </div>

        {!authEnabled ? (
          <div
            data-testid='account-auth-not-configured'
            className='rounded-2xl border border-dashed border-[color:var(--border-md)] bg-[var(--bg-card)] p-4 text-[13px] leading-relaxed text-[var(--text-2)]'
          >
            <div className='text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]'>
              Coming soon in this build
            </div>
            <p className='mt-2'>
              Account sync isn&apos;t turned on yet for this version of PawStreak. Until it is,
              {' '}
              <strong>{state.dogName}</strong>&apos;s progress lives safely on this device.
            </p>
            <p className='mt-2 text-[12px] text-[var(--text-3)]'>
              You&apos;ll be able to come back here as soon as it&apos;s wired up — no need to do
              anything.
            </p>
          </div>
        ) : null}

        {isAuthed ? (
          <SignedInPanel
            email={session?.user?.email ?? null}
            busy={busy === 'sign-out'}
            onSignOut={handleSignOut}
            onClearFeedback={clearFeedback}
          />
        ) : (
          <AuthForms
            mode={mode}
            email={email}
            password={password}
            busy={busy}
            authEnabled={authEnabled}
            onModeChange={(next) => {
              setMode(next)
              clearFeedback()
            }}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handlePasswordSubmit}
            onMagicLink={handleMagicLink}
          />
        )}

        {feedback ? (
          <p
            data-testid='account-feedback'
            data-tone={feedback.tone}
            role='status'
            aria-live='polite'
            className={[
              'rounded-xl border px-3 py-2 text-[12px] leading-snug',
              feedback.tone === 'error'
                ? 'border-[color:rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.08)] text-[color:var(--red)]'
                : feedback.tone === 'success'
                  ? 'border-[color:rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.08)] text-[color:var(--green)]'
                  : 'border-[color:var(--border-md)] bg-[var(--bg-card)] text-[var(--text-2)]',
            ].join(' ')}
          >
            {feedback.message}
          </p>
        ) : null}

        <p className='text-center text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]'>
          By continuing you agree to our{' '}
          <a href='/terms' className='underline-offset-2 hover:underline'>
            Terms
          </a>{' '}
          &amp;{' '}
          <a href='/privacy' className='underline-offset-2 hover:underline'>
            Privacy
          </a>
          .
        </p>

        <LegalFooter withBottomNavSpacing={false} />
      </div>
    </section>
  )
}

interface AuthFormsProps {
  mode: Mode
  email: string
  password: string
  busy: 'password' | 'magic-link' | 'sign-out' | null
  authEnabled: boolean
  onModeChange: (mode: Mode) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
  onMagicLink: () => void
}

function AuthForms({
  mode,
  email,
  password,
  busy,
  authEnabled,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onMagicLink,
}: AuthFormsProps) {
  const inputsDisabled = !authEnabled || busy !== null
  return (
    <div className='flex flex-col gap-4'>
      <div
        role='tablist'
        aria-label='Account mode'
        className='inline-flex w-full overflow-hidden rounded-full border border-[color:var(--border-md)] bg-[var(--bg-card)] p-0.5 text-[12px] font-semibold'
      >
        <button
          type='button'
          role='tab'
          data-testid='account-mode-signup'
          aria-selected={mode === 'signup'}
          onClick={() => onModeChange('signup')}
          className={[
            'flex-1 rounded-full px-3 py-2 transition-colors',
            mode === 'signup'
              ? 'bg-[var(--orange)] text-[var(--bg)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)]',
          ].join(' ')}
        >
          Create account
        </button>
        <button
          type='button'
          role='tab'
          data-testid='account-mode-signin'
          aria-selected={mode === 'signin'}
          onClick={() => onModeChange('signin')}
          className={[
            'flex-1 rounded-full px-3 py-2 transition-colors',
            mode === 'signin'
              ? 'bg-[var(--orange)] text-[var(--bg)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)]',
          ].join(' ')}
        >
          Sign in
        </button>
      </div>

      <form
        data-testid='account-password-form'
        onSubmit={onSubmit}
        className='flex flex-col gap-3'
        noValidate
      >
        <label className='block'>
          <span className='block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-3)]'>
            Email
          </span>
          <input
            data-testid='account-email-input'
            type='email'
            autoComplete='email'
            inputMode='email'
            className='inp mt-1.5'
            placeholder='you@example.com'
            value={email}
            disabled={inputsDisabled}
            onChange={(event) => onEmailChange(event.target.value.trim())}
          />
        </label>
        <label className='block'>
          <span className='block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-3)]'>
            Password
          </span>
          <input
            data-testid='account-password-input'
            type='password'
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className='inp mt-1.5'
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
            value={password}
            disabled={inputsDisabled}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
        <button
          type='submit'
          data-testid='account-password-submit'
          disabled={inputsDisabled}
          className='btn-primary mt-1 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {busy === 'password'
            ? 'Working\u2026'
            : mode === 'signup'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <div className='flex w-full items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--text-3)]'>
        <span className='h-px flex-1 bg-[color:var(--border-md)]' />
        <span>or</span>
        <span className='h-px flex-1 bg-[color:var(--border-md)]' />
      </div>

      <button
        type='button'
        data-testid='account-magic-link'
        disabled={inputsDisabled}
        onClick={onMagicLink}
        className='flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border-md)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[color:rgba(255,255,255,0.04)] disabled:cursor-not-allowed disabled:opacity-60'
      >
        <span aria-hidden>✉️</span>
        {busy === 'magic-link' ? 'Sending link\u2026' : 'Send me a sign-in link'}
      </button>

      <button
        type='button'
        data-testid='account-google'
        disabled
        title='Google sign-in coming soon'
        className='flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border-md)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-2)] opacity-70'
      >
        <span aria-hidden>G</span>
        Continue with Google · coming soon
      </button>
    </div>
  )
}

interface SignedInPanelProps {
  email: string | null
  busy: boolean
  onSignOut: () => void
  onClearFeedback: () => void
}

function SignedInPanel({ email, busy, onSignOut, onClearFeedback }: SignedInPanelProps) {
  return (
    <div className='flex flex-col gap-3' data-testid='account-signed-in-panel'>
      <div className='rounded-2xl border border-[color:rgba(52,211,153,0.32)] bg-[rgba(52,211,153,0.07)] p-4'>
        <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--green)]'>
          Saved across devices
        </div>
        <div className='mt-1 text-[14px] text-[var(--text)]'>
          Signed in as <strong>{email ?? 'your account'}</strong>
        </div>
        <div className='mt-1 text-[12px] text-[var(--text-2)]'>
          Streak, packs, and adventure history stay safe whenever you sign in here.
        </div>
      </div>
      <button
        type='button'
        data-testid='account-sign-out'
        disabled={busy}
        onClick={() => {
          onClearFeedback()
          onSignOut()
        }}
        className='flex items-center justify-center rounded-xl border border-[color:var(--border-md)] bg-[var(--bg-card)] px-4 py-3 text-[14px] font-semibold text-[var(--text)] transition-colors hover:bg-[color:rgba(255,255,255,0.04)] disabled:cursor-not-allowed disabled:opacity-60'
      >
        {busy ? 'Signing out\u2026' : 'Sign out'}
      </button>
    </div>
  )
}

export default AccountPage
