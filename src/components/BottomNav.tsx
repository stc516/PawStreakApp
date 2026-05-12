import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/app', emoji: '🐾', label: 'Today' },
  { to: '/adventure', emoji: '🗺️', label: 'Adventure' },
  { to: '/wild', emoji: '🏆', label: 'The Wild' },
  { to: '/packs', emoji: '🎒', label: 'Packs' },
  { to: '/story', emoji: '📖', label: 'Story' },
] as const

export function BottomNav() {
  return (
    <nav
      data-testid='bottom-nav'
      className='ps-bottom-nav fixed bottom-0 left-1/2 z-30 flex h-[78px] w-full max-w-[390px] -translate-x-1/2 items-start justify-around border-t border-[color:var(--border)] bg-[rgba(13,17,23,.97)] px-2 pt-2 backdrop-blur-[24px]'
    >
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === '/app'}
          className={({ isActive }) =>
            [
              'relative flex min-w-[68px] flex-col items-center gap-[3px] px-1 py-0 text-[9px] font-medium uppercase tracking-[0.04em] transition-colors',
              isActive ? 'text-[color:var(--orange)]' : 'text-[color:var(--text-3)]',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={['text-[21px] leading-none', isActive ? 'drop-shadow-[0_0_7px_var(--orange-glow)]' : ''].join(
                  ' ',
                )}
              >
                {item.emoji}
              </span>
              {isActive ? (
                <span className='h-1 w-1 rounded-full bg-[color:var(--orange)]' aria-hidden />
              ) : null}
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
