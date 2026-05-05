import type { ReactNode } from 'react'

interface HeroCardProps {
  radialClassName: string
  children: ReactNode
}

export function HeroCard({ radialClassName, children }: HeroCardProps) {
  return (
    <div className='hero-shell'>
      <div className={radialClassName} />
      <div className='hero-inner'>{children}</div>
    </div>
  )
}
