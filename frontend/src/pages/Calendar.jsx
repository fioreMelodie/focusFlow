import { useState, useEffect } from 'react'
import { taskService } from '../services/api'
import Navbar from '../components/Navbar'

export default function CalendarPage() {
  const [tasks, setTasks] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    taskService.getAll().then(res => setTasks(res.data))
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  const getTasksForDay = (day) => {
    return tasks.filter(t => {
      if (!t.due_date) return false
      const d = new Date(t.due_date)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const statusColor = { 'pendiente': '#f59e0b', 'en progreso': '#3b82f6', 'completada': '#10b981' }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.navBtn} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
          <h2 style={styles.title}>{monthNames[month]} {year}</h2>
          <button style={styles.navBtn} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
        </div>

        <div style={styles.legend}>
          <span style={{...styles.dot, background:'#f59e0b'}} /> Pendiente
          <span style={{...styles.dot, background:'#3b82f6'}} /> En progreso
          <span style={{...styles.dot, background:'#10b981'}} /> Completada
        </div>

        <div style={styles.calendar}>
          {dayNames.map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
          {cells.map((day, i) => (
            <div key={i} style={{...styles.cell, background: day ? 'white' : 'transparent'}}>
              {day && (
                <>
                  <span style={styles.dayNumber}>{day}</span>
                  {getTasksForDay(day).map(task => (
                    <div
                      key={task.id}
                      style={{...styles.taskPill, background: statusColor[task.status]}}
                      onClick={() => setSelectedTask(task)}
                    >
                      {task.title.length > 12 ? task.title.slice(0, 12) + '...' : task.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>

        {selectedTask && (
          <div style={styles.overlay} onClick={() => setSelectedTask(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>{selectedTask.title}</h3>
              {selectedTask.description && <p style={styles.modalDesc}>{selectedTask.description}</p>}
              <p style={styles.modalDate}>📅 {new Date(selectedTask.due_date).toLocaleDateString()}</p>
              <span style={{...styles.badge, background: statusColor[selectedTask.status]}}>{selectedTask.status}</span>
              {selectedTask.tags?.length > 0 && (
                <div style={styles.tags}>
                  {selectedTask.tags.map(tag => (
                    <span key={tag.id} style={{...styles.tag, background: tag.color}}>{tag.name}</span>
                  ))}
                </div>
              )}
              <button style={styles.btnClose} onClick={() => setSelectedTask(null)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' },
  title: { color: '#1B3A6B', margin: 0, minWidth: '200px', textAlign: 'center' },
  navBtn: { background: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1.2rem' },
  legend: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' },
  dot: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '4px' },
  calendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', background: '#e5e7eb', padding: '4px', borderRadius: '12px' },
  dayHeader: { background: '#1B3A6B', color: 'white', textAlign: 'center', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px' },
  cell: { minHeight: '90px', padding: '0.4rem', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  dayNumber: { fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' },
  taskPill: { color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', marginBottom: '2px', cursor: 'pointer', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' },
  modalTitle: { color: '#1B3A6B', marginBottom: '0.75rem' },
  modalDesc: { color: '#666', marginBottom: '0.5rem' },
  modalDate: { color: '#888', fontSize: '0.9rem', marginBottom: '0.75rem' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' },
  tags: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.75rem 0' },
  tag: { color: 'white', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' },
  btnClose: { marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }
}
