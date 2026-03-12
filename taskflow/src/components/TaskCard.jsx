import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Pencil, Clock, GripVertical } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../utils/taskUtils'

export default function TaskCard({ task, isDragging }) {
  const { toggleComplete, deleteTask, setEditingTask } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
  const catCfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.Other

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) deleteTask(task._id)
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2000) }
  }

  const borderColors = {
    Completed: 'border-l-green-400',
    Missed:    'border-l-red-400',
    Pending:   'border-l-orange-400',
  }
  const bgColors = {
    Completed: 'bg-green-50/60 dark:bg-green-900/10',
    Missed:    'bg-red-50/60 dark:bg-red-900/10',
    Pending:   'bg-white dark:bg-gray-800',
  }

  return (
    <motion.div
      layout
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative rounded-xl border-l-[3px] px-2.5 py-2 shadow-sm transition-all cursor-grab active:cursor-grabbing
        ${borderColors[task.status]} ${bgColors[task.status]}
        ${isDragging ? 'shadow-xl rotate-1 scale-105 z-50' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-start gap-1.5">
        {/* Drag grip */}
        <div className="mt-0.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <GripVertical size={12} />
        </div>

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleComplete(task._id) }}
          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
            task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-200' :
            task.status === 'Missed'    ? 'bg-red-400 border-red-400 text-white' :
            'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          {task.status === 'Completed' && <span className="text-[8px] font-black">✓</span>}
          {task.status === 'Missed'    && <span className="text-[8px] font-black">✗</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold text-gray-900 dark:text-white leading-tight truncate ${
            task.status !== 'Pending' ? 'line-through opacity-50' : ''
          }`}>
            {task.title}
          </p>

          {task.description && (
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{task.description}</p>
          )}

          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {task.time && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Clock size={9} /> {task.time}
              </span>
            )}
            <span className={`text-[10px] px-1 py-0.5 rounded-md font-medium ${catCfg.color}`}>
              {catCfg.icon}
            </span>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${priCfg.color}`} title={task.priority} />
            {task.recurrence && task.recurrence !== 'None' && (
              <span className="text-[10px] text-blue-400" title={task.recurrence}>↻</span>
            )}
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
          className="p-1 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/30 text-gray-400 hover:text-orange-500 transition-colors"
        >
          <Pencil size={10} />
        </button>
        <button
          onClick={handleDelete}
          className={`p-1 rounded-lg shadow-sm transition-colors ${
            confirmDelete
              ? 'bg-red-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500'
          }`}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          <Trash2 size={10} />
        </button>
      </div>
    </motion.div>
  )
}