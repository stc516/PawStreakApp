import { useNavigate } from 'react-router-dom'

import { useAppState } from '../../hooks/useAppState'

interface AccountStatusChipProps {
  /** Optional className for layout placement. */
  className?: string
}

/**
 * Small chip that surfaces whether the user's progress is being saved to an
 * account or only living on this device. Tappable — opens /account.
 *
 * Visual states:
 *  - Authenticated     → green dot + "Saved"
 *  - Local-only (demo) → orange dot + "Local only"
 *  - Loading session   → muted dot + "Checking…"
 */
export function AccountStatusChip({ className }: AccountStatusChipProps) {
  const navigate = useNavigate()
  const { session, loadingSession, authEnabled, state } = useAppState()

  const isAuthed = Boolean(session) || state.hasAccount
  const isLoading = authEnabled && loadingSession && !isAuthed

  const tone = isAuthed
    ? {
        dot: 'bg-[var(--green)] shadow-[0_0_8px_rgba(52,211,153,0.65)]',
        text: 'text-[var(--green)]',
        border: 'border-[color:rgba(52,211,153,0.32)]',
        bg: 'bg-[rgba(52,211,153,0.08)]',
        label: 'Saved',
      }
    : isLoading
      ? {
          dot: 'bg-[var(--text-3)]',
          text: 'text-[var(--text-2)]',
          border: 'border-[color:var(--border-md)]',
          bg: 'bg-[var(--bg-elevated)]',
          label: 'Checking\u2026',
        }
      : {
          dot: 'bg-[var(--orange)] shadow-[0_0_8px_rgba(255,107,53,0.6)]',
          text: 'text-[color:var(--orange)]',
          border: 'border-[color:rgba(255,107,53,0.35)]',
          bg: 'bg-[var(--orange-dim)]',
          label: 'Local only',
        }

  return (
    <button
      type='button'
      data-testid='account-status-chip'
      data-state={isAuthed ? 'saved' : isLoading ? 'loading' : 'local'}
      onClick={() => navigate('/account')}
      title={isAuthed ? 'View account' : 'Save your progress'}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
        tone.bg,
        tone.border,
        tone.text,
        'hover:brightness-110',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      <span>{tone.label}</span>
    </button>
  )
}
