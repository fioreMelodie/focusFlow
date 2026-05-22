import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const taskService = {
  getAll: () => api.get('/tasks/'),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const tagService = {
  getAll: () => api.get('/tags/'),
  create: (data) => api.post('/tags/', data),
}

export const pomodoroService = {
  createSession: (data) => api.post('/pomodoro/sessions', data),
  getSessions: (task_id) => api.get('/pomodoro/sessions', { params: task_id ? { task_id } : {} }),
}

export const reminderService = {
  getAll: () => api.get('/reminders/'),
  create: (data) => api.post('/reminders/', data),
}

export default api
