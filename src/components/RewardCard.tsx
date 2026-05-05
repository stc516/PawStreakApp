import type { ReactNode } from 'react'

interface RewardCardProps {
  children: ReactNode
  delayMs?: number
  className?: string
}

export function RewardCard({ children, delayMs = 0, className = '' }: RewardCardProps) {
  return (
    <div className={`reward-card ${className}`.trim()} style={{ animationDelay: `${delayMs}ms` }}>
      {children}
    </div>
  )
}
