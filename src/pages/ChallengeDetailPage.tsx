import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { CategoryIllustration } from '../components/challenges/CategoryIllustration'
import { BottomNav } from '../components/BottomNav'
import { LegalFooter } from '../components/legal/LegalFooter'
import { useAppState } from '../hooks/useAppState'
import { findVisiblePackProgress } from '../lib/monthlyPacks'

export function ChallengeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useAppState()
  const progress = useMemo(
    () => (id ? findVisiblePackProgress(id, state.recentAdventures) : null),
    [id, state.recentAdventures],
  )

  useEffect(() => {
    if (!state.onboardingComplete) navigate('/', { replace: true })
  }, [navigate, state.onboardingComplete])

  useEffect(() => {
    if (state.onboardingComplete && !progress) navigate('/packs', { replace: true })
  }, [navigate, progress, state.onboardingComplete])

  if (!progress) return null

  const { pack, completed, required, percent, isComplete, remaining } = progress
  const nodes = Array.from({ length: required }, (_, index) => {
    const number = index + 1
    return {
      number,
      done: completed >= number,
      active: completed + 1 === number && !isComplete,
    }
  })
  const matching = state.recentAdventures.filter((entry) => pack.matches(entry)).slice(0, 4)

  return (
    <section
      id="screen-challenge-detail"
      data-testid="challenge-detail-page"
      className="screen active flex flex-col bg-[var(--bg)]"
      style={{ paddingBottom: 'calc(var(--bn-h, 78px) + var(--safe-bot, 0px) + 1rem)' }}
    >
      <header className="px-5 pt-8">
        <Link
          to="/packs"
          className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--text-3)]"
          style={{ textDecoration: 'none' }}
        >
          ← Challenges
        </Link>
        <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(155deg,rgba(22,27,34,0.98),rgba(12,18,28,0.96))] p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl border border-[color:rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)] p-1">
              <CategoryIllustration category={pack.illustration} size={86} locked={!isComplete && completed === 0} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">
                {pack.region}
              </div>
              <h1 className="mt-1 font-[family-name:var(--fd),Fraunces,serif] text-[27px] font-semibold italic leading-[1.05] text-[var(--text)]">
                {pack.title}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
                {pack.description}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-[color:rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em]">
              <span className={isComplete ? 'text-[color:var(--orange)]' : 'text-[var(--text-3)]'}>
                {isComplete ? 'Earned' : 'Progress path'}
              </span>
              <span className="text-[var(--text-3)]">{completed}/{required}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--orange)] to-[color:var(--gold)] transition-all duration-500"
                style={{ width: `${Math.max(percent, 3)}%` }}
              />
            </div>
            <p
              data-testid="challenge-detail-progress-note"
              className="mt-3 text-[12px] leading-relaxed text-[var(--text-2)]"
            >
              {isComplete
                ? pack.completedFlavor
                : completed === 0
                  ? pack.lockedHint
                  : `${remaining} more ${remaining === 1 ? 'adventure' : 'adventures'} to become ${pack.identity}.`}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-7 flex w-full max-w-[640px] flex-1 flex-col gap-7 px-5">
        <section
          data-testid="challenge-detail-map"
          className="rounded-[1.5rem] border border-[color:var(--border-md)] bg-[var(--bg-card)] p-5"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">
            Challenge map
          </div>
          <div className="relative mt-5 flex flex-col gap-5">
            <div
              aria-hidden
              className="absolute left-[23px] top-8 bottom-8 w-[2px] rounded-full bg-[linear-gradient(var(--orange),rgba(245,158,11,0.18))]"
            />
            {nodes.map((node) => (
              <div key={node.number} className="relative z-[1] flex items-center gap-4">
                <div
                  className={[
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-[14px] font-bold',
                    node.done
                      ? 'border-[color:rgba(255,107,53,0.45)] bg-[color:var(--orange)] text-[var(--bg)] shadow-[0_0_20px_-8px_var(--orange-glow)]'
                      : node.active
                        ? 'border-[color:var(--gold)] bg-[rgba(245,158,11,0.12)] text-[color:var(--gold)]'
                        : 'border-[color:var(--border-md)] bg-[var(--bg-elevated)] text-[var(--text-3)]',
                  ].join(' ')}
                >
                  {node.done ? '✓' : node.number}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[var(--text)]">
                    {node.done
                      ? `Memory ${node.number} sealed`
                      : node.active
                        ? 'Next adventure unlocks progress'
                        : `Earn memory ${node.number}`}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-[var(--text-2)]">
                    {node.done
                      ? 'This step now belongs to your story.'
                      : node.active
                        ? pack.lockedHint
                        : 'Waiting on the right outing.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[color:var(--border-md)] bg-[var(--bg-card)] p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">
            Matching memories
          </div>
          {matching.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              {matching.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-[color:var(--border)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[13px] font-bold text-[var(--text)]">
                    {entry.emoji} {entry.missionTitle}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-2)]">
                    {entry.locationHint || 'Adventure memory'} · {entry.durationMinutes} min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-2)]">
              No matching memories yet. The first one will light up this path.
            </p>
          )}
        </section>

        <LegalFooter />
      </main>
      <BottomNav />
    </section>
  )
}
