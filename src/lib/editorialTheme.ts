import type { CSSProperties } from 'react'

/** Shared editorial palette — cream, sage, terracotta (Design Bible v2) */
export const H = {
  page: '#FAF7F2',
  pageWash: 'linear-gradient(180deg, #FFFDF9 0%, #F5EFE6 48%, #FAF7F2 100%)',
  card: '#FFFFFF',
  cardSoft: '#FFFCF8',
  ink: '#2C2419',
  inkSoft: '#4A4036',
  muted: '#7A6E62',
  sage: '#5C7A6B',
  sageSoft: 'rgba(92, 122, 107, 0.12)',
  sageDeep: '#4A6359',
  terra: '#C67B5C',
  amber: '#D4956A',
  amberSoft: 'rgba(212, 149, 106, 0.18)',
  border: 'rgba(44, 36, 25, 0.08)',
  borderStrong: 'rgba(44, 36, 25, 0.12)',
  shadow: '0 12px 40px rgba(44, 36, 25, 0.06)',
  shadowSoft: '0 4px 20px rgba(44, 36, 25, 0.05)',
  serif: "'Literata', 'Fraunces', Georgia, 'Times New Roman', serif",
  sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
}

export const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
`

export const confettiPalette = [
  '#5C7A6B', '#C67B5C', '#D4956A', '#FAF7F2', '#4A6359', '#7A6E62', '#2C2419',
]

export function editorialCard(extra?: CSSProperties): CSSProperties {
  return {
    background: H.card,
    borderRadius: '20px',
    border: `1px solid ${H.border}`,
    boxShadow: H.shadowSoft,
    ...extra,
  }
}
