import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../utils/taskUtils'

export default function SearchPanel() {
  const { searchQuery, setSearchQuery, filteredTasks, setEditingTask } = useApp()
  const isSearching = searchQuery.length > 0

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search tasks... (Q to add)"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-orange-300 dark:focus:border-orange-600 focus:outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400 transition-all"
        />
        {isSearching && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-40 max-h-72 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">No tasks found for "{searchQuery}"</div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''}
                </div>
                {filteredTasks.map(task => {
                  const catCfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.Other
                  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
                  return (
                    <button key={task._id} onClick={() => { setEditingTask(task); setSearchQuery('') }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3 transition-colors">
                      <span className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${priCfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-800 dark:text-white truncate ${task.status !== 'Pending' ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{format(new Date(task.date + 'T00:00'), 'MMM d')}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md ${catCfg.color}`}>{catCfg.icon} {task.category}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                            task.status === 'Missed'    ? 'bg-red-100 text-red-600'     :
                                                          'bg-orange-100 text-orange-600'
                          }`}>{task.status}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}