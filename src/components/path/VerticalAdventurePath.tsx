import { getZoneStatuses, ZONES, type ZoneId } from '../../data/adventurePath'

interface ZoneWorldProps {
  nodes?: unknown
  states?: unknown
  nextRegionTease: { title: string; preview: string; nodesAway: number } | null
  totalAdventures: number
  onZoneSelect: (zoneId: ZoneId) => void
  selectedZoneId: ZoneId | null
}

export function ZoneWorld({
  nextRegionTease,
  totalAdventures,
  onZoneSelect,
  selectedZoneId,
}: ZoneWorldProps) {
  const statuses = getZoneStatuses(totalAdventures)

  return (
    <div className='mt-6 px-4'>
      {nextRegionTease ? (
        <div
          className='mb-4 rounded-2xl border border-[color:rgba(255,179,71,0.3)] bg-[var(--bg-elevated)] px-4 py-3'
          role='status'
        >
          <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]'>Next place</p>
          <p className='mt-1 font-serif text-lg text-[var(--text)]'>{nextRegionTease.title}</p>
          <p className='mt-0.5 text-xs leading-snug text-[var(--text-2)]'>{nextRegionTease.preview}</p>
          <p className='mt-2 text-xs font-semibold text-[var(--gold)]'>
            Unlocks in {nextRegionTease.nodesAway} adventure{nextRegionTease.nodesAway === 1 ? '' : 's'}
          </p>
        </div>
      ) : null}

      <p className='mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-2)]'>Zones</p>
      <div className='flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]'>
        {ZONES.map((zone) => {
          const status = statuses[zone.id]
          const isSelected = selectedZoneId === zone.id && status === 'open'
          const unlockIn = Math.max(0, zone.unlocksAt - totalAdventures)

          if (status === 'locked') {
            return (
              <div
                key={zone.id}
                className='flex h-14 flex-shrink-0 items-center gap-2 rounded-2xl border border-[color:rgba(255,255,255,0.07)] bg-[var(--bg-card)] px-4 opacity-[0.68]'
              >
                <span className='text-xl' aria-hidden>
                  🔒
                </span>
                <span className='max-w-[100px] truncate text-xs font-medium text-[var(--text-2)]'>Locked</span>
              </div>
            )
          }

          if (status === 'teased') {
            return (
              <div
                key={zone.id}
                className='flex h-14 flex-shrink-0 flex-col justify-center rounded-2xl border border-[color:rgba(255,255,255,0.1)] bg-[var(--bg-elevated)] px-4 opacity-90'
              >
                <span className='flex items-center gap-2'>
                  <span className='text-xl' aria-hidden>
                    {zone.emoji}
                  </span>
                  <span className='max-w-[120px] truncate text-xs font-semibold text-[var(--text-2)]'>{zone.name}</span>
                </span>
                <span className='mt-0.5 pl-8 text-[10px] text-[var(--gold)]'>
                  Unlocks in {unlockIn} adventure{unlockIn === 1 ? '' : 's'}
                </span>
              </div>
            )
          }

          return (
            <button
              key={zone.id}
              type='button'
              onClick={() => onZoneSelect(zone.id)}
              className={[
                'flex h-14 flex-shrink-0 items-center gap-2 rounded-2xl border px-4 transition-[box-shadow,border-color]',
                isSelected
                  ? 'border-[var(--orange)] bg-[var(--bg-elevated)] shadow-[0_0_16px_rgba(255,107,53,0.35)]'
                  : 'border-[color:rgba(255,255,255,0.1)] bg-[var(--bg-elevated)] hover:border-[color:rgba(255,107,53,0.45)]',
              ].join(' ')}
            >
              <span className='text-xl' aria-hidden>
                {zone.emoji}
              </span>
              <span className='max-w-[130px] truncate text-left text-xs font-bold text-[var(--text)]'>{zone.name}</span>
            </button>
          )
        })}
      </div>

      {selectedZoneId && statuses[selectedZoneId] === 'open' ? (
        <p className='mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--orange)]'>
          Today&apos;s adventure
        </p>
      ) : null}
    </div>
  )
}

export default ZoneWorld
