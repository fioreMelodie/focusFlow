import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react'

const validatePassword = (password, username) => {
  const rules = [
    { id: 'length', label: 'Mínimo 12 caracteres', valid: password.length >= 12 },
    { id: 'upper', label: 'Al menos una mayúscula', valid: /[A-Z]/.test(password) },
    { id: 'lower', label: 'Al menos una minúscula', valid: /[a-z]/.test(password) },
    { id: 'number', label: 'Al menos un número', valid: /[0-9]/.test(password) },
    { id: 'special', label: 'Al menos un carácter especial (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
    { id: 'noname', label: 'No contiene tu nombre de usuario', valid: username.length < 3 || !password.toLowerCase().includes(username.toLowerCase()) },
  ]
  return rules
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const rules = validatePassword(password, username)
  const allValid = rules.every(r => r.valid)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allValid) return setError('La contraseña no cumple todos los requisitos de seguridad')
    setLoading(true)
    setError('')
    try {
      await register(username, email, password)
      navigate('/tasks')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const strength = rules.filter(r => r.valid).length
  const strengthColor = strength <= 2 ? '#ef4444' : strength <= 4 ? '#f59e0b' : '#10b981'
  const strengthLabel = strength <= 2 ? 'Débil' : strength <= 4 ? 'Media' : 'Fuerte'

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.dot} />
          <span style={styles.logoText}>FocusFlow</span>
        </div>
        <h1 style={styles.title}>Crea tu cuenta</h1>
        <p style={styles.subtitle}>Empieza a organizar tu tiempo</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre de usuario</label>
            <div style={styles.inputWrapper}>
              <User size={16} color="var(--text3)" style={styles.inputIcon} />
              <input style={styles.input} type="text" placeholder="tunombre" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="var(--text3)" style={styles.inputIcon} />
              <input style={styles.input} type="email" placeholder="usuario@correo.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="var(--text3)" style={styles.inputIcon} />
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 12 caracteres"
                value={password}
                onChange={e => { setPassword(e.target.value); setShowRules(true) }}
                onFocus={() => setShowRules(true)}
                required
              />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} color="var(--text3)" /> : <Eye size={16} color="var(--text3)" />}
              </button>
            </div>

            {showRules && password.length > 0 && (
              <div style={styles.rulesBox}>
                <div style={styles.strengthRow}>
                  <div style={styles.strengthBar}>
                    <div style={{ ...styles.strengthFill, width: `${(strength / 6) * 100}%`, background: strengthColor }} />
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strengthColor }}>{strengthLabel}</span>
                </div>
                {rules.map(rule => (
                  <div key={rule.id} style={styles.ruleRow}>
                    {rule.valid
                      ? <Check size={13} color="#10b981" />
                      : <X size={13} color="#ef4444" />
                    }
                    <span style={{ ...styles.ruleText, color: rule.valid ? 'var(--text2)' : 'var(--text3)' }}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={{ ...styles.btn, opacity: loading || !allValid ? 0.6 : 1 }} type="submit" disabled={loading || !allValid}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login" style={styles.linkAccent}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem 0' },
  card: { background: 'var(--surface)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' },
  logoText: { fontWeight: '600', fontSize: '1rem', color: 'var(--text)' },
  title: { fontSize: '1.6rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.25rem' },
  subtitle: { color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text2)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '0.75rem', pointerEvents: 'none' },
  input: { width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 0 },
  rulesBox: { background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' },
  strengthRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' },
  strengthBar: { flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s' },
  strengthLabel: { fontSize: '0.75rem', fontWeight: '600', minWidth: '40px' },
  ruleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  ruleText: { fontSize: '0.78rem' },
  btn: { padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--text)', color: 'white', border: 'none', fontSize: '0.95rem', fontWeight: '500', marginTop: '0.5rem', transition: 'opacity 0.15s' },
  link: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text3)' },
  linkAccent: { color: 'var(--accent)', fontWeight: '500' }
}
