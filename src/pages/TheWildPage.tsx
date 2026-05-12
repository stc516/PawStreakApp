import { useMemo } from 'react'

import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { LevelProgressCard } from '../components/LevelProgressCard'
import { useAppState } from '../hooks/useAppState'
import { XP_LEVELS, getCurrentLevel } from '../utils/xpLevels'

const TIER_BLURB: Record<number, string> = {
  5: 'The top dogs. Earned, not given.',
  4: 'Serious adventurers.',
  3: 'Exploring beyond the block.',
  2: 'Building consistency.',
  1: 'Every legend started here.',
}

export function TheWildPage() {
  const { state } = useAppState()
  const tier = useMemo(() => getCurrentLevel(state.totalAdventureEnergy), [state.totalAdventureEnergy])

  // Render tiers top-down so Legend sits at the top of the ladder.
  const ladder = useMemo(() => [...XP_LEVELS].sort((a, b) => b.level - a.level), [])

  return (
    <section
      id='screen-wild'
      data-testid='wild-page'
      className='screen active'
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px))' }}
    >
      <div className='screen-hdr'>
        <h1>The Wild</h1>
        <p>Your rank updates weekly based on adventures.</p>
      </div>

      <div className='scroll px-4'>
        <article
          data-testid='wild-current-card'
          className='mt-2 overflow-hidden rounded-2xl border border-[color:rgba(255,107,53,0.32)] bg-[linear-gradient(160deg,rgba(255,107,53,0.14),rgba(255,179,71,0.05)_55%,rgba(13,17,23,0)_100%)] p-4 shadow-[0_22px_44px_-22px_rgba(255,107,53,0.5)]'
        >
          <div className='flex items-start gap-3'>
            <div
              aria-hidden
              className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[color:rgba(255,107,53,0.32)] bg-[var(--orange-dim)] text-[28px] shadow-[0_0_28px_-8px_var(--orange-glow)]'
            >
              {tier.current.icon}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--orange)]'>
                Current league
              </div>
              <h2 className='mt-0.5 font-[family-name:var(--fd),Fraunces,serif] text-[22px] font-semibold italic leading-tight text-[var(--text)]'>
                {state.dogName} · {tier.current.name}
              </h2>
              <p className='mt-1 text-[12px] text-[var(--text-2)]'>
                Level {tier.current.level} of {XP_LEVELS.length} · keep showing up to climb.
              </p>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-3 gap-2 text-center'>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--text)]'>{state.currentStreak}</div>
              <div className='text-[9px] uppercase tracking-[0.12em] text-[var(--text-3)]'>Streak</div>
            </div>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--text)]'>{state.totalAdventures}</div>
              <div className='text-[9px] uppercase tracking-[0.12em] text-[var(--text-3)]'>Adventures</div>
            </div>
            <div className='rounded-xl border border-[color:var(--border)] bg-[var(--bg-card)] p-2.5'>
              <div className='text-[18px] font-semibold text-[var(--gold)]'>
                {state.totalAdventureEnergy.toLocaleString()}
              </div>
              <div className='text-[9px] uppercase tracking-[0.12em] text-[var(--text-3)]'>Total XP</div>
            </div>
          </div>

          <div className='mt-4'>
            <LevelProgressCard xp={state.totalAdventureEnergy} variant='compact' />
          </div>
        </article>

        <div className='mt-5 mb-2 flex items-end justify-between px-0.5'>
          <div className='text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)]'>League ladder</div>
          <div className='text-[10px] uppercase tracking-[0.14em] text-[var(--text-3)]'>
            {XP_LEVELS.length} tiers
          </div>
        </div>

        <ul
          data-testid='wild-league-ladder'
          className='flex flex-col gap-2'
        >
          {ladder.map((tierItem) => {
            const isCurrent = tierItem.level === tier.current.level
            return (
              <li
                key={tierItem.level}
                data-testid={`wild-tier-${tierItem.level}`}
                data-current={isCurrent ? 'true' : 'false'}
                aria-current={isCurrent ? 'true' : undefined}
                className={[
                  'flex items-center gap-3 rounded-2xl border p-3.5 transition-colors',
                  isCurrent
                    ? 'border-[color:rgba(255,107,53,0.5)] bg-[var(--orange-dim)] shadow-[0_0_24px_-10px_var(--orange-glow)]'
                    : 'border-[color:var(--border)] bg-[var(--bg-card)] opacity-80',
                ].join(' ')}
              >
                <div
                  aria-hidden
                  className={[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                    isCurrent
                      ? 'border-[color:rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.16)]'
                      : 'border-[color:var(--border)] bg-[var(--bg-elevated)]',
                    'text-[20px]',
                  ].join(' ')}
                >
                  {tierItem.icon}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={[
                        'text-[14px] font-semibold',
                        isCurrent ? 'text-[var(--text)]' : 'text-[var(--text-2)]',
                      ].join(' ')}
                    >
                      {tierItem.name}
                    </span>
                    {isCurrent ? (
                      <span className='rounded-full bg-[color:var(--orange)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--bg)]'>
                        You
                      </span>
                    ) : null}
                  </div>
                  <div
                    className={[
                      'mt-0.5 text-[11px]',
                      isCurrent ? 'text-[var(--text-2)]' : 'text-[var(--text-3)]',
                    ].join(' ')}
                  >
                    {TIER_BLURB[tierItem.level]}
                  </div>
                </div>
                <div
                  className={[
                    'shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.12em] tabular-nums',
                    isCurrent ? 'text-[var(--orange)]' : 'text-[var(--text-3)]',
                  ].join(' ')}
                >
                  {tierItem.min.toLocaleString()}
                  {tierItem.level < XP_LEVELS.length ? '+' : '+'} XP
                </div>
              </li>
            )
          })}
        </ul>

        <article
          data-testid='wild-coming-soon'
          className='mt-5 rounded-2xl border border-dashed border-[color:var(--border-md)] bg-[var(--bg-card)] p-4'
        >
          <div className='text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]'>
            Coming soon
          </div>
          <h3 className='mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[18px] font-semibold italic leading-tight text-[var(--text)]'>
            Weekly leagues with real competition.
          </h3>
          <p className='mt-1 text-[12px] leading-relaxed text-[var(--text-2)]'>
            Live leagues unlock when the pack is big enough. Keep adventuring — your rank is being tracked, and you&apos;ll
            start in the league you&apos;ve already earned.
          </p>
        </article>

        <LegalFooter />
      </div>

      <BottomNav />
    </section>
  )
}
