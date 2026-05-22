import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/api'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Error al enviar el correo. Intenta de nuevo.')
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

        {!sent ? (
          <>
            <h1 style={styles.title}>¿Olvidaste tu contraseña?</h1>
            <p style={styles.subtitle}>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Correo electrónico</label>
                <div style={styles.inputWrapper}>
                  <Mail size={16} color="var(--text3)" style={styles.inputIcon} />
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="usuario@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        ) : (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✉️</div>
            <h2 style={styles.successTitle}>Revisa tu correo</h2>
            <p style={styles.successDesc}>
              Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <p style={styles.successNote}>Recuerda revisar tu carpeta de spam.</p>
          </div>
        )}

        <Link to="/login" style={styles.backLink}>
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </Link>
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
  title: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.4rem' },
  subtitle: { color: 'var(--text3)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '500', color: 'var(--text2)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '0.75rem', pointerEvents: 'none' },
  input: { width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontSize: '0.95rem' },
  btn: { padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--text)', color: 'white', border: 'none', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '1rem 0' },
  successIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  successTitle: { fontSize: '1.2rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.75rem' },
  successDesc: { color: 'var(--text2)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.5rem' },
  successNote: { color: 'var(--text3)', fontSize: '0.8rem' },
  backLink: { display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginTop: '1.5rem', color: 'var(--text3)', fontSize: '0.875rem' }
}
