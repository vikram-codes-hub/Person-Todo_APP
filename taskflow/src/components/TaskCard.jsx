import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Pencil, Clock, GripVertical } from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../utils/taskUtils'

export default function TaskCard({ task, isDragging }) {
  const { toggleComplete, deleteTask, setEditingTask } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const priCfg = PRIORITY_CONFIG[task.priority]  || PRIORITY_CONFIG.Medium
  const catCfg = CATEGORY_CONFIG[task.category]  || CATEGORY_CONFIG.Other

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) { deleteTask(task._id) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2000) }
  }

  const borderColors = {
    Completed: 'border-l-green-400 bg-green-50/50 dark:bg-green-900/10',
    Missed:    'border-l-red-400   bg-red-50/50   dark:bg-red-900/10',
    Pending:   'border-l-orange-400 bg-white       dark:bg-gray-800',
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative rounded-xl border-l-4 p-3 shadow-sm hover:shadow-md transition-all ${borderColors[task.status]} ${isDragging ? 'shadow-xl rotate-1 scale-105' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag grip */}
        <div className="mt-0.5 text-gray-300 dark:text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <GripVertical size={14} />
        </div>

        {/* Checkbox */}
        <button onClick={() => toggleComplete(task._id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' :
            task.status === 'Missed'    ? 'bg-red-400   border-red-400   text-white' :
            'border-gray-300 dark:border-gray-600 hover:border-orange-400'
          }`}>
          {task.status === 'Completed' && <span className="text-xs">✓</span>}
          {task.status === 'Missed'    && <span className="text-xs">✗</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium text-gray-900 dark:text-white leading-tight truncate ${task.status !== 'Pending' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {task.time && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Clock size={10} /> {task.time}
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${catCfg.color}`}>{catCfg.icon}</span>
            <span className={`inline-block w-2 h-2 rounded-full ${priCfg.color}`} title={task.priority} />
            {task.recurrence && task.recurrence !== 'None' && (
              <span className="text-xs text-gray-400" title={task.recurrence}>↻</span>
            )}
            {task.status === 'Missed' && (
              <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-md font-medium">Missed</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); setEditingTask(task) }}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-orange-500 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={handleDelete}
            className={`p-1 rounded-lg transition-colors ${confirmDelete ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500'}`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}