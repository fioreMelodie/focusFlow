import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { taskService, pomodoroService } from '../services/api'
import Navbar from '../components/Navbar'

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
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Dashboard de productividad</h2>

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderTop: '4px solid #f59e0b'}}>
            <div style={styles.statNumber}>{pendiente}</div>
            <div style={styles.statLabel}>Pendientes</div>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #3b82f6'}}>
            <div style={styles.statNumber}>{enProgreso}</div>
            <div style={styles.statLabel}>En progreso</div>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #10b981'}}>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1B3A6B" radius={[4, 4, 0, 0]} name="Sesiones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Distribución de tareas</h3>
          <div style={styles.barGroup}>
            {[
              { label: 'Pendientes', count: pendiente, color: '#f59e0b' },
              { label: 'En progreso', count: enProgreso, color: '#3b82f6' },
              { label: 'Completadas', count: completada, color: '#10b981' },
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
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  title: { color: '#1B3A6B', marginBottom: '1.5rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1B3A6B' },
  statLabel: { color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' },
  chartCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  chartTitle: { color: '#1B3A6B', marginBottom: '1rem' },
  barGroup: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  barLabel: { width: '100px', fontSize: '0.9rem', color: '#666' },
  barTrack: { flex: 1, height: '20px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' },
  barCount: { width: '30px', textAlign: 'right', fontWeight: 'bold', color: '#1B3A6B' }
}
