import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { User, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import api from '../services/api'

const validatePassword = (password, username) => [
  { id: 'length', label: 'Mínimo 12 caracteres', valid: password.length >= 12 },
  { id: 'upper', label: 'Al menos una mayúscula', valid: /[A-Z]/.test(password) },
  { id: 'lower', label: 'Al menos una minúscula', valid: /[a-z]/.test(password) },
  { id: 'number', label: 'Al menos un número', valid: /[0-9]/.test(password) },
  { id: 'special', label: 'Al menos un carácter especial', valid: /[^A-Za-z0-9]/.test(password) },
  { id: 'noname', label: 'No contiene tu nombre de usuario', valid: username.length < 3 || !password.toLowerCase().includes(username.toLowerCase()) },
]

export default function Profile() {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const rules = validatePassword(password, user?.username || '')
  const allValid = rules.every(r => r.valid)
  const strength = rules.filter(r => r.valid).length
  const strengthColor = strength <= 2 ? '#ef4444' : strength <= 4 ? '#f59e0b' : '#10b981'
  const strengthLabel = strength <= 2 ? 'Débil' : strength <= 4 ? 'Media' : 'Fuerte'

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!allValid) return setError('La contraseña no cumple los requisitos')
    setLoading(true)
    setError('')
    try {
      await api.patch('/auth/password', { password })
      setSuccess('Contraseña actualizada correctamente')
      setPassword('')
      setShowRules(false)
    } catch {
      setError('Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'FF'

  return (
    <Layout>
      <h1 style={styles.title}>Mi perfil</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.avatarLarge}>{initials}</div>
          <h2 style={styles.userName}>{user?.username}</h2>
          <p style={styles.userEmail}>{user?.email}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Información de la cuenta</h3>
          <div style={styles.infoRow}>
            <User size={16} color="var(--text3)" />
            <div>
              <p style={styles.infoLabel}>Usuario</p>
              <p style={styles.infoValue}>{user?.username}</p>
            </div>
          </div>
          <div style={styles.infoRow}>
            <Mail size={16} color="var(--text3)" />
            <div>
              <p style={styles.infoLabel}>Correo electrónico</p>
              <p style={styles.infoValue}>{user?.email}</p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Cambiar contraseña</h3>
          {success && <div style={styles.successMsg}>{success}</div>}
          {error && <div style={styles.errorMsg}>{error}</div>}
          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Nueva contraseña</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} color="var(--text3)" style={styles.inputIcon} />
                <input
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 12 caracteres"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setShowRules(true); setSuccess('') }}
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
                      {rule.valid ? <Check size={13} color="#10b981" /> : <X size={13} color="#ef4444" />}
                      <span style={{ ...styles.ruleText, color: rule.valid ? 'var(--text2)' : 'var(--text3)' }}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button style={{ ...styles.btnSubmit, opacity: loading || !allValid ? 0.6 : 1 }} type="submit" disabled={loading || !allValid}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  title: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', alignItems: 'start' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  avatarLarge: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700' },
  userName: { fontSize: '1.2rem', fontWeight: '600', color: 'var(--text)', margin: 0 },
  userEmail: { color: 'var(--text3)', fontSize: '0.875rem', margin: 0 },
  cardTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.25rem' },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' },
  infoLabel: { fontSize: '0.75rem', color: 'var(--text3)', margin: 0 },
  infoValue: { fontSize: '0.9rem', color: 'var(--text)', fontWeight: '500', margin: 0 },
  successMsg: { background: '#f0fdf4', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', border: '1px solid #bbf7d0' },
  errorMsg: { background: '#fef2f2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', border: '1px solid #fecaca' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: '500', color: 'var(--text2)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '0.75rem', pointerEvents: 'none' },
  input: { width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontSize: '0.9rem' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 0 },
  rulesBox: { background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  strengthRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' },
  strengthBar: { flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s' },
  strengthLabel: { fontSize: '0.75rem', fontWeight: '600', minWidth: '40px' },
  ruleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  ruleText: { fontSize: '0.78rem' },
  btnSubmit: { padding: '0.7rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '500' }
}
