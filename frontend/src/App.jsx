import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import CalendarPage from './pages/Calendar'
import Pomodoro from './pages/Pomodoro'
import Dashboard from './pages/Dashboard'
import Tags from './pages/Tags'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)', fontSize: '0.9rem' }}>
      Cargando...
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/tasks" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
      <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
      <Route path="/pomodoro" element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tags" element={<PrivateRoute><Tags /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
