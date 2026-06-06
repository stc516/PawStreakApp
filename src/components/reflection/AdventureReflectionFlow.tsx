import { useMemo, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

import { FONT_IMPORT, H } from '../../lib/editorialTheme'
import { reflectionDoneLine, reflectionIntroLine, reflectionSkipLabel } from '../../lib/reflection/reflectionCopy'
import {
  buildReflectionSignals,
  pickReflectionQuestionSet,
  type ReflectionQuestion,
} from '../../lib/reflection/reflectionQuestions'
import type { AdventureReflection } from '../../types'

interface AdventureReflectionFlowProps {
  adventureId: string
  dogName: string
  onComplete: (reflection: AdventureReflection | null) => void
}

export function AdventureReflectionFlow({
  adventureId,
  dogName,
  onComplete,
}: AdventureReflectionFlowProps) {
  const questionSet = useMemo(() => pickReflectionQuestionSet(adventureId), [adventureId])
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)

  const currentQuestion: ReflectionQuestion | undefined = questionSet.questions[stepIndex]
  const isLastStep = stepIndex >= questionSet.questions.length - 1

  function finishReflection(nextAnswers: Record<string, string>) {
    setFinished(true)
    const reflection: AdventureReflection = {
      questionSetId: questionSet.id,
      answers: nextAnswers,
      signals: buildReflectionSignals(questionSet.id, nextAnswers),
      capturedAt: new Date().toISOString(),
    }
    window.setTimeout(() => onComplete(reflection), 450)
  }

  function handleOption(value: string) {
    if (!currentQuestion || finished) return
    const nextAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(nextAnswers)
    if (isLastStep) {
      finishReflection(nextAnswers)
      return
    }
    setStepIndex((i) => i + 1)
  }

  function handleSkip() {
    onComplete(null)
  }

  const chipStyle = (active: boolean): CSSProperties => ({
    padding: '10px 16px',
    borderRadius: '999px',
    border: `1px solid ${active ? 'transparent' : H.border}`,
    background: active ? 'rgba(92, 122, 107, 0.14)' : H.card,
    color: active ? H.sageDeep : H.inkSoft,
    fontSize: '14px',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    fontFamily: H.sans,
    whiteSpace: 'nowrap',
  })

  return createPortal(
    <div
      role="dialog"
      aria-label="Adventure check-in"
      data-testid="adventure-reflection-modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(44, 36, 25, 0.42)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '16px 16px max(24px, env(safe-area-inset-bottom, 16px))',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
      onClick={handleSkip}
    >
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />
      <div
        style={{
          width: '100%',
          maxWidth: '390px',
          background: H.card,
          borderRadius: '20px',
          border: `1px solid ${H.border}`,
          boxShadow: H.shadow,
          padding: '22px 20px 18px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: H.sage,
          }}
        >
          {reflectionIntroLine(dogName)}
        </p>

        {finished ? (
          <p
            data-testid="adventure-reflection-done"
            style={{
              margin: '8px 0 0',
              fontFamily: H.serif,
              fontSize: '20px',
              lineHeight: 1.35,
              color: H.ink,
            }}
          >
            {reflectionDoneLine(dogName)}
          </p>
        ) : (
          <>
            <h2
              data-testid="adventure-reflection-prompt"
              style={{
                margin: '0 0 14px',
                fontFamily: H.serif,
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.25,
                color: H.ink,
              }}
            >
              {currentQuestion?.prompt(dogName)}
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              {currentQuestion?.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-testid={`adventure-reflection-option-${option.value}`}
                  onClick={() => handleOption(option.value)}
                  style={chipStyle(answers[currentQuestion.id] === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}

        {!finished ? (
          <button
            type="button"
            data-testid="adventure-reflection-skip"
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0 0',
              color: H.muted,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: H.sans,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(122, 110, 98, 0.35)',
              textUnderlineOffset: '3px',
            }}
          >
            {reflectionSkipLabel()}
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
