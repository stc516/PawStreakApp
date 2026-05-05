import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdventureChip } from '../components/AdventureChip'
import { BottomNav } from '../components/BottomNav'
import { PathHeader } from '../components/path/PathHeader'
import { QuestStrip } from '../components/path/QuestStrip'
import { VerticalAdventurePath } from '../components/path/VerticalAdventurePath'
import { getPathNodeStates, getPathNodes, pathCompletionRatio, peekNextRegion } from '../data/adventurePath'
import { localeFromZip, localeLabel, missionTimeLabel } from '../data/localAdventureEngine'
import { buildQuestList } from '../data/questProgress'
import {
  DOG_MOODS,
  VIBE_CHIPS,
  identityArc,
  tomorrowRarePossible,
} from '../data/missions'
import { useAppState } from '../hooks/useAppState'

function useTimeToMidnight() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 30000)
    return () => window.clearInterval(id)
  }, [])

  const now = new Date()
  const mid = new Date(now)
  mid.setHours(24, 0, 0, 0)
  const ms = Math.max(0, mid.getTime() - now.getTime())
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return { hours, minutes }
}

function DashboardZipField({
  zipCode,
  localeLabelText,
  onSave,
}: {
  zipCode: string
  localeLabelText: string
  onSave: (z: string) => void
}) {
  const [draft, setDraft] = useState(zipCode)
  return (
    <details className='path-zip-fold'>
      <summary className='path-zip-summary'>📍 Area &amp; ZIP</summary>
      <div className='path-zip-body'>
        <div className='zip-row-input'>
          <input
            inputMode='numeric'
            autoComplete='postal-code'
            maxLength={5}
            placeholder='92109'
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 5))}
          />
          <button type='button' className='btn-zip-save' onClick={() => onSave(draft)}>
            Save
          </button>
        </div>
        <p className='zip-hint'>
          {zipCode && zipCode.length === 5
            ? `${localeLabelText} · ${zipCode}`
            : 'Optional — generic neighborhood missions if blank.'}
        </p>
      </div>
    </details>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { state, rollPickForMe, selectVibe, setZipCode } = useAppState()
  const { hours, minutes } = useTimeToMidnight()
  const moodMeta = DOG_MOODS.find((m) => m.id === state.dogMood) ?? DOG_MOODS[0]
  const identity = identityArc(state.totalAdventureEnergy, state.currentStreak)
  const rareTomorrow = tomorrowRarePossible(state.dogName)
  const m = state.generatedMission
  const zipLocale = localeFromZip(state.zipCode ?? '')
  const rarityClass = m.rarity === 'rare' ? 'rare' : m.rarity === 'uncommon' ? 'uncommon' : 'common'

  const pathNodes = useMemo(() => getPathNodes(), [])
  const pathStates = useMemo(
    () => getPathNodeStates(state.totalAdventures, state.todayAdventureDone, m.rarity),
    [state.totalAdventures, state.todayAdventureDone, m.rarity],
  )
  const pathFill = pathCompletionRatio(state.totalAdventures)
  const regionPeek = peekNextRegion(state.totalAdventures)
  const quests = useMemo(() => buildQuestList(state), [state])

  const zipLine =
    state.zipCode && state.zipCode.length === 5
      ? `${localeLabel(zipLocale)} turf · ${state.zipCode}`
      : 'Set ZIP in Area — or roam generic neighborhoods'

  const startLabel = state.todayAdventureDone ? `Done today ✓` : `Go — ${missionTimeLabel(m)}`

  return (
    <section id='screen-dash' className='screen active path-screen'>
      <div className='path-home-scroll'>
        <PathHeader
          dogName={state.dogName}
          dogMood={state.dogMood}
          moodEmoji={moodMeta.emoji}
          moodLabel={moodMeta.label}
          rankTitle={identity.title}
          streak={state.currentStreak}
          pathFillRatio={pathFill}
          zipLine={zipLine}
        />

        {state.emergencyTreatAvailable ? (
          <p className='path-emergency-whisper'>🍖 Emergency Treat ready</p>
        ) : (
          <p className='path-emergency-whisper path-emergency-whisper--off'>🍖 Emergency Treat used</p>
        )}

        <p className={`path-tomorrow ${state.todayAdventureDone ? 'path-tomorrow--dim' : ''}`}>
          {!state.todayAdventureDone ? (
            <>
              Next board <strong>{hours}h {minutes}m</strong>
              {rareTomorrow ? <span className='path-tomorrow-spark'> · Rare slot tomorrow</span> : null}
            </>
          ) : (
            <>{state.tomorrowTease}</>
          )}
        </p>

        <div className={`path-mission-dock rarity-${rarityClass}`}>
          <div className='path-mission-emoji' aria-hidden>
            {m.emoji}
          </div>
          <div className='path-mission-title'>{m.title}</div>
          <div className='path-mission-sub'>
            {missionTimeLabel(m)} · {m.locationHint}
          </div>
          <p className='path-mission-flavor'>{m.flavor}</p>

          <div className='path-mission-actions'>
            <button
              type='button'
              className='path-btn-primary'
              disabled={state.todayAdventureDone}
              onClick={() => {
                if (!state.todayAdventureDone) navigate('/adventure')
              }}
            >
              <span className='path-btn-primary-main'>{startLabel}</span>
              <span className='path-btn-primary-sub'>Pick for me · today&apos;s run</span>
            </button>
            <button
              type='button'
              className='path-btn-secondary'
              onClick={() => rollPickForMe()}
              disabled={state.todayAdventureDone}
            >
              New roll
            </button>
          </div>
        </div>

        <VerticalAdventurePath nodes={pathNodes} states={pathStates} nextRegionTease={regionPeek} />

        <div className='path-vibe-zone'>
          <div className='path-vibe-label'>Vibe</div>
          <div className='path-vibe-row'>
            {VIBE_CHIPS.map((chip) => (
              <AdventureChip
                key={chip.vibe}
                icon={chip.icon}
                name={chip.name}
                vibe={chip.blurb}
                selected={state.selectedVibe === chip.vibe}
                onClick={() => selectVibe(chip.vibe)}
              />
            ))}
          </div>
        </div>

        <DashboardZipField
          key={state.zipCode ?? ''}
          zipCode={state.zipCode ?? ''}
          localeLabelText={localeLabel(zipLocale)}
          onSave={setZipCode}
        />

        <QuestStrip quests={quests} />

        <div className='path-footer-spacer' />
      </div>
      <BottomNav />
    </section>
  )
}
