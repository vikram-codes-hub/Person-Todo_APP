import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar, Flag, Tag, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { CATEGORIES, PRIORITIES, RECURRENCE_OPTIONS, CATEGORY_CONFIG, PRIORITY_CONFIG } from '../utils/taskUtils'

const defaultForm = () => ({
  title: '', description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '', priority: 'Medium', category: 'Study', recurrence: 'None',
})

export default function TaskModal() {
  const { showAddModal, setShowAddModal, editingTask, setEditingTask, addTask, updateTask, addDefaults } = useApp()
  const isEdit = !!editingTask
  const isOpen = showAddModal || isEdit

  const [form,   setForm]   = useState(defaultForm())
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingTask)        setForm({ ...defaultForm(), ...editingTask })
    else if (showAddModal)  setForm({ ...defaultForm(), ...addDefaults })
    setErrors({})
  }, [editingTask, showAddModal, addDefaults])

  const close = () => { setShowAddModal(false); setEditingTask(null) }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.date)         e.date  = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    if (isEdit) await updateTask(editingTask._id, form)
    else        await addTask(form)
    setSaving(false)
    close()
  }

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {isEdit ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={close} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <input autoFocus value={form.title} onChange={e => set('title', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Task title..."
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Description (optional)..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1"><Calendar size={12} /> Date</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1"><Clock size={12} /> Time</label>
                  <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2"><Flag size={12} /> Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => set('priority', p)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.priority === p ? PRIORITY_CONFIG[p].badge : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'}`}>
                      {PRIORITY_CONFIG[p].dot} {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2"><Tag size={12} /> Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => set('category', c)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${form.category === c ? CATEGORY_CONFIG[c].color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {CATEGORY_CONFIG[c].icon} {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2"><Repeat size={12} /> Recurrence</label>
                <div className="flex gap-2 flex-wrap">
                  {RECURRENCE_OPTIONS.map(r => (
                    <button key={r} onClick={() => set('recurrence', r)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${form.recurrence === r ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={close} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                {saving ? 'Saving...' : isEdit ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}