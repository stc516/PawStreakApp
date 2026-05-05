interface ProgressBarProps {
  value: number
  max: number
  className?: string
}

export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const progress = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))

  return (
    <div className={`prog-track ${className ?? ''}`.trim()}>
      <div className='prog-fill' style={{ width: `${progress}%` }} />
    </div>
  )
}
