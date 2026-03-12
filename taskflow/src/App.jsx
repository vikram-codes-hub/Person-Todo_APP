import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sun, Moon, BarChart2, Calendar, LayoutGrid, Flame, Home } from 'lucide-react'
import { AppProvider, useApp } from './hooks/useApp.jsx'
import TaskModal    from './components/TaskModal'
import TodayView    from './components/TodayView'
import WeeklyView   from './components/WeeklyView'
import CalendarView from './components/CalendarView'
import StatsView    from './components/StatsView'
import SearchPanel  from './components/SearchPanel'
import { Confetti, Notification } from './components/Overlays'

const VIEWS = [
  { id: 'today',    label: 'Today',    icon: Home       },
  { id: 'weekly',   label: 'Weekly',   icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', icon: Calendar   },
  { id: 'stats',    label: 'Stats',    icon: BarChart2  },
]

function AppInner() {
  const { activeView, setActiveView, openAddModal, toggleDarkMode, darkMode, streak, stats, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ fontFamily: 'Syne, sans-serif' }}>TF</div>
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}>TaskFlow</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveView(id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === id ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {activeView === id && (
                  <motion.div layoutId="nav-bg"
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <SearchPanel />
          </div>

          {/* Streak */}
          {streak > 0 && (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl text-sm font-semibold flex-shrink-0">
              <Flame size={14} /> {streak} day{streak !== 1 ? 's' : ''}
            </motion.div>
          )}

          {/* Mini stats */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
            <span className="text-green-500 font-semibold">✓ {stats.completed}</span>
            <span className="text-orange-400 font-semibold">⏳ {stats.pending}</span>
            {stats.missed > 0 && <span className="text-red-400 font-semibold">✗ {stats.missed}</span>}
          </div>

          {/* Dark mode + Add */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => openAddModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
              <Plus size={16} /> Add Task
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-5 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeView}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }} className="h-full">
            {activeView === 'today'    && <TodayView />}
            {activeView === 'weekly'   && <WeeklyView />}
            {activeView === 'calendar' && <CalendarView />}
            {activeView === 'stats'    && <StatsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hint bar */}
      <div className="text-center py-2 text-xs text-gray-300 dark:text-gray-700">
        Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 font-mono text-xs">Q</kbd> to quick-add · Drag tasks between days
      </div>

      <TaskModal />
      <Confetti />
      <Notification />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}