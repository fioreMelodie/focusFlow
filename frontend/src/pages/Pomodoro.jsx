import { useState, useEffect, useRef } from 'react'
import { taskService, pomodoroService } from '../services/api'
import Navbar from '../components/Navbar'

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
              if (m === 0) {
                handleCycleEnd()
                return isBreak ? 25 : 5
              }
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
      await pomodoroService.createSession({
        task_id: selectedTask.id,
        start_time: startTimeRef.current,
        duration: 25,
        completed: true
      })
      setCycles(c => c + 1)
      const res = await pomodoroService.getSessions()
      setSessions(res.data)
    }
    setIsBreak(b => !b)
    setMinutes(isBreak ? 25 : 5)
    setSeconds(0)
  }

  const progress = isBreak
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Temporizador Pomodoro</h2>

        <div style={styles.card}>
          <select style={styles.select} onChange={e => setSelectedTask(tasks.find(t => t.id === parseInt(e.target.value)))}>
            <option value="">Selecciona una tarea</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>

          {selectedTask && <p style={styles.taskName}>📌 {selectedTask.title}</p>}

          <div style={styles.timerContainer}>
            <div style={styles.modeLabel}>{isBreak ? '☕ Descanso' : '🎯 Trabajo'}</div>
            <div style={styles.timer}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${progress}%`, background: isBreak ? '#10b981' : '#1B3A6B'}} />
            </div>
          </div>

          <div style={styles.controls}>
            {!isRunning
              ? <button style={styles.btnStart} onClick={handleStart}>▶ Iniciar</button>
              : <button style={styles.btnPause} onClick={handlePause}>⏸ Pausar</button>
            }
            <button style={styles.btnReset} onClick={handleReset}>↺ Reiniciar</button>
          </div>

          <p style={styles.cycles}>Ciclos completados: <strong>{cycles}</strong></p>
        </div>

        <div style={styles.historyCard}>
          <h3 style={styles.historyTitle}>Historial de sesiones</h3>
          {sessions.length === 0 && <p style={{color:'#666'}}>No hay sesiones aún.</p>}
          {sessions.slice(-5).reverse().map(s => (
            <div key={s.id} style={styles.sessionItem}>
              <span>✅ {s.duration} min — {new Date(s.start_time).toLocaleDateString()}</span>
              <span style={{color: s.completed ? '#10b981' : '#f59e0b'}}>{s.completed ? 'Completada' : 'Incompleta'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '600px', margin: '0 auto' },
  title: { color: '#1B3A6B', marginBottom: '1.5rem' },
  card: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  select: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '1rem' },
  taskName: { color: '#1B3A6B', fontWeight: '500', marginBottom: '1rem' },
  timerContainer: { textAlign: 'center', margin: '1.5rem 0' },
  modeLabel: { fontSize: '1rem', color: '#666', marginBottom: '0.5rem' },
  timer: { fontSize: '4rem', fontWeight: 'bold', color: '#1B3A6B', fontFamily: 'monospace' },
  progressBar: { height: '8px', background: '#e5e7eb', borderRadius: '4px', margin: '1rem 0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 1s linear' },
  controls: { display: 'flex', gap: '1rem', justifyContent: 'center' },
  btnStart: { padding: '0.75rem 2rem', background: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  btnPause: { padding: '0.75rem 2rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  btnReset: { padding: '0.75rem 2rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  cycles: { textAlign: 'center', marginTop: '1rem', color: '#666' },
  historyCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  historyTitle: { color: '#1B3A6B', marginBottom: '1rem' },
  sessionItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }
}
