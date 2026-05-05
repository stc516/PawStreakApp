import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { missionTimeLabel } from '../data/localAdventureEngine'
import { useAppState } from '../hooks/useAppState'

export function AdventurePage() {
  const navigate = useNavigate()
  const { state, completeAdventure } = useAppState()
  const m = state.generatedMission
  const [walkSeconds, setWalkSeconds] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const interval = window.setInterval(() => {
      setWalkSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [paused])

  const walkTime = useMemo(() => {
    const mins = Math.floor(walkSeconds / 60).toString().padStart(2, '0')
    const secs = (walkSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }, [walkSeconds])

  const walkEnergy = Math.floor((walkSeconds / 60) * 5)
  const walkGround = (walkSeconds * 0.00042).toFixed(2)
  const pace = useMemo(() => {
    const dist = Number.parseFloat(walkGround)
    if (dist <= 0.05) return '—'
    const paceValue = Math.floor((walkSeconds / 60) / dist)
    return paceValue > 0 && paceValue < 99 ? `${paceValue}'` : '—'
  }, [walkGround, walkSeconds])

  const timerOffset = 565 - (565 * Math.min(walkSeconds, 3600)) / 3600

  return (
    <section id='screen-walk' className='screen active'>
      <div className='walk-hdr'>
        <div className='walk-type-lbl'>
          {m.emoji} {m.title}
        </div>
        <div className='walk-dog-lbl'>{state.dogName}&apos;s story is being written...</div>
        <div className='walk-mission-meta'>
          <div className='wm-line'>
            {missionTimeLabel(m)} · {m.locationHint}
          </div>
          <div className='wm-desc'>&ldquo;{m.description}&rdquo;</div>
        </div>
      </div>
      <div className='walk-body'>
        <div className='timer-ring'>
          <svg viewBox='0 0 190 190' width='190' height='190'>
            <circle className='track' cx='95' cy='95' r='87' />
            <circle className='fill' cx='95' cy='95' r='87' style={{ strokeDashoffset: timerOffset }} />
          </svg>
          <div className='timer-center'>
            <div className='timer-time'>{walkTime}</div>
            <div className='timer-xp'>+{walkEnergy} Adventure Energy</div>
          </div>
        </div>
        <div className='walk-stats-row'>
          <div className='wstat'>
            <div className='wstat-val'>{walkGround}</div>
            <div className='wstat-lbl'>Ground covered</div>
          </div>
          <div className='wstat'>
            <div className='wstat-val'>{pace}</div>
            <div className='wstat-lbl'>Pace vibe</div>
          </div>
        </div>
      </div>
      <div className='walk-actions'>
        <button type='button' className='btn-pause' onClick={() => setPaused((value) => !value)}>
          {paused ? '▶' : '⏸'}
        </button>
        <button
          type='button'
          className='btn-end'
          onClick={() => {
            completeAdventure(walkSeconds)
            navigate('/reward')
          }}
        >
          Wrap mission →
        </button>
      </div>
    </section>
  )
}
