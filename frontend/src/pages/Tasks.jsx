import { useState, useEffect } from 'react'
import { taskService, tagService } from '../services/api'
import Layout from '../components/Layout'
import { Plus, Clock, Pencil, Trash2, X, Check } from 'lucide-react'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [tags, setTags] = useState([])
  const [filter, setFilter] = useState('todas')
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', due_date: '', status: 'pendiente', tag_ids: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [t, tg] = await Promise.all([taskService.getAll(), tagService.getAll()])
      setTasks(t.data)
      setTags(tg.data)
    } finally { setLoading(false) }
  }

  const openNew = () => {
    setEditTask(null)
    setForm({ title: '', description: '', due_date: '', status: 'pendiente', tag_ids: [] })
    setShowForm(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
      status: task.status,
      tag_ids: task.tags.map(t => t.id)
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, due_date: form.due_date || null }
    if (editTask) await taskService.update(editTask.id, payload)
    else await taskService.create(payload)
    setShowForm(false)
    loadData()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta tarea?')) { await taskService.delete(id); loadData() }
  }

  const handleComplete = async (task) => {
    const newStatus = task.status === 'completada' ? 'pendiente' : 'completada'
    await taskService.updateStatus(task.id, newStatus)
    loadData()
  }

  const toggleTag = (id) => {
    setForm(f => ({
      ...f,
      tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter(t => t !== id) : [...f.tag_ids, id]
    }))
  }

  const filtered = filter === 'todas' ? tasks : tasks.filter(t => t.tags.some(tg => tg.name === filter))
  const statusColor = { 'pendiente': 'var(--warning)', 'en progreso': 'var(--accent)', 'completada': 'var(--success)' }

  const formatDate = (d) => {
    if (!d) return null
    const date = new Date(d)
    const today = new Date()
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    if (diff === 0) return { label: 'Vence hoy', urgent: true }
    if (diff === 1) return { label: 'Vence mañana', urgent: true }
    if (diff < 0) return { label: `Venció hace ${Math.abs(diff)} días`, urgent: true }
    return { label: `Vence el ${date.toLocaleDateString('es', { day: 'numeric', month: 'short' })}`, urgent: false }
  }

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.title}>Mis Tareas</h1>
        <button style={styles.btnNew} onClick={openNew}>
          <Plus size={16} /> Nueva tarea
        </button>
      </div>

      <div style={styles.filters}>
        <button style={{ ...styles.filterBtn, ...(filter === 'todas' ? styles.filterActive : {}) }} onClick={() => setFilter('todas')}>Todas</button>
        {tags.map(tag => (
          <button
            key={tag.id}
            style={{ ...styles.filterBtn, ...(filter === tag.name ? { background: tag.color + '20', color: tag.color, borderColor: tag.color + '40' } : {}) }}
            onClick={() => setFilter(filter === tag.name ? 'todas' : tag.name)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: 'var(--text3)' }}>Cargando...</p> : (
        <div style={styles.list}>
          {filtered.length === 0 && <p style={styles.empty}>No hay tareas aquí. ¡Crea una!</p>}
          {filtered.map(task => {
            const dateInfo = task.due_date ? formatDate(task.due_date) : null
            return (
              <div key={task.id} style={{ ...styles.card, opacity: task.status === 'completada' ? 0.7 : 1 }}>
                <button style={styles.checkBtn} onClick={() => handleComplete(task)}>
                  {task.status === 'completada'
                    ? <Check size={16} color="var(--success)" />
                    : <div style={styles.checkEmpty} />
                  }
                </button>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={{ ...styles.taskTitle, textDecoration: task.status === 'completada' ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                    <div style={styles.cardActions}>
                      <button style={styles.iconBtn} onClick={() => openEdit(task)}><Pencil size={14} /></button>
                      <button style={{ ...styles.iconBtn, color: 'var(--danger)' }} onClick={() => handleDelete(task.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={styles.cardMeta}>
                    {dateInfo && <span style={{ ...styles.dateLabel, color: dateInfo.urgent ? 'var(--danger)' : 'var(--text3)' }}>{dateInfo.label}</span>}
                    {task.tags.map(tag => (
                      <span key={tag.id} style={{ ...styles.tagPill, background: tag.color + '18', color: tag.color, border: `1px solid ${tag.color}30` }}>{tag.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editTask ? 'Editar tarea' : 'Nueva tarea'}</h3>
              <button style={styles.closeBtn} onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Título</label>
                <input style={styles.input} placeholder="¿Qué necesitas hacer?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Descripción (opcional)</label>
                <textarea style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }} placeholder="Detalles de la tarea..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Fecha límite</label>
                  <input style={styles.input} type="datetime-local" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Estado</label>
                  <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>
              {tags.length > 0 && (
                <div style={styles.field}>
                  <label style={styles.label}>Etiquetas</label>
                  <div style={styles.tagSelector}>
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        style={{
                          ...styles.tagOption,
                          background: form.tag_ids.includes(tag.id) ? tag.color : tag.color + '15',
                          color: form.tag_ids.includes(tag.id) ? 'white' : tag.color,
                          border: `1px solid ${tag.color}40`
                        }}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {form.tag_ids.includes(tag.id) && <Check size={11} />}
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button style={styles.btnSubmit} type="submit">{editTask ? 'Guardar cambios' : 'Crear tarea'}</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' },
  btnNew: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '500' },
  filters: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  filterBtn: { padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: '0.85rem', cursor: 'pointer' },
  filterActive: { background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  empty: { color: 'var(--text3)', fontSize: '0.9rem', padding: '2rem 0' },
  card: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', transition: 'box-shadow 0.15s' },
  checkBtn: { background: 'none', border: 'none', padding: '2px', marginTop: '2px', display: 'flex', flexShrink: 0 },
  checkEmpty: { width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid var(--border)' },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  taskTitle: { fontSize: '0.95rem', fontWeight: '500', color: 'var(--text)', lineHeight: '1.4' },
  cardActions: { display: 'flex', gap: '0.25rem', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', color: 'var(--text3)', padding: '0.2rem', display: 'flex', borderRadius: '4px' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' },
  dateLabel: { fontSize: '0.78rem' },
  tagPill: { fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: '500' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--surface)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-md)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text3)', display: 'flex', padding: '0.2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: '500', color: 'var(--text2)' },
  input: { padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', width: '100%' },
  row: { display: 'flex', gap: '0.75rem' },
  tagSelector: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  tagOption: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' },
  btnSubmit: { padding: '0.7rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '500', marginTop: '0.25rem' }
}
