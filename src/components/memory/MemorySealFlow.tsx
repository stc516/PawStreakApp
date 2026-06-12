import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'

import { AdventureArtwork, artworkCategoryForLabel } from '../adventure/AdventureArtwork'
import { FONT_IMPORT, H } from '../../lib/editorialTheme'
import { linesOverlap } from '../../lib/memoryNarrative'
import type { MemoryNarrative, VibeArchetype } from '../../types'

/**
 * Sacred-screen beats — one emotional idea visible at a time.
 * 0–1 still · 2 hero · 3 title · 4 atmo₁ · 5 atmo₂ · 6 reflection · 7 seal · 8 metadata · 9 continue
 */
const BEAT_MS = [650, 1500, 3000, 2800, 2200, 2000, 3600, 1600, 1400, 0] as const
const REDUCED_BEAT_MS = [250, 550, 900, 800, 600, 500, 900, 500, 400, 0] as const

const HERO_VH = '72vh'

interface MemorySealFlowProps {
  narrative: MemoryNarrative
  vibe: VibeArchetype
  onComplete: () => void
}

export function MemorySealFlow({ narrative, vibe, onComplete }: MemorySealFlowProps) {
  const [beat, setBeat] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showAnticipation, setShowAnticipation] = useState(false)

  const showReflection =
    narrative.reflection.trim().length > 0 &&
    !narrative.atmosphere.some((line) => linesOverlap(line, narrative.reflection))

  const atmosphereLines = narrative.atmosphere
  const secondAtmo = atmosphereLines.length > 1 ? atmosphereLines[1] : null

  const beatSequence = useMemo(() => {
    const seq: number[] = [0, 1, 2, 3]
    if (atmosphereLines.length > 0) seq.push(4)
    if (secondAtmo) seq.push(5)
    if (showReflection) seq.push(6)
    seq.push(7, 8, 9)
    return seq
  }, [atmosphereLines.length, secondAtmo, showReflection])

  const maxBeat = 9

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const timings = reducedMotion ? REDUCED_BEAT_MS : BEAT_MS

  useEffect(() => {
    if (beat >= maxBeat) return
    const delay = timings[beat] ?? 400
    const t = window.setTimeout(() => {
      setBeat((b) => {
        const idx = beatSequence.indexOf(b)
        if (idx < 0 || idx >= beatSequence.length - 1) return Math.min(b + 1, maxBeat)
        return beatSequence[idx + 1] ?? maxBeat
      })
    }, delay)
    return () => window.clearTimeout(t)
  }, [beat, timings, beatSequence, maxBeat])

  useEffect(() => {
    if (beat !== 9) return
    const t = window.setTimeout(() => setShowAnticipation(true), reducedMotion ? 300 : 900)
    return () => {
      window.clearTimeout(t)
      setShowAnticipation(false)
    }
  }, [beat, reducedMotion])

  const advanceBeat = useCallback(() => {
    setBeat((b) => {
      const idx = beatSequence.indexOf(b)
      if (idx < 0 || idx >= beatSequence.length - 1) return maxBeat
      return beatSequence[idx + 1] ?? maxBeat
    })
  }, [beatSequence, maxBeat])

  const skipToEnd = useCallback(() => {
    setBeat(9)
  }, [])

  const canTapAdvance = beat >= 3 && beat < 9
  const canSkip = beat >= 4 && beat < 9

  const heroCategory = artworkCategoryForLabel(
    `${narrative.emotionalTitle} ${narrative.sealMetadata}`,
    vibe,
  )

  const fade = useCallback(
    (active: boolean): CSSProperties => ({
      opacity: active ? 1 : 0,
      transition: reducedMotion ? 'opacity 400ms ease' : 'opacity 900ms ease',
      pointerEvents: active ? 'auto' : 'none',
    }),
    [reducedMotion],
  )

  const stageBase: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 28px',
    boxSizing: 'border-box',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Memory"
      data-testid="adventure-complete-modal"
      className="memory-seal-flow"
      onClick={canTapAdvance ? advanceBeat : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: H.page,
        backgroundImage: H.pageWash,
        color: H.ink,
        fontFamily: H.sans,
        maxWidth: '390px',
        margin: '0 auto',
        left: 0,
        right: 0,
        overflow: 'hidden',
        cursor: canTapAdvance ? 'pointer' : 'default',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      {canSkip ? (
        <button
          type="button"
          data-testid="memory-seal-skip"
          onClick={(e) => {
            e.stopPropagation()
            skipToEnd()
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            zIndex: 90,
            background: 'transparent',
            border: 'none',
            color: H.muted,
            opacity: 0.45,
            fontSize: '12px',
            fontWeight: 400,
            cursor: 'pointer',
            fontFamily: H.sans,
            padding: '8px',
            letterSpacing: '0.02em',
          }}
        >
          Skip
        </button>
      ) : null}

      <div style={{ position: 'absolute', inset: 0, width: '100%' }}>
        {/* Beat 0–1: stillness — cream only */}
        <div
          aria-hidden
          style={{
            ...stageBase,
            ...fade(beat <= 1),
            background: H.page,
            backgroundImage: H.pageWash,
          }}
        />

        {/* Beat 2: hero only — edge-to-edge, immersive */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            ...fade(beat === 2),
            padding: 0,
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: HERO_VH,
              minHeight: HERO_VH,
              overflow: 'hidden',
            }}
          >
            <AdventureArtwork
              category={heroCategory}
              size={360}
              rounded={0}
              label={narrative.emotionalTitle}
              animated={!reducedMotion}
              style={{
                width: '100%',
                height: '100%',
                transform: reducedMotion ? 'none' : 'scale(1.02)',
                transition: reducedMotion ? 'none' : 'transform 3s ease-out',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, transparent 40%, rgba(44, 36, 25, 0.12) 100%)',
              }}
            />
          </div>
        </div>

        {/* Beat 3: title only */}
        <div style={{ ...stageBase, ...fade(beat === 3) }}>
          <h1
            data-testid="adventure-complete-headline"
            style={{
              fontFamily: H.serif,
              fontSize: '34px',
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              textAlign: 'center',
              letterSpacing: '-0.02em',
              color: H.ink,
              maxWidth: '340px',
            }}
          >
            {narrative.emotionalTitle}
          </h1>
        </div>

        {/* Beat 4: first atmosphere line only */}
        {atmosphereLines[0] ? (
          <div style={{ ...stageBase, ...fade(beat === 4) }} aria-label="Atmosphere">
            <p
              style={{
                margin: 0,
                fontSize: '17px',
                color: H.muted,
                lineHeight: 1.5,
                textAlign: 'center',
                maxWidth: '300px',
                fontFamily: H.sans,
              }}
            >
              {atmosphereLines[0]}
            </p>
          </div>
        ) : null}

        {/* Beat 5: second atmosphere line only */}
        {secondAtmo ? (
          <div style={{ ...stageBase, ...fade(beat === 5) }} aria-hidden>
            <p
              style={{
                margin: 0,
                fontSize: '17px',
                color: H.muted,
                lineHeight: 1.5,
                textAlign: 'center',
                maxWidth: '300px',
              }}
            >
              {secondAtmo}
            </p>
          </div>
        ) : null}

        {/* Beat 6: reflection only — sacred */}
        {showReflection ? (
          <div style={{ ...stageBase, ...fade(beat === 6), padding: '0 32px' }}>
            <blockquote
              data-testid="adventure-complete-memory"
              style={{
                margin: 0,
                padding: 0,
                border: 'none',
                fontFamily: H.serif,
                fontSize: '22px',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.55,
                color: H.inkSoft,
                textAlign: 'center',
                maxWidth: '320px',
              }}
            >
              {narrative.reflectionSource === 'user'
                ? `“${narrative.reflection}”`
                : narrative.reflection}
            </blockquote>
          </div>
        ) : (
          <div
            data-testid="adventure-complete-memory"
            style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}
            aria-hidden
          >
            {narrative.reflection}
          </div>
        )}

        {/* Beat 7: seal whisper — text only */}
        <div
          style={{ ...stageBase, ...fade(beat === 7) }}
          aria-label="Saved to Journey"
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 500,
              color: H.muted,
              letterSpacing: '0.08em',
              textTransform: 'lowercase',
              fontFamily: H.sans,
            }}
          >
            saved to journey
          </p>
        </div>

        {/* Beat 8: metadata — delayed, quieter */}
        <div style={{ ...stageBase, ...fade(beat === 8) }}>
          <p
            data-testid="memory-seal-metadata"
            style={{
              margin: 0,
              fontSize: '11px',
              color: H.muted,
              opacity: 0.85,
              letterSpacing: '0.04em',
              fontFamily: H.sans,
            }}
          >
            {narrative.sealMetadata}
          </p>
        </div>
      </div>

      {/* Beat 9: continue — dialog root, always in viewport */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 28px max(40px, env(safe-area-inset-bottom, 24px))',
          boxSizing: 'border-box',
          ...fade(beat === 9),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
            type="button"
            data-testid="memory-seal-continue"
            onClick={onComplete}
            style={{
              width: 'auto',
              height: 'auto',
              background: 'transparent',
              border: 'none',
              color: H.inkSoft,
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: H.sans,
              padding: '12px 16px',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(74, 64, 54, 0.35)',
              textUnderlineOffset: '4px',
              boxShadow: 'none',
            }}
          >
            Continue
          </button>
          {showAnticipation && narrative.anticipationLine ? (
            <p
              data-testid="memory-seal-anticipation"
              style={{
                margin: '20px 0 0',
                fontSize: '13px',
                lineHeight: 1.5,
                color: H.muted,
                textAlign: 'center',
                fontStyle: 'italic',
                fontFamily: H.serif,
                maxWidth: '300px',
                opacity: 0.9,
              }}
            >
              {narrative.anticipationLine}
            </p>
        ) : null}
      </div>
    </div>
  )
}
