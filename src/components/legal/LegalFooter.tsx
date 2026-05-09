import { Link } from 'react-router-dom'

interface LegalFooterProps {
  /** When true (default), renders inside the dashboard's narrow column with
   *  bottom padding to clear the BottomNav. Set false for screens without the
   *  bottom nav (e.g. onboarding) so we don't add extra space. */
  withBottomNavSpacing?: boolean
}

/** Discreet legal links shared across surfaces. Stays on-brand with the
 *  premium dark theme — quiet text, easy to find, never shouty. */
export function LegalFooter({ withBottomNavSpacing = true }: LegalFooterProps) {
  return (
    <footer
      data-testid='legal-footer'
      className={[
        'mt-6 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--text-3)]',
        withBottomNavSpacing ? 'pb-20' : '',
      ]
        .join(' ')
        .trim()}
    >
      <div className='flex items-center gap-4'>
        <Link
          to='/privacy'
          className='transition-colors hover:text-[var(--text-2)]'
          data-testid='footer-privacy-link'
        >
          Privacy
        </Link>
        <span aria-hidden>·</span>
        <Link
          to='/terms'
          className='transition-colors hover:text-[var(--text-2)]'
          data-testid='footer-terms-link'
        >
          Terms
        </Link>
      </div>
      <div className='text-[10px] tracking-[0.18em] text-[var(--text-3)]'>
        © PawStreak · Built for the dogs
      </div>
    </footer>
  )
}
