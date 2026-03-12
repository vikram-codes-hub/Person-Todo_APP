import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { getMonthDates, shouldTaskAppearOnDate, CATEGORY_CONFIG } from '../utils/taskUtils'

export default function CalendarView() {
  const [calDate,  setCalDate]  = useState(new Date())
  const [selected, setSelected] = useState(null)
  const { tasks, openAddModal } = useApp()

  const year     = calDate.getFullYear()
  const month    = calDate.getMonth()
  const days     = getMonthDates(year, month)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getTasksForDate = (date) => {
    if (!date) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return tasks.filter(t => shouldTaskAppearOnDate(t, dateStr))
  }

  const selectedDateStr = selected ? format(selected, 'yyyy-MM-dd') : null
  const selectedTasks   = selected ? getTasksForDate(selected) : []

  const prevMonth = () => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">

      {/* ── Calendar grid ───────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-orange-500 transition-all active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <h2
            className="font-black text-lg sm:text-xl text-gray-800 dark:text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {format(calDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-orange-500 transition-all active:scale-95">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[11px] sm:text-xs font-bold text-gray-400 py-1.5 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />

            const dayTasks   = getTasksForDate(date)
            const todayDay   = isToday(date)
            const isSelected = selected && format(selected, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            const completed  = dayTasks.filter(t => t.status === 'Completed').length
            const missed     = dayTasks.filter(t => t.status === 'Missed').length
            const pending    = dayTasks.filter(t => t.status === 'Pending').length

            return (
              <motion.button
                key={format(date, 'yyyy-MM-dd')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelected(isSelected ? null : date)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 px-0.5 transition-all ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/40'
                    : todayDay
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-300 dark:ring-orange-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold leading-none">{date.getDate()}</span>

                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {completed > 0 && (
                      <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-green-400'}`} />
                    )}
                    {pending > 0 && (
                      <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-orange-400'}`} />
                    )}
                    {missed > 0 && (
                      <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-red-400'}`} />
                    )}
                  </div>
                )}

                {/* Task count badge on hover */}
                {dayTasks.length > 1 && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    {dayTasks.length}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-5 mt-4 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Missed</span>
        </div>
      </div>

      {/* ── Day detail panel ─────────────────────── */}
      <div className="lg:w-64 xl:w-72 lg:flex-shrink-0">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selectedDateStr}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
            >
              {/* Panel header */}
              <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {format(selected, 'EEEE')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(selected, 'MMMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAddModal({ date: selectedDateStr })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-sm shadow-orange-200 dark:shadow-orange-900/30"
                  >
                    <Plus size={12} /> Add
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Task list */}
              <div className="p-3 space-y-2 max-h-72 lg:max-h-[calc(100vh-280px)] overflow-y-auto">
                {selectedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-300 dark:text-gray-700">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-xs font-medium">No tasks this day</p>
                    <button
                      onClick={() => openAddModal({ date: selectedDateStr })}
                      className="mt-3 text-xs text-orange-500 hover:text-orange-600 font-semibold"
                    >
                      + Add one
                    </button>
                  </div>
                ) : (
                  selectedTasks.map((task, i) => {
                    const catCfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.Other
                    return (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-3 rounded-xl border-l-4 ${
                          task.status === 'Completed' ? 'border-l-green-400 bg-green-50/50 dark:bg-green-900/10' :
                          task.status === 'Missed'    ? 'border-l-red-400 bg-red-50/50 dark:bg-red-900/10'       :
                                                        'border-l-orange-400 bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <p className={`text-sm font-semibold text-gray-800 dark:text-white leading-tight ${
                          task.status !== 'Pending' ? 'line-through opacity-50' : ''
                        }`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-lg font-medium ${catCfg.color}`}>
                            {catCfg.icon} {task.category}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-lg font-semibold ${
                            task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            task.status === 'Missed'    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'         :
                                                          'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          }`}>
                            {task.status}
                          </span>
                          {task.time && (
                            <span className="text-xs text-gray-400">⏰ {task.time}</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Summary footer */}
              {selectedTasks.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs text-gray-400">
                  <span className="text-green-500 font-semibold">✓ {selectedTasks.filter(t => t.status === 'Completed').length}</span>
                  <span className="text-orange-400 font-semibold">○ {selectedTasks.filter(t => t.status === 'Pending').length}</span>
                  {selectedTasks.filter(t => t.status === 'Missed').length > 0 && (
                    <span className="text-red-400 font-semibold">✗ {selectedTasks.filter(t => t.status === 'Missed').length}</span>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-40 lg:h-full text-gray-300 dark:text-gray-700 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800"
            >
              <div className="text-4xl mb-2">📅</div>
              <p className="text-sm font-medium">Click a day to see tasks</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}