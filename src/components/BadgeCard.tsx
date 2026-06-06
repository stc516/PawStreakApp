import { CategoryIllustration, categoryFromText } from './challenges/CategoryIllustration'

interface BadgeCardProps {
  icon: string
  name: string
  description: string
  unlocked: boolean
  mystery?: boolean
  compact?: boolean
}

export function BadgeCard({
  icon,
  name,
  description,
  unlocked,
  mystery = false,
  compact = false,
}: BadgeCardProps) {
  if (compact) {
    return (
      <div className={`bm-card ${!unlocked ? 'locked' : ''} ${mystery ? 'mystery' : ''}`.trim()}>
        <div className='bm-icon'>{icon}</div>
        <div className='bm-name'>{name}</div>
      </div>
    )
  }

  return (
    <div className={`badge-card ${!unlocked ? 'locked' : ''} ${mystery ? 'mystery' : ''}`.trim()}>
      <div className='badge-card-icon' aria-hidden>
        <CategoryIllustration
          category={categoryFromText(`${name} ${description}`)}
          size={58}
          locked={!unlocked}
        />
      </div>
      <div className='badge-card-name'>{name}</div>
      <div className='badge-card-desc'>
        {unlocked ? description : mystery ? 'A hidden milestone is waiting for the right pattern.' : description}
      </div>
    </div>
  )
}
