import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Inject JWT token on every request ────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── If token expired/invalid → auto logout ────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token')
      localStorage.removeItem('tf_user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

// ── Tasks ─────────────────────────────────────────────────
export const taskAPI = {
  getAll:         (params = {}) => api.get('/tasks', { params }).then(r => r.data.data),
  getById:        (id)          => api.get(`/tasks/${id}`).then(r => r.data.data),
  create:         (data)        => api.post('/tasks', data).then(r => r.data.data),
  update:         (id, data)    => api.put(`/tasks/${id}`, data).then(r => r.data.data),
  updateStatus:   (id, status)  => api.patch(`/tasks/${id}/status`, { status }).then(r => r.data.data),
  delete:         (id)          => api.delete(`/tasks/${id}`).then(r => r.data),
  getStats:       ()            => api.get('/tasks/stats/summary').then(r => r.data.data),
  autoMarkMissed: ()            => api.patch('/tasks/auto-miss').then(r => r.data),
}

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login:    (data) => api.post('/auth/login', data).then(r => r.data),
  getMe:    ()     => api.get('/auth/me').then(r => r.data),
}

export default api