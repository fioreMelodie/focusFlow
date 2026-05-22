import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/tasks" style={styles.logo}>FocusFlow</Link>
      <div style={styles.links}>
        <Link to="/tasks" style={styles.link}>Tareas</Link>
        <Link to="/calendar" style={styles.link}>Calendario</Link>
        <Link to="/pomodoro" style={styles.link}>Pomodoro</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <span style={styles.user}>Hola, {user?.username}</span>
        <button onClick={handleLogout} style={styles.button}>Salir</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: { background: '#1B3A6B', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', fontWeight: 'bold', fontSize: '1.3rem', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  link: { color: 'white', textDecoration: 'none', fontSize: '0.95rem' },
  user: { color: '#aac4ff', fontSize: '0.9rem' },
  button: { background: 'transparent', border: '1px solid white', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }
}
