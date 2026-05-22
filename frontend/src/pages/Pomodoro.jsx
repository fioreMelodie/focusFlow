import { useState, useEffect, useRef } from 'react'
import { taskService, pomodoroService } from '../services/api'
import Layout from '../components/Layout'

export default function Pomodoro() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [cycles, setCycles] = useState(0)
  const [sessions, setSessions] = useState([])
  const startTimeRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    taskService.getAll().then(res => setTasks(res.data))
    pomodoroService.getSessions().then(res => setSessions(res.data))
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setMinutes(m => {
              if (m === 0) { handleCycleEnd(); return isBreak ? 25 : 5 }
              return m - 1
            })
            return 59
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, isBreak])

  const handleStart = () => {
    if (!selectedTask) return alert('Selecciona una tarea primero')
    startTimeRef.current = new Date().toISOString()
    setIsRunning(true)
  }

  const handlePause = () => setIsRunning(false)

  const handleReset = () => {
    setIsRunning(false)
    setMinutes(isBreak ? 5 : 25)
    setSeconds(0)
  }

  const handleCycleEnd = async () => {
    setIsRunning(false)
    if (!isBreak && selectedTask) {
      await pomodoroService.createSession({ task_id: selectedTask.id, start_time: startTimeRef.current, duration: 25, completed: true })
      setCycles(c => c + 1)
      const res = await pomodoroService.getSessions()
      setSessions(res.data)
    }
    setIsBreak(b => !b)
    setMinutes(isBreak ? 25 : 5)
    setSeconds(0)
  }

  const total = isBreak ? 5 * 60 : 25 * 60
  const remaining = minutes * 60 + seconds
  const progress = ((total - remaining) / total) * 100
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <Layout>
      <h1 style={styles.title}>Módulo Pomodoro</h1>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.modeRow}>
            {['Enfoque', 'Descanso'].map(m => (
              <button key={m} style={{ ...styles.modeBtn, ...((!isBreak && m === 'Enfoque') || (isBreak && m === 'Descanso') ? styles.modeBtnActive : {}) }}
                onClick={() => { setIsRunning(false); setIsBreak(m === 'Descanso'); setMinutes(m === 'Descanso' ? 5 : 25); setSeconds(0) }}>
                {m}
              </button>
            ))}
          </div>

          <div style={styles.timerWrapper}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--accent)" strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={styles.timerText}>
              <span style={styles.timerDigits}>{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</span>
              <span style={styles.timerMode}>{isRunning ? 'en progreso' : 'pausado'}</span>
            </div>
          </div>

          <div style={styles.controls}>
            {!isRunning
              ? <button style={styles.btnControl} onClick={handleStart}>Iniciar</button>
              : <button style={{...styles.btnControl, background:'var(--surface2)', color:'var(--text)'}} onClick={handlePause}>Pausar</button>
            }
            <button style={{...styles.btnControl, background:'var(--surface2)', color:'var(--text)'}} onClick={handleReset}>Reset</button>
          </div>

          <div style={styles.taskSelect}>
            <label style={styles.taskLabel}>Tarea vinculada</label>
            <select style={styles.select} onChange={e => setSelectedTask(tasks.find(t => t.id === parseInt(e.target.value)))}>
              <option value="">Selecciona una tarea</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>

        <div style={styles.sideCards}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Ciclos hoy</p>
            <p style={styles.statNumber}>{cycles} <span style={styles.statSub}>/ 8 meta</span></p>
            <div style={styles.dots}>
              {Array.from({length:8},(_,i) => <div key={i} style={{...styles.dot, background: i < cycles ? 'var(--accent)' : 'var(--border)'}} />)}
            </div>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Tiempo enfocado hoy</p>
            <p style={styles.statNumber}>{cycles * 25} <span style={styles.statSub}>min</span></p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Historial de hoy</p>
            {sessions.length === 0 && <p style={{color:'var(--text3)',fontSize:'0.85rem'}}>No hay sesiones aún.</p>}
            {sessions.slice(-4).reverse().map(s => (
              <div key={s.id} style={styles.sessionRow}>
                <span style={styles.sessionTitle}>{tasks.find(t=>t.id===s.task_id)?.title || 'Tarea'}</span>
                <span style={styles.sessionDur}>{s.duration} min</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  title: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' },
  modeRow: { display: 'flex', gap: '0.5rem' },
  modeBtn: { padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: '0.875rem', cursor: 'pointer' },
  modeBtnActive: { background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'transparent', fontWeight: '500' },
  timerWrapper: { position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  timerText: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timerDigits: { fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)', fontFamily: 'monospace' },
  timerMode: { fontSize: '0.72rem', color: 'var(--text3)', marginTop: '2px' },
  controls: { display: 'flex', gap: '0.75rem' },
  btnControl: { padding: '0.6rem 1.5rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' },
  taskSelect: { width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  taskLabel: { fontSize: '0.82rem', color: 'var(--text2)', fontWeight: '500' },
  select: { width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem' },
  sideCards: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  statLabel: { fontSize: '0.8rem', color: 'var(--text3)', margin: 0 },
  statNumber: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', margin: 0 },
  statSub: { fontSize: '0.85rem', fontWeight: '400', color: 'var(--text3)' },
  dots: { display: 'flex', gap: '0.3rem', marginTop: '0.25rem' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  sessionRow: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' },
  sessionTitle: { color: 'var(--text)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' },
  sessionDur: { color: 'var(--text3)', flexShrink: 0 }
}
