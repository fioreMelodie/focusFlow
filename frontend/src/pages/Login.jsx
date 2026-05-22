import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/tasks')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.dot} />
          <span style={styles.logoText}>FocusFlow</span>
        </div>
        <h1 style={styles.title}>Bienvenido de vuelta</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="var(--text3)" style={styles.inputIcon} />
              <input style={styles.input} type="email" placeholder="usuario@correo.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div style={styles.field}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Contraseña</label>
              <Link to="/forgot-password" style={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="var(--text3)" style={styles.inputIcon} />
              <input style={styles.input} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} color="var(--text3)" /> : <Eye size={16} color="var(--text3)" />}
              </button>
            </div>
          </div>

          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={styles.link}>
          ¿No tienes cuenta? <Link to="/register" style={styles.linkAccent}>Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
  card: { background: 'var(--surface)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' },
  logoText: { fontWeight: '600', fontSize: '1rem', color: 'var(--text)' },
  title: { fontSize: '1.6rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.25rem' },
  subtitle: { color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text2)' },
  forgotLink: { fontSize: '0.8rem', color: 'var(--accent)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '0.75rem', pointerEvents: 'none' },
  input: { width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 0 },
  btn: { padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--text)', color: 'white', border: 'none', fontSize: '0.95rem', fontWeight: '500', marginTop: '0.5rem', cursor: 'pointer' },
  link: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text3)' },
  linkAccent: { color: 'var(--accent)', fontWeight: '500' }
}
