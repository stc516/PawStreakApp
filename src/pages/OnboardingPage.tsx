import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from '../hooks/useAppState'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { state, setDogName } = useAppState()
  const [nameInput, setNameInput] = useState(state.dogName === 'Your dog' ? '' : state.dogName)
  const [zipInput, setZipInput] = useState(state.zipCode ?? '')

  useEffect(() => {
    if (state.onboardingComplete) {
      navigate('/app')
    }
  }, [navigate, state.onboardingComplete])

  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, (_, idx) => ({
        id: idx,
        size: (idx % 4) + 1,
        left: (idx * 23) % 100,
        top: (idx * 17) % 100,
        delay: (idx % 6) * 0.4,
        duration: 2 + (idx % 5) * 0.35,
      })),
    [],
  )

  const ctaName = nameInput.trim() || 'Bailey'

  const enterApp = () => {
    setDogName(nameInput, zipInput)
    navigate('/app')
  }

  return (
    <section id='screen-onboard' className='screen active'>
      <div className='ob-radial' />
      <div className='ob-stars'>
        {stars.map((star) => (
          <span
            key={star.id}
            className='star'
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className='ob-content'>
        <div className='app-wordmark'>PawStreak</div>
        <div className='paw-hero'>🐾</div>
        <h1 className='ob-headline'>
          Every adventure
          <br />
          tells a story.
        </h1>
        <p className='ob-sub'>
          Your dog is the main character.
          <br />
          You help them win the day.
        </p>
        <label className='field-label' htmlFor='dog-name-input'>
          Your dog&apos;s name
        </label>
        <input
          id='dog-name-input'
          className='text-input'
          type='text'
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder='Bailey'
          onKeyDown={(event) => {
            if (event.key === 'Enter') enterApp()
          }}
        />
        <label className='field-label' htmlFor='zip-input'>
          ZIP code <span style={{ fontWeight: 400, opacity: 0.85 }}>(optional)</span>
        </label>
        <input
          id='zip-input'
          className='text-input'
          inputMode='numeric'
          autoComplete='postal-code'
          maxLength={5}
          value={zipInput}
          onChange={(event) => setZipInput(event.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder='92109'
          onKeyDown={(event) => {
            if (event.key === 'Enter') enterApp()
          }}
        />
        <p className='ob-zip-note'>
          Local missions match your vibe — leave blank for cozy neighborhood routes everywhere.
        </p>
        <button className='btn-primary' onClick={enterApp}>
          Start {ctaName}&apos;s Story →
        </button>
        <button className='ob-skip' onClick={enterApp}>
          skip for now
        </button>
      </div>
    </section>
  )
}
