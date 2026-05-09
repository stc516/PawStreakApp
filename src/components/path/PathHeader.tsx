import type { DogMood } from '../../types'

const MOOD_VIBE_CLASS: Record<DogMood, string> = {
  restless: 'path-dog-vibe--restless',
  curious: 'path-dog-vibe--curious',
  explorer: 'path-dog-vibe--explorer',
  social: 'path-dog-vibe--social',
  zoomie: 'path-dog-vibe--zoomie',
  chill: 'path-dog-vibe--chill',
}

interface PathHeaderProps {
  dogName: string
  dogMood: DogMood
  moodEmoji: string
  moodLabel: string
  rankTitle: string
  streak: number
  pathFillRatio: number
  zipLine: string
}

export function PathHeader({
  dogName,
  dogMood,
  moodEmoji,
  moodLabel,
  rankTitle,
  streak,
  pathFillRatio,
  zipLine,
}: PathHeaderProps) {
  const vibeClass = MOOD_VIBE_CLASS[dogMood] ?? MOOD_VIBE_CLASS.curious

  return (
    <header className='relative bg-[var(--bg)] px-5 pb-4 pt-6 text-center'>
      <div className={`flex flex-col items-center gap-3 ${vibeClass}`}>
        <div className='relative grid h-[112px] w-[112px] place-items-center rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-[color:rgba(255,255,255,0.07)]'>
          <span className='text-[52px] leading-none drop-shadow-md' aria-hidden>
            🐕
          </span>
          <span
            className='absolute right-0.5 top-1 grid h-9 w-9 place-items-center rounded-full border-2 border-[color:rgba(255,255,255,0.08)] bg-[var(--bg)] text-lg shadow-md'
            aria-hidden
            title={moodLabel}
          >
            {moodEmoji}
          </span>
        </div>
        <div className='flex flex-col gap-0.5'>
          <span className='font-serif text-[26px] text-[var(--text)]'>{dogName}</span>
          <span className='text-sm font-medium text-[var(--text-2)]'>{moodLabel}</span>
        </div>
      </div>

      <div className='mt-4 flex flex-col gap-0.5'>
        <span className='text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-2)]'>Rank</span>
        <span className='font-serif text-xl text-[var(--text)]'>{rankTitle}</span>
      </div>

      <div className='mt-4 flex items-baseline justify-center gap-1.5'>
        <span className='text-[22px]' aria-hidden>
          🔥
        </span>
        <span
          className='font-serif text-[34px] font-semibold tabular-nums leading-none text-[var(--gold)]'
          style={{ textShadow: '0 0 24px rgba(255, 179, 71, 0.35)' }}
        >
          {streak}
        </span>
        <span className='text-sm text-[var(--text-2)]'>day streak</span>
      </div>

      <div
        className='mx-4 mt-4 h-2 overflow-hidden rounded-full border border-[color:rgba(255,255,255,0.07)] bg-[var(--bg-card)]'
        aria-label='Path progress'
      >
        <div
          className='h-full origin-left rounded-full bg-[var(--orange)]'
          style={{ transform: `scaleX(${pathFillRatio})` }}
        />
      </div>
      <p className='mt-3 px-4 text-xs text-[var(--text-2)]'>{zipLine}</p>
    </header>
  )
}
