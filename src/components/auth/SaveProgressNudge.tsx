import { useNavigate } from 'react-router-dom'

import { useAppState } from '../../hooks/useAppState'
import { evaluateDashboardNudge, formatTrialStatusLine } from '../../lib/saveProgressNudge'

/**
 * Dashboard banner that nudges demo users to save their progress to an
 * account. Dismissible; resurfaces after meaningful events (latest adventure
 * timestamp newer than the last dismissal) or once the demo trial expires.
 */
export function SaveProgressNudge() {
  const navigate = useNavigate()
  const { state, dismissSaveNudge } = useAppState()
  const decision = evaluateDashboardNudge(state)

  if (!decision.show) return null

  const isExpired = decision.reason === 'expired-trial'
  const accent = isExpired
    ? 'border-[color:rgba(255,179,71,0.45)] bg-[color:rgba(255,179,71,0.08)]'
    : 'border-[color:rgba(255,107,53,0.4)] bg-[color:rgba(255,107,53,0.07)]'

  return (
    <div
      data-testid='save-progress-nudge'
      data-reason={decision.reason ?? ''}
      className={`mx-4 mb-3 mt-3 rounded-2xl border px-4 py-3 ${accent}`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <div className='text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--orange)]'>
            {isExpired ? 'Save before it slips' : 'Save your progress'}
          </div>
          <p className='mt-1 text-[13px] leading-snug text-[var(--text)]'>
            <strong>{state.dogName}</strong>&apos;s streak, packs, and adventures live on this device only.{' '}
            {formatTrialStatusLine(state, decision.trial)}
          </p>
        </div>
        <button
          type='button'
          aria-label='Dismiss save progress nudge'
          data-testid='save-progress-nudge-dismiss'
          className='shrink-0 rounded-full px-1.5 text-base leading-none text-[var(--text-3)] transition-colors hover:text-[var(--text-2)]'
          onClick={() => dismissSaveNudge()}
        >
          ×
        </button>
      </div>
      <div className='mt-3 flex items-center gap-2'>
        <button
          type='button'
          data-testid='save-progress-nudge-cta'
          onClick={() => navigate('/account')}
          className='rounded-full bg-[color:var(--orange)] px-4 py-1.5 text-[12px] font-semibold text-[var(--bg)] shadow-[0_0_14px_-3px_var(--orange-glow)] transition-transform active:scale-[0.98]'
        >
          Save progress →
        </button>
        <span className='text-[11px] text-[var(--text-2)]'>Free · email or magic link</span>
      </div>
    </div>
  )
}
