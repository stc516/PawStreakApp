import type { QuestVM } from '../../data/questProgress'

interface QuestStripProps {
  quests: QuestVM[]
}

export function QuestStrip({ quests }: QuestStripProps) {
  return (
    <div className='quest-strip-wrap'>
      <div className='quest-strip-title'>Quests</div>
      <div className='quest-strip' role='list'>
        {quests.map((q) => {
          const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100))
          return (
            <div key={q.id} className='quest-orb' role='listitem'>
              <div className='quest-orb-icon' aria-hidden>
                {q.icon}
              </div>
              <div className='quest-orb-body'>
                <div className='quest-orb-label'>{q.label}</div>
                <div className='quest-orb-bar'>
                  <div className='quest-orb-fill' style={{ width: `${pct}%` }} />
                </div>
                <div className='quest-orb-meta'>
                  {q.progress}/{q.target} · {q.rewardHint}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
