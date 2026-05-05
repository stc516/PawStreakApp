interface StatCardProps {
  value: string
  label: string
  variant?: 'lite' | 'big' | 'row'
}

export function StatCard({ value, label, variant = 'lite' }: StatCardProps) {
  if (variant === 'big') {
    return (
      <div className='sbs-card'>
        <div className='sbs-val'>{value}</div>
        <div className='sbs-lbl'>{label}</div>
      </div>
    )
  }

  if (variant === 'row') {
    return (
      <div className='srs-card'>
        <div className='srs-val'>{value}</div>
        <div className='srs-lbl'>{label}</div>
      </div>
    )
  }

  return (
    <div className='sl-card'>
      <div className='sl-val'>{value}</div>
      <div className='sl-lbl'>{label}</div>
    </div>
  )
}
