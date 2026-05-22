import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CheckSquare, Calendar, Clock, BarChart2, LogOut, Tag, User } from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'FF'

  const navItems = [
    { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
    { to: '/calendar', icon: Calendar, label: 'Calendario' },
    { to: '/pomodoro', icon: Clock, label: 'Pomodoro' },
    { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { to: '/tags', icon: Tag, label: 'Etiquetas' },
  ]

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoDot} />
          <span style={styles.logoText}>FocusFlow</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.bottom}>
          <NavLink to="/profile" style={({ isActive }) => ({
            ...styles.userCard,
            ...(isActive ? { background: 'var(--surface2)' } : {})
          })}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.username}</span>
              <span style={styles.userEmail}>{user?.email}</span>
            </div>
            <User size={14} color="var(--text3)" />
          </NavLink>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  wrapper: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '240px', minWidth: '240px', background: 'var(--surface)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', padding: '1.5rem 1rem', gap: '0.5rem',
    position: 'sticky', top: 0, height: '100vh'
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem', marginBottom: '1.5rem' },
  logoDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' },
  logoText: { fontWeight: '600', fontSize: '1.1rem', color: 'var(--text)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
    color: 'var(--text2)', fontSize: '0.9rem', fontWeight: '400',
    transition: 'all 0.15s'
  },
  navItemActive: {
    background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: '500'
  },
  bottom: { display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', transition: 'background 0.15s'
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'var(--accent-light)', color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: '600', flexShrink: 0
  },
  userInfo: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  userName: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '0.75rem', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
    background: 'transparent', border: 'none', color: 'var(--danger)',
    fontSize: '0.85rem', fontWeight: '400', width: '100%'
  },
  main: { flex: 1, overflow: 'auto', padding: '2rem' }
}
