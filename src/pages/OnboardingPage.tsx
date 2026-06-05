import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getEnvironmentForCoords } from '../data/zipEnvironments'
import { normalizeZip } from '../data/localAdventureEngine'
import { getLocalMarketForZip } from '../data/localSpots/markets'
import { useAppState } from '../hooks/useAppState'
import { track } from '../lib/analytics'
import { FONT_IMPORT } from '../lib/editorialTheme'
import { createLocationExpansionRequest } from '../lib/locationExpansionRequests'
import {
  geocodeLocationQuery,
  reverseGeocodeCoords,
  type GeocodedLocation,
} from '../lib/mapboxGeocoding'
import { resolveUserEnvironment } from '../lib/resolveUserEnvironment'
import type {
  DogEnergyLevel,
  DogPersonalityId,
  NotificationCadence,
} from '../types'

const TOTAL_STEPS = 8

const PERSONALITY_OPTIONS: { id: DogPersonalityId; label: string; emoji: string; desc: string }[] = [
  { id: 'social', label: 'Social Butterfly', emoji: '🐾', desc: 'Busy parks, tail wags, new friends' },
  { id: 'trail', label: 'Trail Dog', emoji: '🌲', desc: 'Untrodden paths, dense forests, new scents' },
  { id: 'reluctant', label: 'Cozy Companion', emoji: '🛋️', desc: 'Short loops followed by warm naps' },
  { id: 'chaos', label: 'Chaos Agent', emoji: '🌀', desc: 'Spontaneous, unpredictable, full-tilt fun' },
]

const ENERGY_OPTIONS: { id: DogEnergyLevel; label: string; emoji: string; desc: string }[] = [
  { id: 'endless', label: 'Endless Engine', emoji: '🔥', desc: "Born to run, doesn't know quit" },
  { id: 'bursts', label: 'Bursts of Chaos', emoji: '⚡', desc: '100% intensity then crash landings' },
  { id: 'steady', label: 'Steady Adventurer', emoji: '🌊', desc: 'Built for the long haul' },
  { id: 'selective', label: 'Selective Explorer', emoji: '🛋️', desc: 'Curates every outing carefully' },
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

const CADENCE_OPTIONS: { id: NotificationCadence; emoji: string; label: string; desc: string }[] = [
  { id: 'daily', emoji: '🌅', label: 'Daily reminder', desc: 'Morning & evening nudges' },
  { id: 'weekly', emoji: '📅', label: 'Weekly plan drop', desc: 'A curated week of adventures' },
  { id: 'apponly', emoji: '🐾', label: 'Just the app', desc: "I'll explore on my own terms" },
]

// Maps step number to one of 4 visual sections
function stepToSection(step: number): number {
  if (step === 1) return 1
  if (step <= 3) return 2
  if (step <= 6) return 3
  return 4
}

const STITCH_CSS = `
${FONT_IMPORT}

#ob-root {
  background: #FAF7F2;
  color: #2C2419;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  min-height: 100dvh;
}

/* ── Hero section (step 1) ── */
.ob-hero-bg {
  background: linear-gradient(150deg,
    #E8BFA0 0%,
    #C9967A 20%,
    #9AB8A0 55%,
    #5C7A6B 100%
  );
  position: relative;
  overflow: hidden;
}
.ob-hero-orb-1 {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  top: -60px;
  right: -60px;
  filter: blur(1px);
}
.ob-hero-orb-2 {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(198, 123, 92, 0.18);
  bottom: 20px;
  left: -40px;
  filter: blur(2px);
}
.ob-hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, transparent 0%, #FAF7F2 100%);
}

/* ── Glass panels ── */
.ob-glass {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.55);
}

/* ── Gradient backgrounds for inner steps ── */
.ob-radial-sage {
  background: radial-gradient(circle at 85% 8%, rgba(92, 122, 107, 0.09) 0%, #FAF7F2 55%);
}
.ob-radial-terra {
  background: radial-gradient(circle at 20% 10%, rgba(198, 123, 92, 0.07) 0%, #FAF7F2 55%);
}

/* ── Section progress pills ── */
.ob-section-pill {
  height: 4px;
  border-radius: 2px;
  background: rgba(44, 36, 25, 0.10);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.ob-section-pill-active {
  background: #5C7A6B;
}
.ob-section-pill-done {
  background: rgba(92, 122, 107, 0.35);
}

/* ── Primary CTA button ── */
.ob-cta {
  width: 100%;
  height: 56px;
  background: #5C7A6B;
  color: #FFFFFF;
  border: none;
  border-radius: 9999px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(92, 122, 107, 0.30);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.ob-cta:hover { transform: scale(1.015); box-shadow: 0 10px 32px rgba(92, 122, 107, 0.36); }
.ob-cta:active { transform: scale(0.975); }
.ob-cta:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ── Floating-label inputs ── */
.ob-field {
  position: relative;
  margin-top: 28px;
}
.ob-field-label {
  position: absolute;
  top: -10px;
  left: 14px;
  padding: 0 6px;
  background: #FFFFFF;
  color: #5C7A6B;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  border-radius: 4px;
  z-index: 1;
  pointer-events: none;
}
.ob-field-label-onpage {
  background: #FAF7F2;
}
.ob-inp {
  width: 100%;
  height: 56px;
  background: #FFFFFF;
  border: 1.5px solid rgba(44, 36, 25, 0.12);
  border-radius: 16px;
  padding: 0 20px;
  color: #2C2419;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.ob-inp-center { text-align: center; }
.ob-inp::placeholder { color: #9A8E82; }
.ob-inp:focus {
  border-color: #5C7A6B;
  box-shadow: 0 0 0 3px rgba(92, 122, 107, 0.14);
}
.ob-inp-sm {
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
}
.ob-inp-time {
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  padding: 0 16px;
}

/* ── Adventure personality / energy bento cards ── */
.ob-bento-card {
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255, 255, 255, 0.75);
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(44, 36, 25, 0.05);
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}
.ob-bento-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 36px rgba(44, 36, 25, 0.08);
}
.ob-bento-card-active {
  border-color: #5C7A6B !important;
  background: rgba(92, 122, 107, 0.11) !important;
}
.ob-bento-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(92, 122, 107, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1;
  margin-bottom: 2px;
}
.ob-bento-card-active .ob-bento-icon {
  background: rgba(92, 122, 107, 0.18);
}

/* ── Scrapbook preview cards (step 2) ── */
.ob-scrapbook-card {
  background: #FFFFFF;
  border: 1px solid rgba(44, 36, 25, 0.07);
  box-shadow: 0 4px 20px rgba(44, 36, 25, 0.06);
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
}

/* ── Goal chips ── */
.ob-chip {
  background: #FFFFFF;
  border: 1.5px solid rgba(44, 36, 25, 0.10);
  border-radius: 12px;
  padding: 11px 14px;
  color: #4A4036;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}
.ob-chip:hover { border-color: rgba(92, 122, 107, 0.35); background: #FFFCF8; }
.ob-chip-active {
  border-color: #5C7A6B !important;
  background: rgba(92, 122, 107, 0.10) !important;
  color: #2C2419 !important;
  font-weight: 600;
}

/* ── Cadence cards (step 8) ── */
.ob-cadence-card {
  background: #FFFFFF;
  border: 1.5px solid rgba(44, 36, 25, 0.10);
  border-radius: 16px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}
.ob-cadence-card:hover { border-color: rgba(92, 122, 107, 0.30); }
.ob-cadence-card-active {
  border-color: #5C7A6B !important;
  background: rgba(92, 122, 107, 0.09) !important;
}

/* ── Location card ── */
.ob-location-card {
  background: #FFFFFF;
  border: 1.5px solid rgba(44, 36, 25, 0.09);
  border-radius: 24px;
  box-shadow: 0 10px 32px rgba(44, 36, 25, 0.06);
  padding: 24px;
}

/* ── Google button ── */
.ob-google {
  width: 100%;
  height: 52px;
  background: #FFFFFF;
  border: 1.5px solid rgba(44, 36, 25, 0.12);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #2C2419;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.ob-google:hover { background: #FFFDF9; }

/* ── Location button ── */
.ob-location-btn {
  width: 100%;
  height: 52px;
  background: rgba(92, 122, 107, 0.10);
  border: 1.5px solid rgba(92, 122, 107, 0.22);
  border-radius: 14px;
  color: #4A6359;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ob-location-btn:hover { background: rgba(92, 122, 107, 0.16); }
.ob-location-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Typography helpers ── */
.ob-serif {
  font-family: 'Literata', Georgia, 'Times New Roman', serif;
  font-weight: 600;
}
.ob-terra { color: #C67B5C; }
.ob-sage { color: #5C7A6B; }
.ob-muted { color: #7A6E62; }
.ob-soft { color: #4A4036; }
.ob-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(198, 123, 92, 0.12);
  color: #C67B5C;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
`

function SectionPills({ step }: { step: number }) {
  const section = stepToSection(step)
  return (
    <div className='flex items-center justify-center gap-2' aria-hidden>
      {[1, 2, 3, 4].map((s) => (
        <span
          key={s}
          className={[
            'ob-section-pill',
            s === section
              ? 'ob-section-pill-active'
              : s < section
                ? 'ob-section-pill-done'
                : '',
          ].join(' ')}
          style={{ width: s === section ? 48 : 24 }}
        />
      ))}
    </div>
  )
}

function StepHeader({
  step,
  onBack,
  sectionLabel,
}: {
  step: number
  onBack: () => void
  sectionLabel: string
}) {
  return (
    <div className='mb-8'>
      <SectionPills step={step} />
      <div className='mt-4 flex items-center justify-between'>
        <span className='ob-terra' style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {sectionLabel}
        </span>
        <button
          type='button'
          className='ob-muted text-sm font-semibold'
          onClick={onBack}
          data-testid='onboarding-back-button'
        >
          ← Back
        </button>
      </div>
    </div>
  )
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
  const [homeLocationLabel, setHomeLocationLabel] = useState(state.userProfile.homeLocationLabel || '')
  const [locationQuery, setLocationQuery] = useState(
    state.userProfile.homeLocationLabel || state.userProfile.homeZip || state.zipCode || '',
  )
  const [geocodedLocation, setGeocodedLocation] = useState<GeocodedLocation | null>(null)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle')

  const [cadence, setCadence] = useState<NotificationCadence>(state.notificationPrefs.cadence)
  const [morningTime, setMorningTime] = useState(state.notificationPrefs.morningTime || '07:00')
  const [eveningTime, setEveningTime] = useState(state.notificationPrefs.eveningTime || '19:00')

  const [googleNote, setGoogleNote] = useState<string | null>(null)

  const startedFiredRef = useRef(false)
  const dogCreatedFiredRef = useRef(false)
  const lastZipReportedRef = useRef<string>('')

  useEffect(() => {
    if (state.onboardingComplete) {
      navigate('/app')
      return
    }
    if (!startedFiredRef.current) {
      startedFiredRef.current = true
      track('onboarding_started', { onboarding_step: 1 })
    }
  }, [navigate, state.onboardingComplete])

  useEffect(() => {
    if (!googleNote) return
    const t = window.setTimeout(() => setGoogleNote(null), 4500)
    return () => window.clearTimeout(t)
  }, [googleNote])

  useEffect(() => {
    if (step !== 7) return
    const normalized = normalizeZip(homeZip)
    if (normalized.length !== 5) return
    if (lastZipReportedRef.current === normalized) return
    lastZipReportedRef.current = normalized
    const resolution = resolveUserEnvironment(normalized)
    if (resolution.source === 'handcrafted') {
      track('zip_supported_entered', {
        environment_primary: resolution.environment.environmentPrimary,
      })
    } else {
      track('zip_unsupported_entered', {})
    }
  }, [homeZip, step])

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

  async function applyGeocodedLocation(location: GeocodedLocation) {
    setGeocodedLocation(location)
    setHomeLat(location.lat)
    setHomeLng(location.lng)
    setHomeZip(location.zip)
    setHomeLocationLabel(location.label)
    setLocationMessage(
      location.supportedMarket
        ? `Local tuning ready for ${location.city || location.label}.`
        : 'Adventures built for your neighborhood — walks, parks, and fresh-air missions nearby.',
    )
  }

  async function resolveTypedLocation(): Promise<GeocodedLocation | null> {
    const query = locationQuery.trim()
    if (!query) return null

    const result = await geocodeLocationQuery(query)
    if (result.ok) {
      await applyGeocodedLocation(result.location)
      return result.location
    }

    const zip = normalizeZip(query)
    if (zip) {
      const localMarket = getLocalMarketForZip(zip)
      setHomeZip(zip)
      setHomeLocationLabel(zip)
      setLocationMessage(
        localMarket && result.reason === 'missing_token'
          ? `Local tuning ready for ${localMarket.name}.`
          : result.reason === 'missing_token'
          ? 'Adventures built for your neighborhood — walks, parks, and fresh-air missions nearby.'
          : 'Could not verify that ZIP with Mapbox, so we’ll keep this generic for now.',
      )
      return null
    }

    setHomeZip('')
    setHomeLocationLabel(query)
    setLocationMessage('We’ll keep this generic for now and add your region to our expansion list.')
    return null
  }

  async function requestLocation() {
    setGeoStatus('loading')
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setHomeLat(lat)
        setHomeLng(lng)
        const result = await reverseGeocodeCoords(lat, lng)
        if (result.ok) {
          await applyGeocodedLocation(result.location)
          setLocationQuery(result.location.label || result.location.zip)
        } else {
          const env = getEnvironmentForCoords(lat, lng)
          if (env) {
            setHomeZip(env.zip)
            setLocationQuery(env.zip)
            setHomeLocationLabel(env.neighborhood)
          }
        }
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
      const queryOk = locationQuery.trim().length >= 3
      const coordsOk =
        homeLat != null && homeLng != null && Number.isFinite(homeLat) && Number.isFinite(homeLng)
      return coordsOk || zipOk || queryOk
    }
    return true
  }

  function next() {
    if (!canProceed()) return
    if (step === 1 && trimmedName && !dogCreatedFiredRef.current) {
      dogCreatedFiredRef.current = true
      track('dog_profile_created', {
        has_breed: breed.trim().length > 0,
        has_age: ageRaw.trim().length > 0,
      })
    }
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }

  function back() {
    if (step > 1) setStep((s) => s - 1)
  }

  async function finish() {
    if (!canProceed()) return
    const ageParsed = ageRaw.trim() === '' ? null : Number.parseInt(ageRaw, 10)
    const age = ageParsed != null && !Number.isNaN(ageParsed) && ageParsed >= 0 ? ageParsed : null
    const resolvedLocation = await resolveTypedLocation()
    const finalZip = normalizeZip(resolvedLocation?.zip || homeZip)
    const supportedMarket =
      resolvedLocation?.supportedMarket ??
      geocodedLocation?.supportedMarket ??
      (resolvedLocation ? null : getLocalMarketForZip(finalZip)?.id ?? null)
    const finalResolution = resolveUserEnvironment(finalZip)
    const zipSupported = supportedMarket !== null

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
        homeLat: resolvedLocation?.lat ?? homeLat,
        homeLng: resolvedLocation?.lng ?? homeLng,
        homeZip: finalZip,
        homeLocationLabel: resolvedLocation?.label ?? homeLocationLabel ?? locationQuery.trim(),
        homeSupportedMarket: supportedMarket,
        homeGeocodeSource: resolvedLocation ? 'mapbox' : finalZip ? 'manual_zip' : null,
      },
      notificationPrefs: {
        cadence,
        morningTime,
        eveningTime,
      },
    })
    track('onboarding_completed', {
      reminder_cadence: cadence,
      zip_supported: zipSupported,
      environment_primary: finalResolution.environment.environmentPrimary,
      supported_market: supportedMarket,
    })
    if (!supportedMarket) {
      void createLocationExpansionRequest({
        locationQuery: locationQuery.trim() || finalZip,
        geocodedLocation: resolvedLocation,
        source: 'onboarding',
      })
    }
    navigate('/app')
  }

  const zipResolution = resolveUserEnvironment(homeZip)
  const zipMarketFallback = getLocalMarketForZip(homeZip)

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
      void finish()
    } else {
      next()
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STITCH_CSS }} />

      <div
        id='ob-root'
        data-testid={
          step === 1
            ? 'onboarding-welcome'
            : step === 2
              ? 'first-adventure-intro'
              : step === 3
                ? 'dog-details-step'
                : `onboarding-step-${step}`
        }
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >

        {/* ─── STEP 1: Welcome ─────────────────────────────────── */}
        {step === 1 ? (
          <div className='flex flex-col min-h-[100dvh]'>
            {/* Hero visual */}
            <div className='ob-hero-bg' style={{ height: '44vh', minHeight: 220, flexShrink: 0 }}>
              <div className='ob-hero-orb-1' />
              <div className='ob-hero-orb-2' />
              <div className='ob-hero-fade' />
              {/* Branding + icon */}
              <div className='absolute top-10 left-0 right-0 flex flex-col items-center gap-3 z-10'>
                <span
                  className='ob-terra'
                  style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase' }}
                >
                  PawStreak
                </span>
                <div
                  aria-hidden
                  style={{
                    fontSize: 72,
                    lineHeight: 1,
                    filter: 'drop-shadow(0 12px 32px rgba(198,123,92,0.35))',
                    userSelect: 'none',
                  }}
                >
                  🐾
                </div>
              </div>
            </div>

            {/* Content panel — overlaps hero with rounded top */}
            <div
              className='ob-glass flex flex-1 flex-col px-6 pb-8'
              style={{
                borderRadius: '32px 32px 0 0',
                marginTop: -32,
                paddingTop: 32,
              }}
            >
              <div className='mx-auto w-full max-w-md flex flex-1 flex-col gap-6'>
                {/* Badge + headline */}
                <div className='flex flex-col items-center text-center gap-3'>
                  <span className='ob-badge'>New Journey</span>
                  <h1
                    className='ob-serif'
                    style={{ fontSize: 26, lineHeight: '1.2', color: '#2C2419' }}
                  >
                    Who are we adventuring with first?
                  </h1>
                  <p className='ob-muted text-sm leading-relaxed'>
                    A warm place for walks, adventures, and memories you'll want to keep.
                  </p>
                </div>

                {/* Dog name input */}
                <div>
                  <label
                    htmlFor='dog-name-input'
                    className='ob-sage block mb-2'
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}
                  >
                    Dog's name
                  </label>
                  <input
                    id='dog-name-input'
                    data-testid='dog-name-input'
                    className='ob-inp ob-inp-center'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Bailey'
                    autoComplete='nickname'
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') onPrimary() }}
                  />
                  <p className='ob-muted text-center mt-2' style={{ fontSize: 11, letterSpacing: '0.06em' }}>
                    You can add more dogs later
                  </p>
                </div>

                {/* CTA */}
                <div className='flex flex-col gap-3'>
                  <button
                    type='button'
                    className='ob-cta'
                    onClick={onPrimary}
                    data-testid='onboarding-primary-button'
                  >
                    {primaryLabel}
                  </button>
                  <p className='ob-muted text-center' style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Free forever · no credit card
                  </p>
                </div>

                {/* Divider */}
                <div className='flex items-center gap-3' style={{ color: '#9A8E82', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                  <span className='flex-1' style={{ height: 1, background: 'rgba(44,36,25,0.10)' }} />
                  <span>or</span>
                  <span className='flex-1' style={{ height: 1, background: 'rgba(44,36,25,0.10)' }} />
                </div>

                {/* Google button */}
                <button
                  type='button'
                  className='ob-google'
                  data-testid='onboarding-google-button'
                  onClick={() => {
                    setGoogleNote('Google sign-in coming soon — you can start with your dog for now.')
                  }}
                >
                  <svg width='18' height='18' viewBox='0 0 24 24' aria-hidden>
                    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
                    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
                    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
                    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
                  </svg>
                  Continue with Google
                </button>

                {googleNote ? (
                  <p role='status' aria-live='polite' className='ob-muted text-center text-xs -mt-2'>
                    {googleNote}
                  </p>
                ) : null}

                {/* Terms */}
                <p className='ob-muted text-center' style={{ fontSize: 11, letterSpacing: '0.06em' }}>
                  By continuing you agree to our{' '}
                  <Link to='/terms' className='ob-sage' style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    Terms
                  </Link>{' '}
                  &amp;{' '}
                  <Link to='/privacy' className='ob-sage' style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    Privacy
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 2: First adventure intro ───────────────────── */}
        {step === 2 ? (
          <div className='ob-radial-sage flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'>
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Companion Profile' />

              <div className='ob-terra mb-1' style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {dogDisplayUpper}
              </div>
              <h1
                className='ob-serif'
                style={{ fontSize: 26, lineHeight: '1.2', color: '#2C2419', marginTop: 8 }}
              >
                {possessiveUpper} first adventure is waiting.
              </h1>
              <p className='ob-soft text-sm leading-relaxed mt-3'>
                Walks, coffee runs, patios, parks, and neighborhood loops — turned into a story you
                build together, one day at a time.
              </p>

              {/* Scrapbook adventure cards */}
              <div className='mt-8 flex flex-col gap-3'>
                {SAMPLE_ADVENTURES.map((adv, index) => (
                  <div
                    key={adv.title}
                    className='ob-scrapbook-card'
                    style={{ transform: `rotate(${index % 2 === 0 ? '-0.5deg' : '0.4deg'})` }}
                  >
                    <span aria-hidden className='text-2xl leading-none shrink-0'>
                      {adv.emoji}
                    </span>
                    <div className='min-w-0'>
                      <div className='font-semibold text-sm' style={{ color: '#2C2419' }}>
                        {adv.title}
                      </div>
                      <div className='ob-muted' style={{ fontSize: 12 }}>
                        {adv.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-auto pt-8'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 3: Dog details (companion profile) ─────────── */}
        {step === 3 ? (
          <div className='ob-radial-sage flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'>
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Companion Profile' />

              <h1
                className='ob-serif'
                style={{ fontSize: 24, lineHeight: '1.25', color: '#2C2419' }}
              >
                {trimmedName
                  ? `Build ${trimmedName}'s adventure profile.`
                  : `Build your dog's adventure profile.`}
              </h1>
              <p className='ob-muted text-sm mt-2'>All optional — you can edit anytime.</p>

              {/* If no name yet, show name input */}
              {!trimmedName ? (
                <div className='ob-field'>
                  <span className='ob-field-label ob-field-label-onpage'>Dog's name</span>
                  <input
                    data-testid='dog-name-input'
                    className='ob-inp'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Bailey'
                    autoComplete='nickname'
                  />
                </div>
              ) : null}

              <div className='ob-field'>
                <span className='ob-field-label ob-field-label-onpage'>Breed</span>
                <input
                  className='ob-inp'
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder='e.g. Golden Retriever (optional)'
                />
              </div>

              <div className='ob-field'>
                <span className='ob-field-label ob-field-label-onpage'>Age (years)</span>
                <input
                  className='ob-inp'
                  inputMode='numeric'
                  value={ageRaw}
                  onChange={(e) => setAgeRaw(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  placeholder='Optional'
                />
              </div>

              <div className='mt-auto pt-8'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  disabled={!canProceed()}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 4: Personality (adventure style bento) ──────── */}
        {step === 4 ? (
          <div className='ob-radial-sage flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'>
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Adventure Style' />

              <h1
                className='ob-serif'
                style={{ fontSize: 24, lineHeight: '1.25', color: '#2C2419' }}
              >
                What kind of adventures does{' '}
                <span className='ob-terra italic'>{dogDisplayLower}</span> love most?
              </h1>
              <p className='ob-muted text-sm mt-2 mb-7'>
                Pick any that fit — helps us tailor outings to {dogDisplayLower}'s vibe.
              </p>

              {/* Bento grid */}
              <div className='grid grid-cols-2 gap-3 flex-1'>
                {PERSONALITY_OPTIONS.map((opt) => {
                  const active = personality.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type='button'
                      className={['ob-bento-card', active ? 'ob-bento-card-active' : ''].join(' ')}
                      onClick={() => togglePersonality(opt.id)}
                    >
                      <div className='ob-bento-icon'>
                        <span aria-hidden>{opt.emoji}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2419', lineHeight: '1.2' }}>
                        {opt.label}
                      </span>
                      <span className='ob-muted' style={{ fontSize: 12, lineHeight: '1.35' }}>
                        {opt.desc}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className='mt-6'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  disabled={!canProceed()}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 5: Energy level bento ───────────────────────── */}
        {step === 5 ? (
          <div className='ob-radial-terra flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'>
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Adventure Style' />

              <h1
                className='ob-serif'
                style={{ fontSize: 24, lineHeight: '1.25', color: '#2C2419' }}
              >
                What's{' '}
                <span className='ob-terra italic'>{dogDisplayLower}</span>'s energy like?
              </h1>
              <p className='ob-muted text-sm mt-2 mb-7'>
                One vibe — you can update it anytime.
              </p>

              <div className='grid grid-cols-2 gap-3 flex-1'>
                {ENERGY_OPTIONS.map((opt) => {
                  const active = energyLevel === opt.id
                  return (
                    <button
                      key={opt.id}
                      type='button'
                      className={['ob-bento-card', active ? 'ob-bento-card-active' : ''].join(' ')}
                      onClick={() => setEnergyLevel(opt.id)}
                    >
                      <div className='ob-bento-icon'>
                        <span aria-hidden>{opt.emoji}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2419', lineHeight: '1.2' }}>
                        {opt.label}
                      </span>
                      <span className='ob-muted' style={{ fontSize: 12, lineHeight: '1.35' }}>
                        {opt.desc}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className='mt-6'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  disabled={!canProceed()}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 6: Goals ────────────────────────────────────── */}
        {step === 6 ? (
          <div className='ob-radial-sage flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'>
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Adventure Style' />

              <h1
                className='ob-serif'
                style={{ fontSize: 24, lineHeight: '1.25', color: '#2C2419' }}
              >
                What do you want from life together?
              </h1>
              <p className='ob-muted text-sm mt-2 mb-7'>
                Choose up to two goals — shapes your daily adventure picks.
              </p>

              <div className='grid grid-cols-2 gap-2 flex-1'>
                {OWNER_GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type='button'
                    className={['ob-chip', goals.includes(g) ? 'ob-chip-active' : ''].join(' ')}
                    onClick={() => toggleGoal(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className='mt-6'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  disabled={!canProceed()}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 7: Local world ──────────────────────────────── */}
        {step === 7 ? (
          <div
            className='flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'
            style={{
              background: 'radial-gradient(circle at 10% 90%, rgba(198,123,92,0.08) 0%, #FAF7F2 55%)',
            }}
          >
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Your Local World' />

              <h1
                className='ob-serif'
                style={{ fontSize: 24, lineHeight: '1.25', color: '#2C2419' }}
              >
                Where does{' '}
                <span className='ob-terra italic'>{dogDisplayLower}</span> usually adventure?
              </h1>
              <p className='ob-soft text-sm leading-relaxed mt-3'>
                So outings feel rooted where you live. Share location or enter your city or ZIP.
              </p>

              <div className='ob-location-card mt-8 flex flex-col gap-5'>
                {/* Use location button */}
                <button
                  type='button'
                  className='ob-location-btn'
                  onClick={requestLocation}
                  disabled={geoStatus === 'loading'}
                >
                  <span aria-hidden>📍</span>
                  {geoStatus === 'loading' ? 'Locating…' : 'Use my location'}
                </button>

                {geoStatus === 'ok' ? (
                  <p className='ob-sage text-xs font-semibold'>
                    ✓ Location saved{homeZip ? ` · ZIP ${homeZip}` : ''}
                  </p>
                ) : null}
                {geoStatus === 'denied' ? (
                  <p className='ob-muted text-xs'>Location unavailable — enter ZIP below.</p>
                ) : null}

                {/* Location input */}
                <div className='ob-field' style={{ marginTop: 4 }}>
                  <span className='ob-field-label' style={{ background: '#FFFFFF' }}>City or ZIP</span>
                  <input
                    className='ob-inp'
                    value={locationQuery}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocationQuery(value)
                      setLocationMessage(null)
                      setGeocodedLocation(null)
                      const zip = normalizeZip(value)
                      setHomeZip(zip)
                      if (!zip) {
                        setHomeLat(null)
                        setHomeLng(null)
                      }
                    }}
                    onBlur={() => {
                      if (locationQuery.trim().length >= 3) void resolveTypedLocation()
                    }}
                    placeholder='92107'
                    autoComplete='postal-code address-level2'
                  />
                </div>

                {locationMessage ? (
                  <p className='ob-muted text-xs leading-relaxed'>
                    {locationMessage}
                  </p>
                ) : normalizeZip(homeZip).length === 5 ? (
                  zipResolution.source === 'handcrafted' &&
                  (geocodedLocation?.supportedMarket || zipMarketFallback) ? (
                    <p className='ob-sage text-xs font-semibold'>
                      ✓ Local tuning ready for {zipResolution.environment.neighborhood}.
                    </p>
                  ) : (
                    <p className='ob-muted text-xs leading-relaxed'>
                      {zipResolution.fallbackMessage}
                    </p>
                  )
                ) : null}
              </div>

              <div className='mt-auto pt-8'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  disabled={!canProceed()}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── STEP 8: Reminders ────────────────────────────────── */}
        {step === 8 ? (
          <div
            className='flex flex-col min-h-[100dvh] px-5 pt-10 pb-8'
            style={{
              background: 'radial-gradient(circle at 80% 90%, rgba(92,122,107,0.07) 0%, #FAF7F2 60%)',
            }}
          >
            <div className='mx-auto w-full max-w-md flex flex-1 flex-col'>
              <StepHeader step={step} onBack={back} sectionLabel='Your Local World' />

              <h1
                className='ob-serif'
                style={{ fontSize: 24, lineHeight: '1.25', color: '#2C2419' }}
              >
                How should we keep{' '}
                <span className='ob-terra italic'>{dogDisplayLower}</span> on track?
              </h1>
              <p className='ob-muted text-sm mt-2'>
                Gentle nudges only — change this anytime.
              </p>

              <div className='mt-8 flex flex-col gap-3'>
                {CADENCE_OPTIONS.map(({ id, emoji, label, desc }) => (
                  <button
                    key={id}
                    type='button'
                    className={['ob-cadence-card', cadence === id ? 'ob-cadence-card-active' : ''].join(' ')}
                    onClick={() => setCadence(id)}
                  >
                    <span aria-hidden style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#2C2419' }}>{label}</div>
                      <div className='ob-muted' style={{ fontSize: 12 }}>{desc}</div>
                    </div>
                    {cadence === id ? (
                      <span className='ob-sage ml-auto' style={{ fontSize: 18 }}>✓</span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* Time pickers */}
              <div className='mt-7 flex flex-col gap-4'>
                <div className='ob-field' style={{ marginTop: 0 }}>
                  <span className='ob-field-label ob-field-label-onpage'>Morning reminder</span>
                  <input
                    type='time'
                    className='ob-inp ob-inp-time'
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                  />
                </div>
                <div className='ob-field' style={{ marginTop: 0 }}>
                  <span className='ob-field-label ob-field-label-onpage'>Evening reminder</span>
                  <input
                    type='time'
                    className='ob-inp ob-inp-time'
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                  />
                </div>
              </div>

              <div className='mt-auto pt-8'>
                <button
                  type='button'
                  className='ob-cta'
                  onClick={onPrimary}
                  disabled={!canProceed()}
                  data-testid='onboarding-primary-button'
                >
                  {primaryLabel}
                </button>
                <p className='ob-muted text-center mt-3' style={{ fontSize: 11, letterSpacing: '0.06em' }}>
                  {dogDisplayUpper} is about to have a great day.
                </p>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </>
  )
}
