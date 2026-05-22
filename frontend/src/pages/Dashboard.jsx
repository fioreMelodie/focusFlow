import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { taskService, pomodoroService } from '../services/api'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    taskService.getAll().then(res => setTasks(res.data))
    pomodoroService.getSessions().then(res => setSessions(res.data))
  }, [])

  const pendiente = tasks.filter(t => t.status === 'pendiente').length
  const enProgreso = tasks.filter(t => t.status === 'en progreso').length
  const completada = tasks.filter(t => t.status === 'completada').length

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' })
    const count = sessions.filter(s => {
      const sd = new Date(s.start_time)
      return sd.toDateString() === d.toDateString() && s.completed
    }).length
    return { label, count }
  })

  return (
    <Layout>
      <h1 style={styles.title}>Dashboard de productividad</h1>

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid var(--warning)'}}>
          <div style={styles.statNumber}>{pendiente}</div>
          <div style={styles.statLabel}>Pendientes</div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid var(--accent)'}}>
          <div style={styles.statNumber}>{enProgreso}</div>
          <div style={styles.statLabel}>En progreso</div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid var(--success)'}}>
          <div style={styles.statNumber}>{completada}</div>
          <div style={styles.statLabel}>Completadas</div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1B3A6B'}}>
          <div style={styles.statNumber}>{sessions.filter(s => s.completed).length}</div>
          <div style={styles.statLabel}>Sesiones Pomodoro</div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Sesiones Pomodoro — últimos 7 días</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" fontSize={12} tick={{ fill: 'var(--text3)' }} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text3)' }} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--accent)" radius={[4,4,0,0]} name="Sesiones" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Distribución de tareas</h3>
        <div style={styles.barGroup}>
          {[
            { label: 'Pendientes', count: pendiente, color: 'var(--warning)' },
            { label: 'En progreso', count: enProgreso, color: 'var(--accent)' },
            { label: 'Completadas', count: completada, color: 'var(--success)' },
          ].map(item => (
            <div key={item.label} style={styles.barRow}>
              <span style={styles.barLabel}>{item.label}</span>
              <div style={styles.barTrack}>
                <div style={{
                  ...styles.barFill,
                  width: tasks.length ? `${(item.count / tasks.length) * 100}%` : '0%',
                  background: item.color
                }} />
              </div>
              <span style={styles.barCount}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  title: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', marginBottom: '1.5rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' },
  statNumber: { fontSize: '2rem', fontWeight: '700', color: 'var(--text)' },
  statLabel: { color: 'var(--text3)', fontSize: '0.85rem', marginTop: '0.25rem' },
  chartCard: { background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem' },
  chartTitle: { color: 'var(--text)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.95rem' },
  barGroup: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  barLabel: { width: '100px', fontSize: '0.85rem', color: 'var(--text2)' },
  barTrack: { flex: 1, height: '8px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  barCount: { width: '24px', textAlign: 'right', fontWeight: '600', color: 'var(--text)', fontSize: '0.9rem' }
}
