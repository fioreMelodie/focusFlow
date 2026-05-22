import { useState, useEffect } from 'react'
import { taskService } from '../services/api'
import Layout from '../components/Layout'

export default function CalendarPage() {
  const [tasks, setTasks] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)
  const [view, setView] = useState('mes')

  useEffect(() => { taskService.getAll().then(res => setTasks(res.data)) }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dayNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

  const getTasksForDay = (day) => tasks.filter(t => {
    if (!t.due_date) return false
    const d = new Date(t.due_date)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  })

  const statusColor = { 'pendiente': '#ef4444', 'en progreso': 'var(--accent)', 'completada': 'var(--success)' }
  const today = new Date()
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.title}>Calendario</h1>
        <div style={styles.viewToggle}>
          {['Semana','Mes'].map(v => (
            <button key={v} style={{...styles.viewBtn, ...(view===v.toLowerCase() ? styles.viewBtnActive : {})}} onClick={() => setView(v.toLowerCase())}>{v}</button>
          ))}
        </div>
      </div>

      <div style={styles.navRow}>
        <h2 style={styles.monthTitle}>{monthNames[month]} {year}</h2>
        <div style={styles.navBtns}>
          <button style={styles.navBtn} onClick={() => setCurrentDate(new Date(year, month-1, 1))}>‹</button>
          <button style={styles.navBtn} onClick={() => setCurrentDate(new Date(year, month+1, 1))}>›</button>
        </div>
      </div>

      <div style={styles.calendarCard}>
        <div style={styles.grid}>
          {dayNames.map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
          {cells.map((day, i) => (
            <div key={i} style={{...styles.cell, ...(day && isToday(day) ? styles.todayCell : {})}}>
              {day && (
                <>
                  <span style={{...styles.dayNum, ...(isToday(day) ? styles.todayNum : {})}}>{day}</span>
                  {getTasksForDay(day).map(task => (
                    <div key={task.id} style={{...styles.taskChip, background: statusColor[task.status]+'15', color: statusColor[task.status], borderLeft: `3px solid ${statusColor[task.status]}`}}
                      onClick={() => setSelectedTask(task)}>
                      {task.title.length > 14 ? task.title.slice(0,14)+'…' : task.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <div style={styles.overlay} onClick={() => setSelectedTask(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{selectedTask.title}</h3>
            {selectedTask.description && <p style={styles.modalDesc}>{selectedTask.description}</p>}
            <p style={styles.modalDate}>📅 {new Date(selectedTask.due_date).toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'})}</p>
            <span style={{...styles.badge, background: statusColor[selectedTask.status]+'15', color: statusColor[selectedTask.status]}}>{selectedTask.status}</span>
            {selectedTask.tags?.length > 0 && (
              <div style={styles.tags}>
                {selectedTask.tags.map(tag => <span key={tag.id} style={{...styles.tagPill, background: tag.color+'18', color: tag.color}}>{tag.name}</span>)}
              </div>
            )}
            <button style={styles.btnClose} onClick={() => setSelectedTask(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' },
  viewToggle: { display: 'flex', gap: '0.25rem', background: 'var(--surface2)', padding: '3px', borderRadius: '8px' },
  viewBtn: { padding: '0.3rem 0.8rem', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--text2)', fontSize: '0.85rem', cursor: 'pointer' },
  viewBtnActive: { background: 'var(--surface)', color: 'var(--text)', boxShadow: 'var(--shadow)' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  monthTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' },
  navBtns: { display: 'flex', gap: '0.25rem' },
  navBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  calendarCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
  dayHeader: { padding: '0.6rem', textAlign: 'center', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' },
  cell: { minHeight: '90px', padding: '0.4rem', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', verticalAlign: 'top' },
  todayCell: { background: 'var(--accent-light)' },
  dayNum: { fontSize: '0.78rem', color: 'var(--text3)', display: 'block', marginBottom: '3px', fontWeight: '400' },
  todayNum: { color: 'var(--accent)', fontWeight: '700' },
  taskChip: { fontSize: '0.72rem', padding: '2px 5px', borderRadius: '4px', marginBottom: '2px', cursor: 'pointer', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '500' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--surface)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' },
  modalDesc: { color: 'var(--text2)', fontSize: '0.875rem' },
  modalDate: { color: 'var(--text3)', fontSize: '0.85rem' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', alignSelf: 'flex-start' },
  tags: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  tagPill: { fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: '500' },
  btnClose: { padding: '0.65rem', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', marginTop: '0.25rem' }
}
