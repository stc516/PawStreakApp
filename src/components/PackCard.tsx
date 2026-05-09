import type { PackProgress } from '../lib/monthlyPacks'

interface PackCardProps {
  progress: PackProgress
  /** Compact variant for dashboard "Featured pack" slot. */
  variant?: 'full' | 'featured'
}

/** Premium dark pack card — icon, identity, progress bar, completed glow.
 *  No XP math is touched; xpBonusLabel is purely a display flourish. */
export function PackCard({ progress, variant = 'full' }: PackCardProps) {
  const { pack, completed, required, percent, isComplete, remaining } = progress
  const isFeatured = variant === 'featured'

  return (
    <article
      data-testid={`pack-card-${pack.id}`}
      data-pack-complete={isComplete ? 'true' : 'false'}
      className={[
        'relative flex flex-col gap-3 rounded-2xl border bg-[var(--bg-card)] p-4 transition-shadow',
        isComplete
          ? 'border-[color:rgba(255,107,53,0.45)] shadow-[0_0_24px_-6px_var(--orange-glow)]'
          : 'border-[color:var(--border)]',
        isFeatured ? 'p-4' : '',
      ]
        .join(' ')
        .trim()}
    >
      {pack.seasonal ? (
        <div className='absolute right-3 top-3 rounded-full border border-[color:var(--border-md)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]'>
          {pack.seasonal}
        </div>
      ) : null}

      <div className='flex items-start gap-3'>
        <div
          aria-hidden
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl',
            isComplete
              ? 'border-[color:rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.1)] drop-shadow-[0_0_10px_var(--orange-glow)]'
              : 'border-[color:var(--border)] bg-[var(--bg-elevated)]',
          ].join(' ')}
        >
          {pack.icon}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='font-[family-name:var(--fd),Fraunces,serif] text-[16px] font-semibold italic leading-tight text-[var(--text)]'>
              {pack.title}
            </h3>
            {isComplete ? (
              <span
                aria-hidden
                className='flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--orange)] text-[11px] font-bold text-[var(--bg)]'
                title='Pack completed'
              >
                ✓
              </span>
            ) : null}
          </div>
          <p className='mt-1 text-[12px] leading-snug text-[var(--text-2)]'>
            {pack.description}
          </p>
        </div>
      </div>

      <div>
        <div className='flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em]'>
          <span className={isComplete ? 'text-[color:var(--orange)]' : 'text-[var(--text-3)]'}>
            {isComplete ? 'Completed' : `${completed}/${required}`}
          </span>
          <span className='text-[var(--text-3)]'>{percent}%</span>
        </div>
        <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]'>
          <div
            className={[
              'h-full rounded-full transition-all duration-500',
              isComplete
                ? 'bg-[color:var(--orange)]'
                : 'bg-gradient-to-r from-[color:var(--orange)] to-[color:var(--gold)]',
            ].join(' ')}
            style={{ width: `${Math.max(percent, 4)}%` }}
          />
        </div>
        <div className='mt-2 text-[11px] text-[var(--text-2)]'>
          {isComplete ? (
            <span>{pack.completedFlavor}</span>
          ) : remaining === 1 ? (
            <span>One more to unlock {pack.identity}.</span>
          ) : (
            <span>
              {remaining} more to become a {pack.identity}.
            </span>
          )}
        </div>
        <div className='mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]'>
          {pack.xpBonusLabel}
        </div>
      </div>
    </article>
  )
}
