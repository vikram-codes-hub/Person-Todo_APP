import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { shouldTaskAppearOnDate } from '../utils/taskUtils'
import TaskCard from './TaskCard'

export default function DayColumn({ day, date, dateStr }) {
  const { filteredTasks, moveTask, openAddModal } = useApp()
  const [isDragOver,  setIsDragOver]  = useState(false)
  const [draggingId,  setDraggingId]  = useState(null)
  const colRef = useRef(null)

  const dayTasks  = filteredTasks.filter(t => shouldTaskAppearOnDate(t, dateStr))
  const completed = dayTasks.filter(t => t.status === 'Completed').length
  const today     = isToday(date)
  const allDone   = dayTasks.length > 0 && completed === dayTasks.length

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
    <motion.div ref={colRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className={`flex flex-col rounded-2xl border-2 transition-all min-h-64 ${
        isDragOver ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30 scale-[1.01]'
        : today    ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                   : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
    >
      {/* Header */}
      <div className={`px-3 pt-3 pb-2 border-b ${today ? 'border-orange-200 dark:border-orange-800' : 'border-gray-100 dark:border-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className={`font-bold text-sm ${today ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}
                style={{ fontFamily: 'Syne, sans-serif' }}>
                {day}
              </p>
              {today   && <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">Today</span>}
              {allDone && <CheckCircle size={14} className="text-green-500" />}
            </div>
            <p className="text-xs text-gray-400">{format(date, 'MMM d')}</p>
          </div>
          <div className="flex items-center gap-1">
            {dayTasks.length > 0 && <span className="text-xs text-gray-400">{completed}/{dayTasks.length}</span>}
            <button onClick={() => openAddModal({ date: dateStr })}
              className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-400 hover:text-orange-500 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        {dayTasks.length > 0 && (
          <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completed / dayTasks.length) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {dayTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-20 text-gray-300 dark:text-gray-700">
              <div className="text-xl mb-1">○</div>
              <p className="text-xs">Drop here</p>
            </motion.div>
          ) : dayTasks.map(task => (
            <div key={task._id} draggable onDragStart={e => onDragStart(e, task._id)} onDragEnd={onDragEnd}>
              <TaskCard task={task} isDragging={draggingId === task._id} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}