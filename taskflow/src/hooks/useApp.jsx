import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { format } from 'date-fns'
import { taskAPI } from '../utils/api'
import { calcStreak } from '../utils/taskUtils'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [tasks,        setTasks]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [streak,       setStreak]       = useState(0)
  const [darkMode,     setDarkMode]     = useState(() => localStorage.getItem('tf-dark') === 'true')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [weekOffset,   setWeekOffset]   = useState(0)
  const [activeView,   setActiveView]   = useState('today')
  const [editingTask,  setEditingTask]  = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addDefaults,  setAddDefaults]  = useState({})
  const [confetti,     setConfetti]     = useState(false)
  const [notification, setNotification] = useState(null)

  // ── Dark mode ──────────────────────────────────────────
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else          document.documentElement.classList.remove('dark')
    localStorage.setItem('tf-dark', darkMode)
  }, [darkMode])

  // ── Load tasks on mount + auto-miss ───────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await taskAPI.autoMarkMissed()
        const data = await taskAPI.getAll()
        setTasks(data)
        setStreak(calcStreak(data))
      } catch (err) {
        showNotif('Failed to connect to server', 'error')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ── Keyboard shortcuts ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'q' && !e.target.matches('input,textarea')) openAddModal()
      if (e.key === 'Escape') { setShowAddModal(false); setEditingTask(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 2500)
  }, [])

  const refreshTasks = useCallback(async () => {
    const data = await taskAPI.getAll()
    setTasks(data)
    setStreak(calcStreak(data))
    return data
  }, [])

  // ── CRUD ───────────────────────────────────────────────
  const addTask = useCallback(async (data) => {
    try {
      await taskAPI.create(data)
      const fresh = await refreshTasks()
      showNotif('Task added!')
      const newStreak = calcStreak(fresh)
      if ([3, 7, 14, 30].includes(newStreak)) {
        setConfetti(true)
        setTimeout(() => setConfetti(false), 3000)
      }
    } catch (err) {
      showNotif(err.response?.data?.error || 'Failed to add task', 'error')
    }
  }, [refreshTasks, showNotif])

  const updateTask = useCallback(async (id, updates) => {
    try {
      await taskAPI.update(id, updates)
      await refreshTasks()
      showNotif('Task updated!')
    } catch (err) {
      showNotif(err.response?.data?.error || 'Failed to update task', 'error')
    }
  }, [refreshTasks, showNotif])

  const deleteTask = useCallback(async (id) => {
    try {
      await taskAPI.delete(id)
      await refreshTasks()
      showNotif('Task deleted', 'error')
    } catch (err) {
      showNotif('Failed to delete task', 'error')
    }
  }, [refreshTasks, showNotif])

  const toggleComplete = useCallback(async (id) => {
    const task = tasks.find(t => t._id === id)
    if (!task) return
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
    try {
      await taskAPI.updateStatus(id, newStatus)
      await refreshTasks()
    } catch (err) {
      showNotif('Failed to update status', 'error')
    }
  }, [tasks, refreshTasks, showNotif])

  const moveTask = useCallback(async (id, newDate) => {
    try {
      await taskAPI.update(id, { date: newDate })
      await refreshTasks()
      showNotif('Task moved!')
    } catch (err) {
      showNotif('Failed to move task', 'error')
    }
  }, [refreshTasks, showNotif])

  const openAddModal = useCallback((defaults = {}) => {
    setAddDefaults(defaults)
    setShowAddModal(true)
  }, [])

  // ── Filtered tasks ─────────────────────────────────────
  const filteredTasks = searchQuery
    ? tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks

  const stats = {
    total:     tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending:   tasks.filter(t => t.status === 'Pending').length,
    missed:    tasks.filter(t => t.status === 'Missed').length,
  }

  return (
    <AppContext.Provider value={{
      tasks, filteredTasks, loading, streak, darkMode, stats,
      searchQuery, setSearchQuery,
      weekOffset, setWeekOffset,
      activeView, setActiveView,
      editingTask, setEditingTask,
      showAddModal, setShowAddModal,
      addDefaults, confetti, notification,
      addTask, updateTask, deleteTask,
      toggleComplete, moveTask,
      toggleDarkMode: () => setDarkMode(d => !d),
      openAddModal, showNotif,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}