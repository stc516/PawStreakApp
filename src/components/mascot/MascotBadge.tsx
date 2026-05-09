import type { CSSProperties } from 'react'

import type { MascotId } from '../../content/mascotGuidelines'

/**
 * Premium dark-themed mascot placeholder used wherever a slot needs a mascot
 * presence but a finished cropped illustration does not yet exist.
 *
 * Why a CSS badge instead of dropping the master sheet directly:
 *   - The master sheet at `src/assets/mascot/master/pawstreak-mascot-master.png`
 *     is a wide style-guide board. Cramming a 2.4MB wide-format brand sheet
 *     into a 40px empty-state thumbnail looks awful and ships an unnecessary
 *     payload to every screen.
 *   - Until we have individual cropped assets in `stickers/`, `empty-states/`,
 *     `share/`, etc., this badge is the on-brand stand-in.
 *
 * When cropped assets land, callers can pass `imageSrc` to upgrade an
 * individual badge into an illustration without touching the call sites that
 * are still using the placeholder treatment.
 */

export type MascotBadgeMascot = MascotId | 'duo'
export type MascotBadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type MascotBadgeTone = 'warm' | 'calm' | 'auto'

interface MascotBadgeProps {
  /** Which character anchors the badge. `'duo'` shows a B+M monogram. */
  mascot?: MascotBadgeMascot
  /** Visual size of the badge. */
  size?: MascotBadgeSize
  /** Color tone — auto picks based on the mascot. */
  tone?: MascotBadgeTone
  /**
   * Optional cropped illustration to render inside the badge frame. When
   * provided, the badge falls back to a pure visual portrait. Recommended
   * only at sizes >= 'md'.
   */
  imageSrc?: string
  /** Accessible label override; defaults to the mascot name. */
  label?: string
  /** Extra classes for layout fine-tuning. */
  className?: string
}

const SIZE_PX: Record<MascotBadgeSize, number> = {
  xs: 32,
  sm: 44,
  md: 64,
  lg: 96,
}

const RADIUS_PX: Record<MascotBadgeSize, number> = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
}

const MONOGRAM_FONT_PX: Record<MascotBadgeSize, number> = {
  xs: 11,
  sm: 14,
  md: 19,
  lg: 26,
}

const PAW_FONT_PX: Record<MascotBadgeSize, number> = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 22,
}

interface ToneTokens {
  /** Outer card gradient. */
  background: string
  /** Border color. */
  border: string
  /** Glow halo behind the card. */
  glow: string
  /** Monogram color. */
  ink: string
}

const TONE_TOKENS: Record<'warm' | 'calm' | 'duo', ToneTokens> = {
  warm: {
    background:
      'linear-gradient(150deg, rgba(255,107,53,0.22), rgba(255,179,71,0.10) 60%, rgba(13,17,23,0.0))',
    border: 'rgba(255,107,53,0.45)',
    glow: '0 0 18px -4px rgba(255,107,53,0.45)',
    ink: 'var(--orange)',
  },
  calm: {
    background:
      'linear-gradient(150deg, rgba(167,139,250,0.18), rgba(79,195,247,0.10) 60%, rgba(13,17,23,0.0))',
    border: 'rgba(167,139,250,0.4)',
    glow: '0 0 18px -4px rgba(167,139,250,0.35)',
    ink: 'var(--purple)',
  },
  duo: {
    background:
      'linear-gradient(150deg, rgba(255,107,53,0.18), rgba(167,139,250,0.14) 55%, rgba(79,195,247,0.10))',
    border: 'rgba(255,255,255,0.16)',
    glow: '0 0 18px -4px rgba(255,107,53,0.3)',
    ink: 'var(--text)',
  },
}

function resolveTone(mascot: MascotBadgeMascot, tone: MascotBadgeTone): keyof typeof TONE_TOKENS {
  if (tone !== 'auto') {
    if (tone === 'warm') return 'warm'
    if (tone === 'calm') return 'calm'
  }
  if (mascot === 'bailey') return 'warm'
  if (mascot === 'meiomi') return 'calm'
  return 'duo'
}

function monogramFor(mascot: MascotBadgeMascot): string {
  if (mascot === 'bailey') return 'B'
  if (mascot === 'meiomi') return 'M'
  return 'B·M'
}

function defaultLabel(mascot: MascotBadgeMascot): string {
  if (mascot === 'bailey') return 'Bailey · PawStreak mascot'
  if (mascot === 'meiomi') return 'Meiomi · PawStreak mascot'
  return 'Bailey & Meiomi · PawStreak mascots'
}

export function MascotBadge({
  mascot = 'duo',
  size = 'sm',
  tone = 'auto',
  imageSrc,
  label,
  className,
}: MascotBadgeProps) {
  const px = SIZE_PX[size]
  const radius = RADIUS_PX[size]
  const monogramSize = MONOGRAM_FONT_PX[size]
  const pawSize = PAW_FONT_PX[size]
  const tokens = TONE_TOKENS[resolveTone(mascot, tone)]
  const accessibleLabel = label ?? defaultLabel(mascot)

  const frameStyle: CSSProperties = {
    width: px,
    height: px,
    borderRadius: radius,
    background: tokens.background,
    boxShadow: tokens.glow,
    borderColor: tokens.border,
  }

  return (
    <div
      role='img'
      aria-label={accessibleLabel}
      data-testid={`mascot-badge-${mascot}`}
      data-mascot-size={size}
      className={[
        'relative flex shrink-0 items-center justify-center overflow-hidden border bg-[var(--bg-elevated)]',
        className ?? '',
      ]
        .join(' ')
        .trim()}
      style={frameStyle}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=''
          aria-hidden
          className='absolute inset-0 h-full w-full object-cover'
          style={{ objectPosition: 'center 35%' }}
        />
      ) : (
        <>
          <span
            aria-hidden
            className='absolute -bottom-1 -right-1 select-none opacity-70'
            style={{ fontSize: pawSize, lineHeight: 1, color: tokens.ink }}
          >
            🐾
          </span>
          <span
            aria-hidden
            className='select-none font-[family-name:var(--fd),Fraunces,serif] font-semibold italic leading-none'
            style={{
              color: tokens.ink,
              fontSize: monogramSize,
              letterSpacing: mascot === 'duo' ? '-0.02em' : '0',
            }}
          >
            {monogramFor(mascot)}
          </span>
        </>
      )}
    </div>
  )
}

export default MascotBadge
