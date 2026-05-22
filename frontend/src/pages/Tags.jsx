import { useState, useEffect } from 'react'
import { tagService } from '../services/api'
import Layout from '../components/Layout'
import { Plus, Tag, Trash2, X } from 'lucide-react'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
]

export default function Tags() {
  const [tags, setTags] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [error, setError] = useState('')

  useEffect(() => { loadTags() }, [])

  const loadTags = async () => {
    const res = await tagService.getAll()
    setTags(res.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await tagService.create({ name: name.trim(), color })
      setName('')
      setColor('#3b82f6')
      setShowForm(false)
      setError('')
      loadTags()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear etiqueta')
    }
  }

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.title}>Etiquetas</h1>
        <button style={styles.btnNew} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nueva etiqueta
        </button>
      </div>

      <p style={styles.desc}>Organiza tus tareas con etiquetas de colores.</p>

      <div style={styles.grid}>
        {tags.length === 0 && <p style={styles.empty}>No hay etiquetas aún.</p>}
        {tags.map(tag => (
          <div key={tag.id} style={styles.card}>
            <div style={{ ...styles.colorDot, background: tag.color }} />
            <span style={styles.tagName}>{tag.name}</span>
            <span style={{ ...styles.pill, background: tag.color + '18', color: tag.color, border: `1px solid ${tag.color}30` }}>{tag.name}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Nueva etiqueta</h3>
              <button style={styles.closeBtn} onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nombre</label>
                <input
                  style={styles.input}
                  placeholder="ej: Urgente, Estudio, Trabajo..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Color</label>
                <div style={styles.colorGrid}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        ...styles.colorBtn,
                        background: c,
                        outline: color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px'
                      }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
                <div style={styles.customColorRow}>
                  <span style={styles.label}>Personalizado:</span>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={styles.colorPicker} />
                  <span style={{ ...styles.pill, background: color + '18', color, border: `1px solid ${color}30`, marginLeft: '0.5rem' }}>
                    {name || 'Vista previa'}
                  </span>
                </div>
              </div>

              <button style={styles.btnSubmit} type="submit">Crear etiqueta</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' },
  desc: { color: 'var(--text3)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  btnNew: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '500' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' },
  empty: { color: 'var(--text3)', fontSize: '0.9rem' },
  card: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' },
  colorDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  tagName: { flex: 1, fontSize: '0.9rem', fontWeight: '500', color: 'var(--text)' },
  pill: { fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '20px', fontWeight: '500' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--surface)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', padding: '0.2rem' },
  error: { background: '#fef2f2', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.82rem', fontWeight: '500', color: 'var(--text2)' },
  input: { padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' },
  colorGrid: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  colorBtn: { width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer' },
  customColorRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' },
  colorPicker: { width: '32px', height: '32px', padding: '0', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' },
  btnSubmit: { padding: '0.7rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '500' }
}
