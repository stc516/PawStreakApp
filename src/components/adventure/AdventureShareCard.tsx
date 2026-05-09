import type { AdventureCategory, AdventureRarity } from '../../types'

const CATEGORY_LABELS: Record<AdventureCategory, string> = {
  social: 'Social',
  exploration: 'Exploration',
  chill: 'Chill',
  chaos: 'Chaos',
  routine: 'Routine',
}

interface AdventureShareCardProps {
  dogName: string
  title: string
  neighborhoodOrLocation?: string
  category: AdventureCategory
  streak: number
  timestamp: string
  flavor?: string
  rarity?: AdventureRarity
  emoji?: string
}

export function AdventureShareCard({
  dogName,
  title,
  neighborhoodOrLocation,
  category,
  streak,
  timestamp,
  flavor,
  rarity = 'common',
  emoji = '🐾',
}: AdventureShareCardProps) {
  const dayLabel = new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className={`adventure-share-card rarity-${rarity}`}>
      <div className='adventure-share-glow' />
      <div className='adventure-share-head'>
        <div className='adventure-share-kicker'>{dogName} completed:</div>
        <div className='adventure-share-day'>{dayLabel}</div>
      </div>
      <div className='adventure-share-title-row'>
        <div className='adventure-share-emoji'>{emoji}</div>
        <h3 className='adventure-share-title'>{title}</h3>
      </div>
      <div className='adventure-share-meta'>
        <span className='adventure-share-chip'>{CATEGORY_LABELS[category]}</span>
        {neighborhoodOrLocation ? <span className='adventure-share-loc'>{neighborhoodOrLocation}</span> : null}
      </div>
      <div className='adventure-share-streak'>Day {streak} streak</div>
      {flavor ? <p className='adventure-share-flavor'>{flavor}</p> : null}
    </article>
  )
}
