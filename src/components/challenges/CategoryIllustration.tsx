export type ChallengeIllustrationKey =
  | 'beach'
  | 'trail'
  | 'coffee'
  | 'brewery'
  | 'park'
  | 'dog-park'
  | 'scenic'
  | 'neighborhood'
  | 'patio'
  | 'adventure'

interface CategoryIllustrationProps {
  category: ChallengeIllustrationKey
  size?: number
  locked?: boolean
}

const PALETTE: Record<ChallengeIllustrationKey, { bg: string; fg: string; accent: string }> = {
  beach: { bg: '#D9EEF0', fg: '#316F77', accent: '#D4956A' },
  trail: { bg: '#E4EDD8', fg: '#5C7A6B', accent: '#8D6E53' },
  coffee: { bg: '#F4E4D4', fg: '#8D5A3B', accent: '#C67B5C' },
  brewery: { bg: '#F0E2C6', fg: '#8A6239', accent: '#D4956A' },
  park: { bg: '#DDEBDA', fg: '#4F7454', accent: '#92A56D' },
  'dog-park': { bg: '#E6E1F1', fg: '#6B5C8E', accent: '#C67B5C' },
  scenic: { bg: '#E9E5D8', fg: '#6B7454', accent: '#D4956A' },
  neighborhood: { bg: '#F0E7DC', fg: '#745B45', accent: '#5C7A6B' },
  patio: { bg: '#EFE3D6', fg: '#7A654B', accent: '#5C7A6B' },
  adventure: { bg: '#E1E8E2', fg: '#4A6359', accent: '#C67B5C' },
}

export function categoryFromText(input: string): ChallengeIllustrationKey {
  const text = input.toLowerCase()
  if (/beach|coast|shore/.test(text)) return 'beach'
  if (/trail|scout|wild/.test(text)) return 'trail'
  if (/coffee|cafe|café/.test(text)) return 'coffee'
  if (/brewery|brew/.test(text)) return 'brewery'
  if (/dog park/.test(text)) return 'dog-park'
  if (/park|hopper/.test(text)) return 'park'
  if (/scenic|sunset|sniffer/.test(text)) return 'scenic'
  if (/neighborhood|city|block/.test(text)) return 'neighborhood'
  if (/patio/.test(text)) return 'patio'
  return 'adventure'
}

export function CategoryIllustration({
  category,
  size = 64,
  locked = false,
}: CategoryIllustrationProps) {
  const colors = PALETTE[category]
  const opacity = locked ? 0.55 : 1
  const common = {
    fill: 'none',
    stroke: colors.fg,
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={`${category.replace('-', ' ')} illustration`}
      style={{ display: 'block', opacity }}
    >
      <rect x="8" y="8" width="80" height="80" rx="20" fill={colors.bg} />
      <circle cx="72" cy="24" r="7" fill={colors.accent} opacity="0.9" />
      {category === 'beach' ? (
        <>
          <path {...common} d="M20 60c10-7 20-7 30 0s20 7 30 0" />
          <path {...common} d="M24 70c9-5 18-5 27 0s18 5 27 0" opacity="0.65" />
          <path {...common} d="M26 48c7-13 18-19 34-17" />
        </>
      ) : category === 'trail' ? (
        <>
          <path {...common} d="M21 68l18-38 12 24 9-14 17 28H21z" />
          <path {...common} d="M38 68c7-9 16-12 28-10" opacity="0.7" />
        </>
      ) : category === 'coffee' ? (
        <>
          <path {...common} d="M28 38h34v18a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12V38z" />
          <path {...common} d="M62 43h5a7 7 0 0 1 0 14h-5" />
          <path {...common} d="M36 27v6M45 25v7M54 27v6" />
        </>
      ) : category === 'brewery' ? (
        <>
          <path {...common} d="M36 30h24l-3 38H39L36 30z" />
          <path {...common} d="M33 39h30" />
          <path {...common} d="M43 24h14" />
          <circle cx="48" cy="52" r="5" fill={colors.accent} />
        </>
      ) : category === 'park' ? (
        <>
          <path {...common} d="M48 70V39" />
          <path {...common} d="M33 46c0-11 15-20 15-20s15 9 15 20a15 15 0 0 1-30 0z" />
          <path {...common} d="M23 70h54" />
        </>
      ) : category === 'dog-park' ? (
        <>
          <circle cx="38" cy="38" r="5" fill={colors.fg} />
          <circle cx="56" cy="38" r="5" fill={colors.fg} />
          <circle cx="28" cy="52" r="4" fill={colors.fg} />
          <circle cx="66" cy="52" r="4" fill={colors.fg} />
          <path d="M48 53c-12 0-19 6-19 13h38c0-7-7-13-19-13z" fill={colors.accent} opacity="0.9" />
        </>
      ) : category === 'scenic' ? (
        <>
          <path {...common} d="M20 67l19-25 12 15 9-10 16 20H20z" />
          <path {...common} d="M24 34c8 3 16 3 24 0s16-3 24 0" opacity="0.65" />
        </>
      ) : category === 'neighborhood' ? (
        <>
          <path {...common} d="M24 52l16-14 16 14v18H24V52z" />
          <path {...common} d="M56 50l11-10 11 10v20H56" opacity="0.75" />
          <path {...common} d="M38 70V58h10v12" />
        </>
      ) : category === 'patio' ? (
        <>
          <path {...common} d="M27 42h42M33 42v28M63 42v28M38 70h20" />
          <path {...common} d="M31 35c7-7 25-7 32 0" />
          <path {...common} d="M44 51h12v9H44z" />
        </>
      ) : (
        <>
          <path {...common} d="M48 24l8 19 20 2-15 13 5 20-18-11-18 11 5-20-15-13 20-2 8-19z" />
          <path {...common} d="M36 54l8 8 17-19" opacity="0.8" />
        </>
      )}
    </svg>
  )
}
