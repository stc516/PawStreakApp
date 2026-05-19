import { useCallback, useEffect, useState, type CSSProperties } from 'react'

import { FONT_IMPORT, H } from '../../lib/editorialTheme'
import type { MemoryNarrative, VibeArchetype } from '../../types'

const PLACE_IMAGES: Record<string, string> = {
  salt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  wander: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  pulse: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  wild: 'https://images.unsplash.com/photo-1571173081901-3f839da36ac0?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
}

/** Beat timings (ms) — exhale → still → hero → title → atmosphere → reflection → seal */
const BEAT_MS = [400, 1200, 2000, 2200, 2000, 2800, 1500] as const
const REDUCED_BEAT_MS = [200, 400, 600, 600, 600, 800, 400] as const

interface MemorySealFlowProps {
  narrative: MemoryNarrative
  vibe: VibeArchetype
  onComplete: () => void
}

export function MemorySealFlow({ narrative, vibe, onComplete }: MemorySealFlowProps) {
  const [beat, setBeat] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const timings = reducedMotion ? REDUCED_BEAT_MS : BEAT_MS

  useEffect(() => {
    if (beat >= 7) return
    const delay = timings[beat] ?? 400
    const t = window.setTimeout(() => setBeat((b) => b + 1), delay)
    return () => window.clearTimeout(t)
  }, [beat, timings])

  const showHero = beat >= 2
  const showTitle = beat >= 3
  const showAtmosphere = beat >= 4
  const showReflection = beat >= 5
  const showSeal = beat >= 6
  const showContinue = beat >= 7

  const heroUrl = PLACE_IMAGES[vibe] || PLACE_IMAGES.default

  const fade = useCallback(
    (visible: boolean, delayMs = 0): CSSProperties => ({
      opacity: visible ? 1 : 0,
      transition: reducedMotion
        ? `opacity 300ms ease ${delayMs}ms`
        : `opacity 700ms ease ${delayMs}ms`,
    }),
    [reducedMotion],
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adventure complete"
      data-testid="adventure-complete-modal"
      className="memory-seal-flow"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: H.page,
        backgroundImage: H.pageWash,
        color: H.ink,
        fontFamily: H.sans,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '390px',
        margin: '0 auto',
        left: 0,
        right: 0,
        overflow: 'hidden',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          opacity: beat >= 1 ? 1 : 0,
          transition: 'opacity 800ms ease',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            flex: showContinue ? '0 0 auto' : 1,
            minHeight: showContinue ? '42vh' : '52vh',
            maxHeight: showContinue ? '48vh' : '58vh',
            overflow: 'hidden',
            ...fade(showHero),
          }}
        >
          <img
            src={heroUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: reducedMotion ? 'none' : showHero ? 'scale(1)' : 'scale(1.03)',
              transition: reducedMotion ? 'none' : 'transform 2s ease-out',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(44, 36, 25, 0.55) 0%, rgba(44, 36, 25, 0.08) 45%, transparent 70%)',
            }}
          />
        </div>

        <div style={{ padding: '24px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1
            data-testid="adventure-complete-headline"
            style={{
              fontFamily: H.serif,
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: '0 0 16px',
              ...fade(showTitle),
              transform: showTitle && !reducedMotion ? 'translateY(0)' : 'translateY(8px)',
              transition: reducedMotion
                ? 'opacity 600ms ease'
                : 'opacity 600ms ease, transform 600ms ease',
            }}
          >
            {narrative.emotionalTitle}
          </h1>

          {narrative.atmosphere.length > 0 ? (
            <div style={{ marginBottom: '20px', ...fade(showAtmosphere) }} aria-label="Atmosphere">
              {narrative.atmosphere.map((line, i) => (
                <p
                  key={line}
                  style={{
                    margin: i === 0 ? 0 : '6px 0 0',
                    fontSize: '15px',
                    color: H.muted,
                    lineHeight: 1.45,
                    ...fade(showAtmosphere, i * (reducedMotion ? 0 : 400)),
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          <blockquote
            data-testid="adventure-complete-memory"
            style={{
              margin: 0,
              padding: 0,
              border: 'none',
              fontFamily: H.serif,
              fontSize: '18px',
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: H.inkSoft,
              ...fade(showReflection),
            }}
          >
            {narrative.reflectionSource === 'user'
              ? `“${narrative.reflection}”`
              : narrative.reflection}
          </blockquote>

          <div
            style={{
              marginTop: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              ...fade(showSeal),
            }}
            aria-label="Saved to Journey"
          >
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: H.sageSoft,
                border: `1px solid ${H.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transform: showSeal && !reducedMotion ? 'scale(1)' : 'scale(0.92)',
                transition: 'transform 400ms ease',
              }}
              aria-hidden
            >
              ◎
            </span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: H.sageDeep,
                  letterSpacing: '0.04em',
                }}
              >
                Saved to Journey
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: H.muted }}>{narrative.sealMetadata}</p>
            </div>
          </div>
        </div>
      </div>

      {showContinue ? (
        <div style={{ padding: '0 24px 40px', ...fade(showContinue) }}>
          <button
            type="button"
            className="btn-done"
            onClick={onComplete}
            style={{
              width: '100%',
              height: '52px',
              background: 'transparent',
              border: `1px solid ${H.borderStrong}`,
              borderRadius: '14px',
              color: H.ink,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: H.sans,
            }}
          >
            Continue
          </button>
        </div>
      ) : null}
    </div>
  )
}
