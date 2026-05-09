import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '../hooks/useAppState'
import type { VibeArchetype } from '../types'

const VIBE_LABEL: Record<VibeArchetype, string> = {
  pulse: 'Neighborhood adventure',
  wander: 'Park adventure',
  salt: 'Shore adventure',
  wild: 'Explore adventure',
}

const VIBE_EMOJI: Record<VibeArchetype, string> = {
  pulse: '🏡',
  wander: '🌳',
  salt: '🌊',
  wild: '🗺️',
}

export function CharacterMomentPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const latest = state.latestCompletedAdventure
  const energy = latest?.adventureEnergy ?? 0
  const vibe = (latest?.vibe ?? 'pulse') as VibeArchetype
  const [displayEnergy, setDisplayEnergy] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!latest) {
      const id = window.setTimeout(() => navigate('/app', { replace: true }), 120)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [latest, navigate])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  // Animate Adventure XP count up
  useEffect(() => {
    if (energy <= 0) return undefined
    const duration = 1000
    const steps = 40
    const increment = energy / steps
    let current = 0
    const timer = window.setInterval(() => {
      current += increment
      if (current >= energy) {
        setDisplayEnergy(energy)
        window.clearInterval(timer)
      } else {
        setDisplayEnergy(Math.floor(current))
      }
    }, duration / steps)
    return () => window.clearInterval(timer)
  }, [energy])

  // Auto-advance after 2.5 seconds
  useEffect(() => {
    if (!latest) return undefined
    const timer = window.setTimeout(() => {
      navigate('/reward')
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [navigate, latest])

  if (!latest) {
    return null
  }

  return (
    <section
      className={`character-moment-screen ${visible ? 'visible' : ''}`}
      onClick={() => navigate('/reward')}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 50,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <div
        className='character-moment-char'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem',
          animation: visible ? 'characterBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
      >
        <span
          style={{
            fontSize: '72px',
            lineHeight: 1,
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))',
          }}
          aria-hidden
        >
          🐕
        </span>
        <span
          style={{
            fontSize: '40px',
            lineHeight: 1,
            marginTop: '4px',
          }}
          aria-hidden
        >
          {VIBE_EMOJI[vibe]}
        </span>
      </div>

      <p
        style={{
          color: 'var(--blue)',
          fontSize: '12px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 700,
          margin: 0,
        }}
      >
        {VIBE_LABEL[vibe]}
      </p>

      <p
        style={{
          color: 'var(--text)',
          fontFamily: "'Fraunces', serif",
          fontSize: '28px',
          margin: '10px 0 0',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        Nice work, {state.dogName}!
      </p>

      <div
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <span
          style={{
            color: 'var(--gold)',
            fontSize: '52px',
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: "'Fraunces', serif",
          }}
        >
          +{displayEnergy}
        </span>
        <span
          style={{
            color: 'var(--text-2)',
            fontSize: '13px',
            display: 'block',
            marginTop: '8px',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          Adventure XP
        </span>
      </div>

      <p
        style={{
          color: 'var(--text-3)',
          fontSize: '12px',
          marginTop: '2.5rem',
        }}
      >
        Tap to continue
      </p>
    </section>
  )
}
