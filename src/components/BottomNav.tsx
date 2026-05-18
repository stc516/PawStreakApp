import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/app',       label: 'Today',   icon: 'today'   },
  { to: '/adventure', label: 'Plan',    icon: 'plan'    },
  { to: '/story',     label: 'Journey', icon: 'journey' },
  { to: '/wild',      label: 'Path',    icon: 'path'    },
  { to: '/account',   label: 'Profile', icon: 'profile' },
] as const

const C = {
  bg:       'rgba(10,10,10,0.80)',
  active:   '#ffbd7f',
  inactive: '#a38d7a',
  border:   'rgba(255,255,255,0.05)',
}
const FONT = "'Inter', sans-serif"

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? C.active : C.inactive
  const p = {
    width: 24, height: 24, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  if (name === 'today') return (
    <svg {...p} stroke="none">
      <circle cx="9"  cy="8.5"  r="2.5" fill={color}/>
      <circle cx="15" cy="8.5"  r="2.5" fill={color}/>
      <circle cx="6"  cy="13.5" r="2"   fill={color}/>
      <circle cx="18" cy="13.5" r="2"   fill={color}/>
      <path d="M12 14c-3.5 0-5 1.5-5 3.5S8.5 21 12 21s5-1.5 5-3.5S15.5 14 12 14z" fill={color}/>
    </svg>
  )
  if (name === 'plan') return (
    <svg {...p}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  )
  if (name === 'journey') return (
    <svg {...p}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )
  if (name === 'path') return (
    <svg {...p}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  )
  return (
    <svg {...p}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export function BottomNav() {
  return (
    <nav
      data-testid="bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: '390px',
        zIndex: 30,
        display: 'flex', alignItems: 'stretch', justifyContent: 'space-around',
        background: C.bg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${C.border}`,
        fontFamily: FONT,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === '/app'}
          style={{ textDecoration: 'none', flex: 1 }}
        >
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '3px', padding: '10px 0 12px', cursor: 'pointer',
            }}>
              <NavIcon name={item.icon} active={isActive} />
              <span style={{
                fontSize: '10px', fontWeight: '700', letterSpacing: '0.04em',
                color: isActive ? C.active : C.inactive,
                lineHeight: '1',
              }}>
                {item.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
