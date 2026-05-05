import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/app', icon: '🏠', label: 'Home' },
  { to: '/badges', icon: '🏅', label: 'Badges' },
  { to: '/story', icon: '📖', label: 'Story' },
  { to: '/app', icon: '👤', label: 'Profile' },
] as const

export function BottomNav() {
  return (
    <nav className='bottom-nav'>
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className='nav-icon'>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
