import { useNavigate } from 'react-router-dom'

import { useAppState } from '../../hooks/useAppState'
import { evaluateFirstAdventurePrompt } from '../../lib/saveProgressNudge'
import { MascotBadge } from '../mascot/MascotBadge'

/**
 * One-shot inline card surfaced on the dashboard the first time a demo user
 * has at least one completed adventure. Calls out the streak they just
 * started and points them at /account. Sticky until the user explicitly
 * dismisses it ("Maybe later") or saves their progress.
 */
export function PostAdventureSavePrompt() {
  const navigate = useNavigate()
  const { state, markFirstAdventurePromptSeen } = useAppState()
  const decision = evaluateFirstAdventurePrompt(state)

  if (!decision.show) return null

  return (
    <div
      data-testid='post-adventure-save-prompt'
      className='mx-4 mb-3 mt-3 overflow-hidden rounded-2xl border border-[color:rgba(255,179,71,0.4)] bg-[linear-gradient(160deg,rgba(255,107,53,0.18),rgba(255,179,71,0.08)_55%,rgba(13,17,23,0)_100%)] p-4 shadow-[0_0_28px_-12px_rgba(255,107,53,0.6)]'
    >
      <div className='flex items-start gap-3'>
        <MascotBadge mascot='bailey' size='md' />
        <div className='min-w-0 flex-1'>
          <div className='text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]'>
            Streak starting · don&apos;t lose it
          </div>
          <h3 className='mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[18px] font-semibold italic leading-tight text-[var(--text)]'>
            Save {state.dogName}&apos;s adventure to keep it forever.
          </h3>
          <p className='mt-1 text-[12px] leading-snug text-[var(--text-2)]'>
            Right now everything lives on this device. One-tap signup keeps your streak and story
            safe across devices.
          </p>
        </div>
      </div>
      <div className='mt-3 flex items-center gap-2'>
        <button
          type='button'
          data-testid='post-adventure-save-prompt-cta'
          onClick={() => navigate('/account')}
          className='rounded-full bg-[color:var(--orange)] px-4 py-1.5 text-[12px] font-semibold text-[var(--bg)] shadow-[0_0_14px_-3px_var(--orange-glow)] transition-transform active:scale-[0.98]'
        >
          Save progress →
        </button>
        <button
          type='button'
          data-testid='post-adventure-save-prompt-later'
          onClick={() => markFirstAdventurePromptSeen()}
          className='rounded-full border border-[color:var(--border-md)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text)]'
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
