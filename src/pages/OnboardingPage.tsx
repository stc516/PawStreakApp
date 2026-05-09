import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getEnvironmentForCoords } from '../data/zipEnvironments'
import { normalizeZip } from '../data/localAdventureEngine'
import { useAppState } from '../hooks/useAppState'
import { resolveUserEnvironment } from '../lib/resolveUserEnvironment'
import type {
  DogEnergyLevel,
  DogPersonalityId,
  NotificationCadence,
} from '../types'

const TOTAL_STEPS = 8

const PERSONALITY_OPTIONS: { id: DogPersonalityId; label: string }[] = [
  { id: 'social', label: '🐾 The Social Butterfly' },
  { id: 'trail', label: '🌲 The Trail Dog' },
  { id: 'reluctant', label: '🛋️ The Reluctant Explorer' },
  { id: 'chaos', label: '🌀 The Chaos Agent' },
]

const ENERGY_OPTIONS: { id: DogEnergyLevel; label: string }[] = [
  { id: 'endless', label: '🔥 Endless Engine' },
  { id: 'bursts', label: '⚡ Bursts of Chaos' },
  { id: 'steady', label: '🌊 Steady Adventurer' },
  { id: 'selective', label: '🛋️ Selective Explorer' },
]

const OWNER_GOAL_OPTIONS = [
  'Hit the trails',
  'More outside time',
  'Deeper bonding',
  'Explore the city',
  'Build a routine',
  'Exhaust my endless energy dog',
  'Socialize more',
  'New experiences',
] as const

const SAMPLE_ADVENTURES = [
  { emoji: '🐾', title: 'Neighborhood Sniffari', sub: 'Nose-led, no script' },
  { emoji: '☕', title: 'Coffee Crawl', sub: 'Café loop · your blocks' },
  { emoji: '🌅', title: 'Sunset Stroll', sub: 'Salt mist · big horizon' },
] as const

function chipButtonClass(active: boolean) {
  return [
    'rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
    active
      ? 'border-[color:var(--orange)] bg-[color:rgba(255,107,53,0.12)] text-[var(--text)]'
      : 'border-[color:var(--border-md)] bg-[var(--bg-elevated)] text-[var(--text-2)]',
  ].join(' ')
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { state, completeOnboarding } = useAppState()

  const [step, setStep] = useState(1)

  const initialDogName =
    state.dogProfile.name && state.dogProfile.name !== 'Your dog' ? state.dogProfile.name : ''
  const [name, setName] = useState(initialDogName)
  const [breed, setBreed] = useState(state.dogProfile.breed || '')
  const [ageRaw, setAgeRaw] = useState(
    state.dogProfile.age != null ? String(state.dogProfile.age) : '',
  )

  const [personality, setPersonality] = useState<DogPersonalityId[]>([...state.dogProfile.personality])
  const [energyLevel, setEnergyLevel] = useState<DogEnergyLevel | null>(state.dogProfile.energyLevel)
  const [goals, setGoals] = useState<string[]>([...state.ownerProfile.goals])

  const [homeLat, setHomeLat] = useState<number | null>(state.userProfile.homeLat)
  const [homeLng, setHomeLng] = useState<number | null>(state.userProfile.homeLng)
  const [homeZip, setHomeZip] = useState(state.userProfile.homeZip || state.zipCode || '')
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle')

  const [cadence, setCadence] = useState<NotificationCadence>(state.notificationPrefs.cadence)
  const [morningTime, setMorningTime] = useState(state.notificationPrefs.morningTime || '07:00')
  const [eveningTime, setEveningTime] = useState(state.notificationPrefs.eveningTime || '19:00')

  const [googleNote, setGoogleNote] = useState<string | null>(null)

  useEffect(() => {
    if (state.onboardingComplete) {
      navigate('/app')
    }
  }, [navigate, state.onboardingComplete])

  useEffect(() => {
    if (!googleNote) return
    const t = window.setTimeout(() => setGoogleNote(null), 4500)
    return () => window.clearTimeout(t)
  }, [googleNote])

  function togglePersonality(id: DogPersonalityId) {
    setPersonality((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function toggleGoal(g: string) {
    setGoals((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g)
      if (prev.length >= 2) return prev
      return [...prev, g]
    })
  }

  function requestLocation() {
    setGeoStatus('loading')
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setHomeLat(lat)
        setHomeLng(lng)
        const env = getEnvironmentForCoords(lat, lng)
        if (env) setHomeZip(env.zip)
        setGeoStatus('ok')
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 0 },
    )
  }

  const trimmedName = name.trim()
  const dogDisplayLower = trimmedName || 'your dog'
  const dogDisplayUpper = trimmedName || 'Your dog'
  const possessiveUpper = trimmedName ? `${trimmedName}'s` : `Your dog's`

  function canProceed(): boolean {
    if (step === 5) return energyLevel !== null
    if (step === 7) {
      const zipOk = normalizeZip(homeZip).length === 5
      const coordsOk =
        homeLat != null && homeLng != null && Number.isFinite(homeLat) && Number.isFinite(homeLng)
      return coordsOk || zipOk
    }
    return true
  }

  function next() {
    if (!canProceed()) return
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }

  function back() {
    if (step > 1) setStep((s) => s - 1)
  }

  function finish() {
    if (!canProceed()) return
    const ageParsed = ageRaw.trim() === '' ? null : Number.parseInt(ageRaw, 10)
    const age = ageParsed != null && !Number.isNaN(ageParsed) && ageParsed >= 0 ? ageParsed : null

    completeOnboarding({
      dogProfile: {
        name: trimmedName,
        breed: breed.trim(),
        age,
        personality,
        energyLevel,
      },
      ownerProfile: { goals },
      userProfile: {
        homeLat,
        homeLng,
        homeZip: normalizeZip(homeZip),
      },
      notificationPrefs: {
        cadence,
        morningTime,
        eveningTime,
      },
    })
    navigate('/app')
  }

  const zipResolution = resolveUserEnvironment(homeZip)

  const primaryLabel = useMemo(() => {
    if (step === 1) return trimmedName ? `Meet ${trimmedName} →` : `Let's go →`
    if (step === 2) {
      return trimmedName
        ? `Build ${trimmedName}'s adventure profile →`
        : `Build your dog's adventure profile →`
    }
    if (step === TOTAL_STEPS) return 'Start PawStreak'
    return 'Continue'
  }, [step, trimmedName])

  function onPrimary() {
    if (step === TOTAL_STEPS) {
      finish()
    } else {
      next()
    }
  }

  const showStepHeader = step >= 3

  return (
    <section
      className='screen active flex min-h-screen flex-col bg-[var(--bg)] px-5 pb-10 pt-8'
      style={{ fontFamily: 'var(--fb), DM Sans, sans-serif' }}
      data-testid={
        step === 1
          ? 'onboarding-welcome'
          : step === 2
            ? 'first-adventure-intro'
            : step === 3
              ? 'dog-details-step'
              : `onboarding-step-${step}`
      }
    >
      {showStepHeader ? (
        <div className='mb-6 flex items-center justify-between'>
          <span className='text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]'>
            Step {step} of {TOTAL_STEPS}
          </span>
          <button
            type='button'
            className='text-sm text-[var(--text-2)]'
            onClick={back}
            data-testid='onboarding-back-button'
          >
            ← Back
          </button>
        </div>
      ) : null}

      <div className='flex flex-1 flex-col'>
        {step === 1 ? (
          <div className='mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-7 text-center'>
            <div className='text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--text-2)]'>
              PawStreak
            </div>
            <div
              aria-hidden
              className='select-none text-[64px] leading-none drop-shadow-[0_0_22px_var(--orange-glow)]'
            >
              🐺
            </div>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-[28px] font-semibold italic leading-[1.15] text-[var(--text)]'>
              Your dog&apos;s daily adventure starts here.
            </h1>
            <div className='w-full'>
              <label
                htmlFor='dog-name-input'
                className='block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'
              >
                What&apos;s your dog&apos;s name?
              </label>
              <input
                id='dog-name-input'
                data-testid='dog-name-input'
                className='inp mt-2 text-center'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Bailey'
                autoComplete='nickname'
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onPrimary()
                }}
              />
            </div>
            <div className='w-full'>
              <button
                type='button'
                className='btn-primary w-full'
                onClick={onPrimary}
                data-testid='onboarding-primary-button'
              >
                {primaryLabel}
              </button>
              <p className='mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]'>
                Free forever · no credit card
              </p>
            </div>
            <div className='flex w-full items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--text-3)]'>
              <span className='h-px flex-1 bg-[color:var(--border-md)]' />
              <span>or</span>
              <span className='h-px flex-1 bg-[color:var(--border-md)]' />
            </div>
            <button
              type='button'
              data-testid='onboarding-google-button'
              onClick={() => {
                setGoogleNote('Google sign-in coming soon — you can start with your dog for now.')
              }}
              className='flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border-md)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[color:rgba(255,255,255,0.04)]'
            >
              <span aria-hidden className='text-base'>
                G
              </span>
              Continue with Google
            </button>
            {googleNote ? (
              <p
                role='status'
                aria-live='polite'
                className='-mt-2 text-xs text-[var(--text-2)]'
              >
                {googleNote}
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className='flex flex-1 flex-col'>
            <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-2)]'>
              {dogDisplayUpper}
            </div>
            <h1 className='mt-3 font-[family-name:var(--fd),Fraunces,serif] text-[28px] font-semibold italic leading-[1.15] text-[var(--text)]'>
              {possessiveUpper} first adventure is waiting.
            </h1>
            <p className='mt-3 text-sm leading-relaxed text-[var(--text-2)]'>
              PawStreak turns daily walks, coffee runs, patios, parks, trails, and weird little
              neighborhood loops into adventures worth remembering.
            </p>
            <div className='mt-7 flex flex-col gap-3'>
              {SAMPLE_ADVENTURES.map((adv) => (
                <div
                  key={adv.title}
                  className='flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--bg-elevated)] px-4 py-3'
                >
                  <span aria-hidden className='text-2xl leading-none'>
                    {adv.emoji}
                  </span>
                  <div className='min-w-0'>
                    <div className='text-sm font-semibold text-[var(--text)]'>{adv.title}</div>
                    <div className='text-[12px] text-[var(--text-2)]'>{adv.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-[24px] font-semibold italic text-[var(--text)]'>
              {trimmedName
                ? `Tell us a little more about ${trimmedName}.`
                : `Tell us a little more about your dog.`}
            </h1>
            <p className='mt-2 text-sm text-[var(--text-2)]'>All optional — you can edit later.</p>

            {!trimmedName ? (
              <>
                <label
                  htmlFor='dog-name-input-step3'
                  className='mt-6 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'
                >
                  Dog&apos;s name
                </label>
                <input
                  id='dog-name-input-step3'
                  data-testid='dog-name-input'
                  className='inp mt-2'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Bailey'
                  autoComplete='nickname'
                />
              </>
            ) : null}

            <label className='mt-4 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'>
              Breed
            </label>
            <input
              className='inp mt-2'
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder='Breed (optional)'
            />
            <label className='mt-4 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'>
              Age (years)
            </label>
            <input
              className='inp mt-2'
              inputMode='numeric'
              value={ageRaw}
              onChange={(e) => setAgeRaw(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
              placeholder='Optional'
            />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-2xl font-semibold italic text-[var(--text)]'>
              Personality
            </h1>
            <p className='mt-2 text-sm text-[var(--text-2)]'>Pick any that fit — multi-select.</p>
            <div className='mt-6 flex flex-col gap-2'>
              {PERSONALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type='button'
                  className={chipButtonClass(personality.includes(opt.id))}
                  onClick={() => togglePersonality(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-2xl font-semibold italic text-[var(--text)]'>
              Energy level
            </h1>
            <p className='mt-2 text-sm text-[var(--text-2)]'>One vibe today — you can change later.</p>
            <div className='mt-6 flex flex-col gap-2'>
              {ENERGY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type='button'
                  className={chipButtonClass(energyLevel === opt.id)}
                  onClick={() => setEnergyLevel(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-2xl font-semibold italic text-[var(--text)]'>
              Your goals
            </h1>
            <p className='mt-2 text-sm text-[var(--text-2)]'>Choose up to two.</p>
            <div className='mt-6 flex flex-col gap-2'>
              {OWNER_GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  type='button'
                  className={chipButtonClass(goals.includes(g))}
                  onClick={() => toggleGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 7 ? (
          <>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-2xl font-semibold italic text-[var(--text)]'>
              Home base
            </h1>
            <p className='mt-3 text-sm leading-relaxed text-[var(--text-2)]'>
              So adventures feel local and real. Share location (approximate is fine) or enter your ZIP.
            </p>
            <button
              type='button'
              className='btn-primary mt-6'
              onClick={requestLocation}
              disabled={geoStatus === 'loading'}
            >
              {geoStatus === 'loading' ? 'Locating…' : 'Use my location'}
            </button>
            {geoStatus === 'ok' ? (
              <p className='mt-3 text-xs text-[var(--green)]'>
                Location saved{homeZip ? ` · ZIP ${homeZip}` : ''}.
              </p>
            ) : null}
            {geoStatus === 'denied' ? (
              <p className='mt-3 text-xs text-[var(--text-2)]'>Location unavailable — enter ZIP below.</p>
            ) : null}

            <label className='mt-6 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'>
              ZIP code (fallback)
            </label>
            <input
              className='inp mt-2'
              inputMode='numeric'
              value={homeZip}
              onChange={(e) => setHomeZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder='92107'
              autoComplete='postal-code'
            />
            {normalizeZip(homeZip).length === 5 ? (
              zipResolution.source === 'handcrafted' ? (
                <p className='mt-3 text-xs text-[var(--blue)]'>
                  Local tuning ready for {zipResolution.environment.neighborhood}.
                </p>
              ) : (
                <p className='mt-3 text-xs leading-relaxed text-[var(--text-2)]'>
                  {zipResolution.fallbackMessage}
                </p>
              )
            ) : null}
          </>
        ) : null}

        {step === 8 ? (
          <>
            <h1 className='font-[family-name:var(--fd),Fraunces,serif] text-2xl font-semibold italic text-[var(--text)]'>
              How should we keep {dogDisplayLower} on track?
            </h1>
            <div className='mt-6 flex flex-col gap-2'>
              {(
                [
                  ['daily', 'Daily reminder'],
                  ['weekly', 'Weekly plan drop'],
                  ['apponly', 'Just the app'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type='button'
                  className={chipButtonClass(cadence === id)}
                  onClick={() => setCadence(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className='mt-6 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'>
              Best time for morning reminder
            </label>
            <input
              type='time'
              className='inp mt-2'
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
            />
            <label className='mt-4 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]'>
              Best time for evening reminder
            </label>
            <input
              type='time'
              className='inp mt-2'
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
            />
          </>
        ) : null}
      </div>

      {step !== 1 ? (
        <div className='mt-8'>
          <button
            type='button'
            className='btn-primary'
            onClick={onPrimary}
            disabled={!canProceed()}
            data-testid='onboarding-primary-button'
          >
            {primaryLabel}
          </button>
        </div>
      ) : null}
    </section>
  )
}
