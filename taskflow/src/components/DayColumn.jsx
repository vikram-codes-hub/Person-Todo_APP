import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Sparkles } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { shouldTaskAppearOnDate } from '../utils/taskUtils'
import TaskCard from './TaskCard'

export default function DayColumn({ day, date, dateStr }) {
  const { filteredTasks, moveTask, openAddModal } = useApp()
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const colRef = useRef(null)

  const dayTasks  = filteredTasks.filter(t => shouldTaskAppearOnDate(t, dateStr))
  const completed = dayTasks.filter(t => t.status === 'Completed').length
  const pending   = dayTasks.filter(t => t.status === 'Pending').length
  const missed    = dayTasks.filter(t => t.status === 'Missed').length
  const today     = isToday(date)
  const allDone   = dayTasks.length > 0 && completed === dayTasks.length
  const pct       = dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0

  const onDragStart = (e, id) => { e.dataTransfer.setData('taskId', id); setDraggingId(id) }
  const onDragEnd   = ()      => setDraggingId(null)
  const onDragOver  = (e)     => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = (e)     => { if (!colRef.current?.contains(e.relatedTarget)) setIsDragOver(false) }
  const onDrop      = async (e) => {
    e.preventDefault(); setIsDragOver(false)
    const id = e.dataTransfer.getData('taskId')
    if (id) await moveTask(id, dateStr)
  }

  return (
    <motion.div
      ref={colRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col rounded-2xl border-2 transition-all duration-200 min-h-56 overflow-hidden ${
        isDragOver
          ? 'border-orange-400 bg-orange-50/60 dark:bg-orange-950/30 scale-[1.015] shadow-lg shadow-orange-200/40 dark:shadow-orange-900/20'
          : today
          ? 'border-orange-300/70 dark:border-orange-700/50 bg-gradient-to-b from-orange-50/60 to-white dark:from-orange-950/20 dark:to-gray-900'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
      }`}
    >
      {/* Header */}
      <div className={`px-2.5 pt-2.5 pb-2 border-b ${
        today ? 'border-orange-200/60 dark:border-orange-800/40' : 'border-gray-100 dark:border-gray-800'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p
              className={`font-black text-sm truncate ${
                today ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
              }`}
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {day}
            </p>
            {today && (
              <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 leading-tight">
                Today
              </span>
            )}
            {allDone && <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />}
          </div>
          <button
            onClick={() => openAddModal({ date: dateStr })}
            className="p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-400 hover:text-orange-500 transition-all active:scale-90 flex-shrink-0"
          >
            <Plus size={13} />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mb-1.5">{format(date, 'MMM d')}</p>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${allDone ? 'bg-green-400' : 'bg-orange-400'}`}
            initial={{ width: 0 }}
            animate={{ width: dayTasks.length > 0 ? `${pct}%` : '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Mini stats */}
        {dayTasks.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {completed > 0 && <span className="text-[10px] text-green-500 font-semibold">✓{completed}</span>}
            {pending   > 0 && <span className="text-[10px] text-orange-400 font-semibold">○{pending}</span>}
            {missed    > 0 && <span className="text-[10px] text-red-400 font-semibold">✗{missed}</span>}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {dayTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex flex-col items-center justify-center h-20 transition-colors rounded-xl border border-dashed ${
                isDragOver
                  ? 'border-orange-400 text-orange-400'
                  : 'border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-700'
              }`}
            >
              <div className="text-lg mb-0.5">{isDragOver ? '📥' : '○'}</div>
              <p className="text-[10px] font-medium">{isDragOver ? 'Drop here' : 'Empty'}</p>
            </motion.div>
          ) : (
            dayTasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                draggable
                onDragStart={e => onDragStart(e, task._id)}
                onDragEnd={onDragEnd}
              >
                <TaskCard task={task} isDragging={draggingId === task._id} />
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Sparkle on all done */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-1 py-1"
          >
            <Sparkles size={11} className="text-green-400" />
            <span className="text-[10px] text-green-500 font-bold">All done!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}