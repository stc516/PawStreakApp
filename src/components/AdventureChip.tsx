interface AdventureChipProps {
  icon: string
  name: string
  vibe: string
  selected?: boolean
  onClick: () => void
}

export function AdventureChip({ icon, name, vibe, selected = false, onClick }: AdventureChipProps) {
  return (
    <button className={`chip ${selected ? 'selected' : ''}`} onClick={onClick}>
      <span className='chip-icon'>{icon}</span>
      <span className='chip-name'>{name}</span>
      <span className='chip-vibe'>{vibe}</span>
    </button>
  )
}
