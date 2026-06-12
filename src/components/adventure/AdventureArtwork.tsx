import type { CSSProperties } from 'react'

import {
  CategoryIllustration,
  categoryFromText,
  type ChallengeIllustrationKey,
} from '../challenges/CategoryIllustration'
import type { GeneratedMission, VibeArchetype } from '../../types'

const VIBE_CATEGORY: Record<VibeArchetype, ChallengeIllustrationKey> = {
  salt: 'beach',
  wander: 'trail',
  pulse: 'coffee',
  wild: 'adventure',
}

export function artworkCategoryForMission(
  mission: Pick<GeneratedMission, 'title' | 'locationHint' | 'spotName' | 'vibe'>,
): ChallengeIllustrationKey {
  return categoryFromText(
    `${mission.title} ${mission.locationHint ?? ''} ${mission.spotName ?? ''}`,
  ) || VIBE_CATEGORY[mission.vibe]
}

export function artworkCategoryForLabel(label: string, vibe?: VibeArchetype): ChallengeIllustrationKey {
  const fromText = categoryFromText(label)
  if (fromText !== 'adventure') return fromText
  return vibe ? VIBE_CATEGORY[vibe] : 'adventure'
}

interface AdventureArtworkProps {
  category: ChallengeIllustrationKey
  size?: number
  rounded?: number
  animated?: boolean
  label?: string
  style?: CSSProperties
}

export function AdventureArtwork({
  category,
  size = 96,
  rounded = 18,
  animated = true,
  label,
  style,
}: AdventureArtworkProps) {
  return (
    <div
      role="img"
      aria-label={label ?? `${category.replace('-', ' ')} adventure artwork`}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        background: '#FFFCF8',
        boxShadow: 'inset 0 0 0 1px rgba(44, 36, 25, 0.08)',
        ...style,
      }}
    >
      <style>
        {`
          @keyframes pawstreak-art-float {
            0%, 100% { transform: translateY(0) rotate(-1deg); }
            50% { transform: translateY(-4px) rotate(1deg); }
          }
          @keyframes pawstreak-art-drift {
            0%, 100% { transform: translate(0, 0); opacity: 0.58; }
            50% { transform: translate(6px, -5px); opacity: 0.85; }
          }
        `}
      </style>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          width: '42%',
          height: '42%',
          borderRadius: '999px',
          background: 'rgba(212, 149, 106, 0.18)',
          top: '8%',
          right: '7%',
          animation: animated ? 'pawstreak-art-drift 5.5s ease-in-out infinite' : undefined,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          width: '36%',
          height: '36%',
          borderRadius: '999px',
          background: 'rgba(92, 122, 107, 0.12)',
          bottom: '6%',
          left: '5%',
          animation: animated ? 'pawstreak-art-drift 6.5s ease-in-out infinite reverse' : undefined,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          animation: animated ? 'pawstreak-art-float 4.5s ease-in-out infinite' : undefined,
        }}
      >
        <CategoryIllustration category={category} size={Math.round(size * 0.82)} />
      </div>
    </div>
  )
}
