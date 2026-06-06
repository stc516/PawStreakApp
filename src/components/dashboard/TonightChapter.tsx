import type { CSSProperties } from 'react'

import { memoryReturnTimeLabel, narrativeForEntry } from '../../lib/memoryNarrative'
import type { AdventureEntry } from '../../types'

const PLACE_IMAGES: Record<string, string> = {
  salt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
  wander: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85',
  pulse: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=85',
  wild: 'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=1200&q=85',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=85',
}

const H = {
  ink: '#2C2419',
  inkSoft: '#4A4036',
  muted: '#7A6E62',
  sage: '#5C7A6B',
  border: 'rgba(44, 36, 25, 0.08)',
  serif: "'Literata', 'Fraunces', Georgia, 'Times New Roman', serif",
  sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
}

interface TonightChapterProps {
  entry: AdventureEntry
  dogDisplayName: string
  zipCode: string
  onOpenJourney: () => void
}

export function TonightChapter({ entry, dogDisplayName, zipCode, onOpenJourney }: TonightChapterProps) {
  const narrative = narrativeForEntry(entry, dogDisplayName, zipCode)
  const imageUrl = PLACE_IMAGES[entry.vibe] || PLACE_IMAGES.default
  const timeLabel = memoryReturnTimeLabel(entry.completedAt)
  const reflection =
    entry.memoryText?.trim() ||
    (narrative.reflection.trim() ? narrative.reflection : '')
  const atmosphere = narrative.atmosphere[0] ?? ''

  const shell: CSSProperties = {
    marginBottom: '28px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: `1px solid ${H.border}`,
    background: '#FFFCF8',
  }

  return (
    <section
      data-testid="memory-return-strip"
      aria-label={`${timeLabel}'s memory`}
      style={shell}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', maxHeight: '52vh' }}>
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(44, 36, 25, 0.45) 0%, rgba(44, 36, 25, 0.02) 55%)',
          }}
        />
        <p
          style={{
            position: 'absolute',
            top: '16px',
            left: '18px',
            margin: 0,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 253, 249, 0.9)',
            fontFamily: H.sans,
          }}
        >
          {timeLabel}
        </p>
      </div>

      <div style={{ padding: '22px 20px 20px' }}>
        <h2
          style={{
            margin: '0 0 12px',
            fontFamily: H.serif,
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: H.ink,
          }}
        >
          {narrative.emotionalTitle}
        </h2>

        {reflection ? (
          <p
            style={{
              margin: '0 0 14px',
              fontFamily: H.serif,
              fontSize: '18px',
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: H.inkSoft,
            }}
          >
            {reflection.startsWith('“') ? reflection : `“${reflection}”`}
          </p>
        ) : null}

        {atmosphere ? (
          <p
            style={{
              margin: reflection ? '0 0 18px' : '0 0 18px',
              fontSize: '15px',
              lineHeight: 1.5,
              color: H.muted,
              fontFamily: H.sans,
            }}
          >
            {atmosphere}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onOpenJourney}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: H.sage,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: H.sans,
            textDecoration: 'underline',
            textDecorationColor: 'rgba(92, 122, 107, 0.35)',
            textUnderlineOffset: '3px',
          }}
        >
          Open Journey
        </button>
      </div>
    </section>
  )
}
