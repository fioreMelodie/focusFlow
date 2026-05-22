import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../services/api'
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react'

const validatePassword = (password) => [
  { id: 'length', label: 'Mínimo 12 caracteres', valid: password.length >= 12 },
  { id: 'upper', label: 'Al menos una mayúscula', valid: /[A-Z]/.test(password) },
  { id: 'lower', label: 'Al menos una minúscula', valid: /[a-z]/.test(password) },
  { id: 'number', label: 'Al menos un número', valid: /[0-9]/.test(password) },
  { id: 'special', label: 'Al menos un carácter especial', valid: /[^A-Za-z0-9]/.test(password) },
]

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const rules = validatePassword(password)
  const allValid = rules.every(r => r.valid)
  const strength = rules.filter(r => r.valid).length
  const strengthColor = strength <= 2 ? '#ef4444' : strength <= 4 ? '#f59e0b' : '#10b981'
  const strengthLabel = strength <= 2 ? 'Débil' : strength <= 4 ? 'Media' : 'Fuerte'

  useEffect(() => {
    if (!token) { setValidating(false); return }
    authService.verifyResetToken(token)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allValid) return setError('La contraseña no cumple los requisitos')
    setLoading(true)
    setError('')
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (validating) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={{ color: 'var(--text3)', textAlign: 'center' }}>Verificando enlace...</p>
      </div>
    </div>
  )

  if (!tokenValid) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}><span style={styles.dot} /><span style={styles.logoText}>FocusFlow</span></div>
        <div style={styles.errorBox}>
          <p style={styles.errorTitle}>Enlace inválido o expirado</p>
          <p style={styles.errorDesc}>Este enlace de recuperación ya no es válido. Solicita uno nuevo.</p>
        </div>
        <Link to="/forgot-password" style={styles.btn}>Solicitar nuevo enlace</Link>
      </div>
    </div>
  )

  if (success) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}><span style={styles.dot} /><span style={styles.logoText}>FocusFlow</span></div>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Contraseña actualizada</h2>
          <p style={styles.successDesc}>Tu contraseña fue restablecida correctamente. Redirigiendo al login...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}><span style={styles.dot} /><span style={styles.logoText}>FocusFlow</span></div>
        <h1 style={styles.title}>Nueva contraseña</h1>
        <p style={styles.subtitle}>Elige una contraseña segura para tu cuenta.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nueva contraseña</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="var(--text3)" style={styles.inputIcon} />
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 12 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} color="var(--text3)" /> : <Eye size={16} color="var(--text3)" />}
              </button>
            </div>

            {password.length > 0 && (
              <div style={styles.rulesBox}>
                <div style={styles.strengthRow}>
                  <div style={styles.strengthBar}>
                    <div style={{ ...styles.strengthFill, width: `${(strength / 5) * 100}%`, background: strengthColor }} />
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strengthColor }}>{strengthLabel}</span>
                </div>
                {rules.map(rule => (
                  <div key={rule.id} style={styles.ruleRow}>
                    {rule.valid ? <Check size={13} color="#10b981" /> : <X size={13} color="#ef4444" />}
                    <span style={{ ...styles.ruleText, color: rule.valid ? 'var(--text2)' : 'var(--text3)' }}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={{ ...styles.btnSubmit, opacity: loading || !allValid ? 0.6 : 1 }} type="submit" disabled={loading || !allValid}>
            {loading ? 'Actualizando...' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
  card: { background: 'var(--surface)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' },
  logoText: { fontWeight: '600', fontSize: '1rem', color: 'var(--text)' },
  title: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--text)' },
  subtitle: { color: 'var(--text3)', fontSize: '0.875rem', marginBottom: '0.5rem' },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', border: '1px solid #fecaca' },
  errorBox: { textAlign: 'center', padding: '1rem 0' },
  errorTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--danger)', marginBottom: '0.5rem' },
  errorDesc: { color: 'var(--text3)', fontSize: '0.875rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text2)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '0.75rem', pointerEvents: 'none' },
  input: { width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 0 },
  rulesBox: { background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  strengthRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' },
  strengthBar: { flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s' },
  strengthLabel: { fontSize: '0.75rem', fontWeight: '600', minWidth: '40px' },
  ruleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  ruleText: { fontSize: '0.78rem' },
  btn: { display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--text)', color: 'white', fontSize: '0.95rem', fontWeight: '500', marginTop: '0.5rem' },
  btnSubmit: { padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--text)', color: 'white', border: 'none', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '1rem 0' },
  successIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  successTitle: { fontSize: '1.2rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.75rem' },
  successDesc: { color: 'var(--text2)', fontSize: '0.875rem', lineHeight: '1.6' }
}
