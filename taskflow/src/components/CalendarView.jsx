import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { getMonthDates, shouldTaskAppearOnDate } from '../utils/taskUtils'

export default function CalendarView() {
  const [calDate, setCalDate] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const { tasks, openAddModal } = useApp()

  const year  = calDate.getFullYear()
  const month = calDate.getMonth()
  const days  = getMonthDates(year, month)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getTasksForDate = (date) => {
    if (!date) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return tasks.filter(t => shouldTaskAppearOnDate(t, dateStr))
  }

  const selectedDateStr = selected ? format(selected, 'yyyy-MM-dd') : null
  const selectedTasks   = selected ? getTasksForDate(selected) : []

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-gray-800 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {format(calDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCalDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />
            const dayTasks  = getTasksForDate(date)
            const todayDay  = isToday(date)
            const isSelected = selected && format(selected, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            const completed = dayTasks.filter(t => t.status === 'Completed').length
            const missed    = dayTasks.filter(t => t.status === 'Missed').length

            return (
              <motion.button key={format(date, 'yyyy-MM-dd')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(isSelected ? null : date)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 transition-colors ${
                  isSelected ? 'bg-orange-500 text-white' :
                  todayDay   ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                               'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                <span className="text-sm font-semibold">{date.getDate()}</span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {completed > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                    {missed    > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    {(dayTasks.length - completed - missed) > 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Missed</span>
        </div>
      </div>

      {/* Day panel */}
      <div className="w-64 flex-shrink-0">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selectedDateStr} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{format(selected, 'EEEE')}</p>
                  <p className="text-sm text-gray-400">{format(selected, 'MMMM d, yyyy')}</p>
                </div>
                <button onClick={() => openAddModal({ date: selectedDateStr })}
                  className="px-3 py-1.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors text-xs font-medium">
                  + Add
                </button>
              </div>
              {selectedTasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-8">No tasks this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map(task => (
                    <div key={task._id} className={`p-2.5 rounded-xl border-l-4 bg-gray-50 dark:bg-gray-800 ${
                      task.status === 'Completed' ? 'border-l-green-400' :
                      task.status === 'Missed'    ? 'border-l-red-400'   : 'border-l-orange-400'
                    }`}>
                      <p className={`text-sm font-medium text-gray-800 dark:text-white ${task.status !== 'Pending' ? 'line-through opacity-60' : ''}`}>
                        {task.title}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        task.status === 'Missed'    ? 'bg-red-100 text-red-600'     :
                                                      'bg-orange-100 text-orange-600'
                      }`}>{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-sm">Click a day to see tasks</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}