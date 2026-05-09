import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LegalLayoutProps {
  eyebrow: string
  title: string
  updated: string
  children: ReactNode
}

/** Shared dark-themed page chrome for /privacy and /terms.
 *  Mobile-first with a constrained readable column. */
export function LegalLayout({ eyebrow, title, updated, children }: LegalLayoutProps) {
  return (
    <section
      className='screen active flex flex-col bg-[var(--bg)] px-5 pt-8'
      style={{
        fontFamily: 'var(--fb), DM Sans, sans-serif',
        paddingBottom: 'calc(4rem + var(--safe-bot, 0px))',
      }}
    >
      <div className='mx-auto flex w-full max-w-[640px] flex-1 flex-col'>
        <div className='mb-2 flex items-center justify-between'>
          <Link
            to='/app'
            className='text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text)]'
          >
            ← Back
          </Link>
          <span className='text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--text-2)]'>
            PawStreak
          </span>
        </div>

        <div className='mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]'>
          {eyebrow}
        </div>
        <h1 className='mt-2 font-[family-name:var(--fd),Fraunces,serif] text-[30px] font-semibold italic leading-[1.1] text-[var(--text)]'>
          {title}
        </h1>
        <p className='mt-2 text-[12px] uppercase tracking-[0.16em] text-[var(--text-3)]'>
          Last updated · {updated}
        </p>

        <div className='legal-prose mt-8 flex flex-col gap-8 text-[15px] leading-[1.7] text-[var(--text-2)]'>
          {children}
        </div>

        <nav className='mt-12 flex items-center justify-center gap-5 text-[12px] uppercase tracking-[0.18em] text-[var(--text-3)]'>
          <Link to='/privacy' className='transition-colors hover:text-[var(--text-2)]'>
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link to='/terms' className='transition-colors hover:text-[var(--text-2)]'>
            Terms
          </Link>
          <span aria-hidden>·</span>
          <Link to='/app' className='transition-colors hover:text-[var(--text-2)]'>
            Open app
          </Link>
        </nav>
      </div>
    </section>
  )
}

interface LegalSectionProps {
  title: string
  children: ReactNode
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='font-[family-name:var(--fd),Fraunces,serif] text-[20px] font-semibold italic text-[var(--text)]'>
        {title}
      </h2>
      <div className='flex flex-col gap-3'>{children}</div>
    </section>
  )
}
