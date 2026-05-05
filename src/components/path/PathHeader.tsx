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
    <header className='path-header'>
      <div className='path-header-bg' aria-hidden />
      <div className={`path-dog-stage ${vibeClass}`}>
        <div className='path-dog-ring'>
          <span className='path-dog-face' aria-hidden>
            🐕
          </span>
          <span className='path-dog-mood-badge' aria-hidden title={moodLabel}>
            {moodEmoji}
          </span>
        </div>
        <div className='path-dog-caption'>
          <span className='path-dog-name'>{dogName}</span>
          <span className='path-dog-mood-lbl'>{moodLabel}</span>
        </div>
      </div>

      <div className='path-rank-block'>
        <span className='path-rank-label'>Rank</span>
        <span className='path-rank-title'>{rankTitle}</span>
      </div>

      <div className='path-streak-row'>
        <span className='path-streak-flame' aria-hidden>
          🔥
        </span>
        <span className='path-streak-num'>{streak}</span>
        <span className='path-streak-unit'>day streak</span>
      </div>

      <div className='path-meter' aria-label='Path progress'>
        <div className='path-meter-fill' style={{ transform: `scaleX(${pathFillRatio})` }} />
      </div>
      <p className='path-zip-line'>{zipLine}</p>
    </header>
  )
}
