import { getCurrentLevel } from '../utils/xpLevels'

interface LevelProgressCardProps {
  /** Total XP. Pass `state.totalAdventureEnergy`. */
  xp: number
  /** Compact rendering for tight surfaces (e.g. reward page). */
  variant?: 'default' | 'compact'
  className?: string
  /** Optional small hint line under the progress bar (e.g. level-up callout). */
  footnote?: string
}

/**
 * Premium card that visualizes the user's place in the Pup → Legend ladder.
 * Pure presentational — derives everything from `xp`.
 */
export function LevelProgressCard({
  xp,
  variant = 'default',
  className,
  footnote,
}: LevelProgressCardProps) {
  const { current, next, progressToNext, xpToNext, isMaxLevel } = getCurrentLevel(xp)
  const compact = variant === 'compact'

  return (
    <article
      data-testid='level-progress-card'
      data-level={current.level}
      data-max-level={isMaxLevel ? 'true' : 'false'}
      className={[
        'tap-card relative overflow-hidden rounded-2xl border border-[color:var(--border)]',
        'bg-[linear-gradient(160deg,rgba(255,107,53,0.10),rgba(255,179,71,0.04)_55%,rgba(13,17,23,0)_100%)]',
        'shadow-[0_18px_42px_-22px_rgba(255,107,53,0.55)]',
        compact ? 'p-3' : 'p-4',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <div className='flex items-start gap-3'>
        <div
          aria-hidden
          className={[
            'flex shrink-0 items-center justify-center rounded-2xl border border-[color:rgba(255,107,53,0.32)]',
            'bg-[var(--orange-dim)] shadow-[0_0_24px_-8px_var(--orange-glow)]',
            compact ? 'h-10 w-10 text-[20px]' : 'h-12 w-12 text-[26px]',
          ].join(' ')}
        >
          {current.icon}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-baseline justify-between gap-2'>
            <div>
              <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--orange)]'>
                Chapter {current.level}
              </div>
              <div
                data-testid='level-progress-card-name'
                className={[
                  'mt-0.5 font-[family-name:var(--fd),Fraunces,serif] font-semibold italic leading-tight text-[var(--text)]',
                  compact ? 'text-[18px]' : 'text-[22px]',
                ].join(' ')}
              >
                {current.name}
              </div>
            </div>
            <div
              data-testid='level-progress-card-xp'
              className={[
                'shrink-0 text-right font-semibold tabular-nums',
                compact ? 'text-[12px]' : 'text-[13px]',
                'text-[var(--text)]',
              ].join(' ')}
            >
              <span className='text-[var(--gold)]'>{xp.toLocaleString()}</span>
              {next ? (
                <span className='text-[var(--text-3)]'>
                  {' '}/ {next.min.toLocaleString()}
                </span>
              ) : null}
              <div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-3)]'>
                Energy
              </div>
            </div>
          </div>

          <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]'>
            <div
              data-testid='level-progress-card-bar'
              className='h-full rounded-full bg-[linear-gradient(90deg,var(--orange),var(--gold))] shadow-[0_0_10px_-2px_var(--orange-glow)] transition-[width] duration-500 ease-out'
              style={{ width: `${progressToNext}%` }}
              role='progressbar'
              aria-valuenow={progressToNext}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${current.name} progress`}
            />
          </div>

          <div
            data-testid='level-progress-card-hint'
            className={[
              'mt-2 text-[var(--text-2)]',
              compact ? 'text-[11px]' : 'text-[12px]',
            ].join(' ')}
          >
            {isMaxLevel ? (
              <span>
                Max tier reached — <strong className='text-[var(--gold)]'>{current.name}</strong>
              </span>
            ) : (
              <>
                {xpToNext.toLocaleString()} energy to{' '}
                <strong className='text-[var(--text)]'>{next?.name}</strong>
              </>
            )}
          </div>

          {footnote ? (
            <div
              data-testid='level-progress-card-footnote'
              className='mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]'
            >
              {footnote}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
