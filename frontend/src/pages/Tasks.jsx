import { useState, useEffect } from 'react'
import { taskService, tagService } from '../services/api'
import Navbar from '../components/Navbar'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [tags, setTags] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', due_date: '', status: 'pendiente', tag_ids: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksRes, tagsRes] = await Promise.all([taskService.getAll(), tagService.getAll()])
      setTasks(tasksRes.data)
      setTags(tagsRes.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await taskService.create({ ...form, due_date: form.due_date || null })
    setForm({ title: '', description: '', due_date: '', status: 'pendiente', tag_ids: [] })
    setShowForm(false)
    loadData()
  }

  const handleStatus = async (id, status) => {
    await taskService.updateStatus(id, status)
    loadData()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta tarea?')) {
      await taskService.delete(id)
      loadData()
    }
  }

  const statusColor = { 'pendiente': '#f59e0b', 'en progreso': '#3b82f6', 'completada': '#10b981' }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Mis tareas</h2>
          <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nueva tarea'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input style={styles.input} placeholder="Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea style={styles.input} placeholder="Descripción" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <input style={styles.input} type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
            <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
            <select style={styles.input} multiple value={form.tag_ids.map(String)} onChange={e => setForm({...form, tag_ids: Array.from(e.target.selectedOptions, o => parseInt(o.value))})}>
              {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
            </select>
            <button style={styles.btnPrimary} type="submit">Guardar tarea</button>
          </form>
        )}

        {loading ? <p>Cargando...</p> : (
          <div style={styles.grid}>
            {tasks.length === 0 && <p style={{color:'#666'}}>No tienes tareas aún. ¡Crea una!</p>}
            {tasks.map(task => (
              <div key={task.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{task.title}</h3>
                  <span style={{...styles.badge, background: statusColor[task.status]}}>{task.status}</span>
                </div>
                {task.description && <p style={styles.cardDesc}>{task.description}</p>}
                {task.due_date && <p style={styles.cardDate}>📅 {new Date(task.due_date).toLocaleDateString()}</p>}
                {task.tags.length > 0 && (
                  <div style={styles.tags}>
                    {task.tags.map(tag => <span key={tag.id} style={{...styles.tag, background: tag.color}}>{tag.name}</span>)}
                  </div>
                )}
                <div style={styles.cardActions}>
                  <select style={styles.selectSmall} value={task.status} onChange={e => handleStatus(task.id, e.target.value)}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                  <button style={styles.btnDanger} onClick={() => handleDelete(task.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { color: '#1B3A6B', margin: 0 },
  form: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', width: '100%', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  card: { background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  cardTitle: { margin: 0, color: '#1B3A6B', fontSize: '1rem' },
  cardDesc: { color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' },
  cardDate: { color: '#888', fontSize: '0.85rem', margin: '0.25rem 0' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', whiteSpace: 'nowrap' },
  tags: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0' },
  tag: { color: 'white', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' },
  selectSmall: { padding: '0.4rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem', flex: 1 },
  btnPrimary: { padding: '0.6rem 1.2rem', background: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  btnDanger: { padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
}
