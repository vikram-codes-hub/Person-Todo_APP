import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Tasks ─────────────────────────────────────────────────

export const taskAPI = {
  // GET all tasks (optional query filters)
  getAll: (params = {}) =>
    api.get('/tasks', { params }).then(r => r.data.data),

  // GET single task
  getById: (id) =>
    api.get(`/tasks/${id}`).then(r => r.data.data),

  // POST create task
  create: (data) =>
    api.post('/tasks', data).then(r => r.data.data),

  // PUT update task
  update: (id, data) =>
    api.put(`/tasks/${id}`, data).then(r => r.data.data),

  // PATCH toggle status
  updateStatus: (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }).then(r => r.data.data),

  // DELETE task
  delete: (id) =>
    api.delete(`/tasks/${id}`).then(r => r.data),

  // GET stats summary
  getStats: () =>
    api.get('/tasks/stats/summary').then(r => r.data.data),

  // PATCH auto-mark overdue as Missed
  autoMarkMissed: () =>
    api.patch('/tasks/auto-miss').then(r => r.data),
}

export default api