import { Component, type ErrorInfo, type ReactNode } from 'react'

import { reportError } from '../lib/errorMonitoring'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * App-wide error boundary. Catches render-time crashes anywhere below it
 * and shows a branded fallback. Forwards the error to Sentry via the
 * privacy-safe `reportError` helper. Never exposes technical details to
 * the user.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // We deliberately do NOT pass `info.componentStack` (could contain custom
    // component names exposing user data); reportError -> Sentry will still
    // capture stack + scrubbed breadcrumbs.
    reportError(error, 'ErrorBoundary')
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error('[ErrorBoundary] caught render error', error, info?.componentStack)
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <section
        role='alert'
        data-testid='app-error-fallback'
        className='flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--bg)] px-6 text-center'
        style={{ fontFamily: 'var(--fb), DM Sans, sans-serif' }}
      >
        <div className='text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--text-2)]'>
          PawStreak
        </div>
        <div aria-hidden className='select-none text-[64px] leading-none'>
          🐾
        </div>
        <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-[26px] font-semibold italic leading-[1.2] text-[var(--text)]'>
          Something went sideways.
        </h1>
        <p className='max-w-sm text-sm leading-relaxed text-[var(--text-2)]'>
          Reload PawStreak and your adventure should pick back up.
        </p>
        <button
          type='button'
          className='btn-primary mt-2 px-6'
          onClick={this.handleReload}
          data-testid='app-error-reload'
        >
          Reload PawStreak
        </button>
      </section>
    )
  }
}
