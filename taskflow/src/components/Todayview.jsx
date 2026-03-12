import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Plus, Check, X, Clock, CalendarDays, Flame, Pencil,
  GripVertical, ChevronRight, Info
} from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday, addDays } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { PRIORITY_CONFIG, CATEGORY_CONFIG, CATEGORIES, PRIORITIES } from '../utils/taskUtils'

// ── Legend Popup ───────────────────────────────────────────
function Legend() {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setShow(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs font-medium transition-all"
      >
        <Info size={13} /> Legend
      </button>
      <AnimatePresence>
        {show && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-10 z-50 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5"
            >
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                📖 Legend
              </h4>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Task Status</p>
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                  <div><span className="text-xs font-semibold text-gray-500">Pending</span><span className="text-xs text-gray-400 ml-1.5">— Not done yet</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" strokeWidth={3} /></div>
                  <div><span className="text-xs font-semibold text-green-500">Completed</span><span className="text-xs text-gray-400 ml-1.5">— Task finished</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0"><X size={10} className="text-white" strokeWidth={3} /></div>
                  <div><span className="text-xs font-semibold text-red-400">Missed</span><span className="text-xs text-gray-400 ml-1.5">— Past due, not done</span></div>
                </div>
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority Dot</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3"><span className="text-base">🔴</span><div><span className="text-xs font-semibold text-red-500">High</span><span className="text-xs text-gray-400 ml-1.5">— Urgent, do first</span></div></div>
                <div className="flex items-center gap-3"><span className="text-base">🟡</span><div><span className="text-xs font-semibold text-yellow-500">Medium</span><span className="text-xs text-gray-400 ml-1.5">— Important but flexible</span></div></div>
                <div className="flex items-center gap-3"><span className="text-base">🟢</span><div><span className="text-xs font-semibold text-green-500">Low</span><span className="text-xs text-gray-400 ml-1.5">— Do when you can</span></div></div>
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Left Border</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3"><div className="w-1 h-7 rounded-full bg-orange-400 flex-shrink-0" /><span className="text-xs text-gray-500">Orange — Pending task</span></div>
                <div className="flex items-center gap-3"><div className="w-1 h-7 rounded-full bg-green-400 flex-shrink-0" /><span className="text-xs text-gray-500">Green — Completed task</span></div>
                <div className="flex items-center gap-3"><div className="w-1 h-7 rounded-full bg-red-400 flex-shrink-0" /><span className="text-xs text-gray-500">Red — Missed task</span></div>
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {CATEGORIES.map(c => (
                  <div key={c} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold ${CATEGORY_CONFIG[c].color}`}>
                    {CATEGORY_CONFIG[c].icon} {c}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <GripVertical size={13} className="text-gray-400" />
                <p className="text-xs text-gray-500">Drag grip icon to reorder tasks</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Quick Add Bar ──────────────────────────────────────────
function QuickAddBar() {
  const { addTask } = useApp()
  const [open,     setOpen]     = useState(false)
  const [title,    setTitle]    = useState('')
  const [date,     setDate]     = useState(format(new Date(), 'yyyy-MM-dd'))
  const [priority, setPriority] = useState('Medium')
  const [category, setCategory] = useState('Study')
  const [time,     setTime]     = useState('')

  const reset = () => {
    setTitle(''); setTime(''); setPriority('Medium'); setCategory('Study')
    setDate(format(new Date(), 'yyyy-MM-dd')); setOpen(false)
  }

  const submit = async () => {
    if (!title.trim()) return
    await addTask({ title, date, priority, category, time, description: '', recurrence: 'None' })
    reset()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') reset()
  }

  const dateLabel = isToday(new Date(date + 'T00:00'))    ? 'Today'
                  : isTomorrow(new Date(date + 'T00:00')) ? 'Tomorrow'
                  : format(new Date(date + 'T00:00'), 'MMM d')

  return (
    <div className="mb-6">
      {!open ? (
        <motion.button whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }}
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-4 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <Plus size={15} className="text-orange-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium">Add a task for today...</span>
          <kbd className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-1 rounded-lg font-mono">Q</kbd>
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-orange-400 shadow-xl shadow-orange-100/50 dark:shadow-orange-900/20 overflow-hidden"
        >
          <div className="px-5 pt-5 pb-3">
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={handleKey}
              placeholder="What do you need to do?"
              className="w-full text-base font-medium text-gray-900 dark:text-white bg-transparent placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-semibold w-16 flex-shrink-0">When:</span>
              <label className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors">
                <CalendarDays size={12} /> {dateLabel}
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
              </label>
              <label className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors">
                <Clock size={12} /> {time || 'Set time'}
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
              </label>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-semibold w-16 flex-shrink-0">Priority:</span>
              <div className="flex items-center gap-1.5">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      priority === p ? PRIORITY_CONFIG[p].badge : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
                    {PRIORITY_CONFIG[p].dot} {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-semibold w-16 flex-shrink-0">Category:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      category === c ? CATEGORY_CONFIG[c].color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
                    {CATEGORY_CONFIG[c].icon} {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={reset} className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                Cancel
              </button>
              <button onClick={submit} disabled={!title.trim()}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                Add Task ↵
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Task Row ───────────────────────────────────────────────
function TaskRow({ task, showDate = false }) {
  const { toggleComplete, deleteTask, setEditingTask, updateTask } = useApp()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)

  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
  const catCfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.Other

  const handleDelete = () => {
    if (confirmDelete) deleteTask(task._id)
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2000) }
  }

  const handleReschedule = async (e) => {
    await updateTask(task._id, { date: e.target.value })
    setShowDatePicker(false)
  }

  const borderColor = { Completed: 'border-l-green-400', Missed: 'border-l-red-400', Pending: 'border-l-orange-400' }[task.status]
  const rowBg       = { Completed: 'bg-green-50/30 dark:bg-green-900/10', Missed: 'bg-red-50/30 dark:bg-red-900/10', Pending: 'bg-white dark:bg-gray-900' }[task.status]

  return (
    <Reorder.Item
      value={task}
      className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl border-l-4 ${borderColor} ${rowBg} shadow-sm hover:shadow-md transition-all`}
    >
      {/* Drag handle */}
      <div className="flex-shrink-0 text-gray-300 dark:text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" title="Drag to reorder">
        <GripVertical size={15} />
      </div>

      {/* Checkbox */}
      <button onClick={() => toggleComplete(task._id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/30'
          : task.status === 'Missed'  ? 'bg-red-400 border-red-400 text-white'
          : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
        }`}>
        {task.status === 'Completed' && <Check size={12} strokeWidth={3} />}
        {task.status === 'Missed'    && <X size={12} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-gray-900 dark:text-white truncate ${task.status !== 'Pending' ? 'line-through opacity-40' : ''}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${catCfg.color}`}>{catCfg.icon} {task.category}</span>
          {task.time && <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10} />{task.time}</span>}
          {showDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
              <CalendarDays size={10} />
              {isToday(new Date(task.date + 'T00:00'))     ? 'Today'
              : isTomorrow(new Date(task.date + 'T00:00')) ? 'Tomorrow'
              : isYesterday(new Date(task.date + 'T00:00'))? 'Yesterday'
              : format(new Date(task.date + 'T00:00'), 'MMM d')}
            </span>
          )}
          {task.status === 'Missed' && (
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-500 px-2 py-0.5 rounded-lg font-semibold">✗ Missed</span>
          )}
          {task.recurrence && task.recurrence !== 'None' && (
            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-500 px-2 py-0.5 rounded-lg font-medium">↻ {task.recurrence}</span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <div className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${priCfg.badge}`}>
        {priCfg.dot} {task.priority}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <div className="relative">
          <button onClick={() => setShowDatePicker(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-orange-500 transition-colors" title="Reschedule">
            <CalendarDays size={14} />
          </button>
          <AnimatePresence>
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-9 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 w-52">
                  <p className="text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-wider">Move task to</p>
                  <div className="flex flex-col gap-1.5 mb-3">
                    {[
                      { label: '📅 Today',      date: format(new Date(), 'yyyy-MM-dd') },
                      { label: '⏭ Tomorrow',   date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
                      { label: '📆 In 2 days',  date: format(addDays(new Date(), 2), 'yyyy-MM-dd') },
                      { label: '📆 In 3 days',  date: format(addDays(new Date(), 3), 'yyyy-MM-dd') },
                    ].map(({ label, date }) => (
                      <button key={date} onClick={() => updateTask(task._id, { date }).then(() => setShowDatePicker(false))}
                        className="w-full text-left text-xs py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-colors font-medium">
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <p className="text-xs text-gray-400 mb-1.5 font-medium">Custom date</p>
                    <input type="date" defaultValue={task.date} onChange={handleReschedule}
                      className="w-full text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => setEditingTask(task)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-orange-500 transition-colors" title="Edit">
          <Pencil size={14} />
        </button>

        <button onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-colors ${confirmDelete ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500'}`}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}>
          <X size={14} />
        </button>
      </div>
    </Reorder.Item>
  )
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ title, count, color, accent }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-7">
      <div className={`w-1.5 h-5 rounded-full ${accent}`} />
      <h3 className={`text-xs font-black uppercase tracking-widest ${color}`}>{title}</h3>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color} bg-current/10`} style={{ background: 'currentColor', opacity: 1 }}>
          <span className="bg-white dark:bg-gray-950 px-1.5 py-0.5 rounded-full">{count}</span>
        </span>
      )}
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

// ── Main TodayView ─────────────────────────────────────────
export default function TodayView() {
  const { tasks, streak, setActiveView } = useApp()

  const todayStr  = format(new Date(), 'yyyy-MM-dd')
  const todayAll  = tasks.filter(t => t.date === todayStr)
  const pending   = todayAll.filter(t => t.status === 'Pending')
  const completed = todayAll.filter(t => t.status === 'Completed')
  const missed    = todayAll.filter(t => t.status === 'Missed')
  const upcoming  = tasks
    .filter(t => t.date > todayStr && t.status === 'Pending')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const completionPct = todayAll.length > 0
    ? Math.round((completed.length / todayAll.length) * 100) : 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-2xl mx-auto w-full pb-16">

      {/* ── Hero ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-400 font-medium mb-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              {greeting()} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
              {pending.length === 0 && todayAll.length > 0
                ? 'All done for today! Amazing work 🎉'
                : pending.length === 0
                ? 'No tasks yet — add one below'
                : `${pending.length} task${pending.length !== 1 ? 's' : ''} remaining today`}
            </p>

            {todayAll.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Today's progress</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{completionPct}%</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                    initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-500 font-semibold"><Check size={11} strokeWidth={3} /> {completed.length} done</span>
                  <span className="flex items-center gap-1 text-orange-400 font-semibold">○ {pending.length} left</span>
                  {missed.length > 0 && <span className="flex items-center gap-1 text-red-400 font-semibold"><X size={11} strokeWidth={3} /> {missed.length} missed</span>}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {streak > 0 && (
              <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                className="flex flex-col items-center px-4 py-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                <Flame size={20} />
                <span className="text-2xl font-black leading-none mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{streak}</span>
                <span className="text-xs text-orange-200 mt-0.5">day streak</span>
              </motion.div>
            )}
            <Legend />
          </div>
        </div>
      </motion.div>

      {/* ── Quick Add ────────────────────────────────── */}
      <QuickAddBar />

      {/* ── Pending ──────────────────────────────────── */}
      <SectionHeader title="To Do" count={pending.length} color="text-orange-500" accent="bg-orange-400" />
      {pending.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 text-xs mb-2">
          ✓ No pending tasks — you're on top of things!
        </div>
      ) : (
        <Reorder.Group axis="y" values={pending} onReorder={() => {}} className="space-y-2">
          {pending.map(task => <TaskRow key={task._id} task={task} />)}
        </Reorder.Group>
      )}

      {/* ── Completed ────────────────────────────────── */}
      {completed.length > 0 && (
        <>
          <SectionHeader title="Completed" count={completed.length} color="text-green-500" accent="bg-green-400" />
          <Reorder.Group axis="y" values={completed} onReorder={() => {}} className="space-y-2">
            {completed.map(task => <TaskRow key={task._id} task={task} />)}
          </Reorder.Group>
        </>
      )}

      {/* ── Missed ───────────────────────────────────── */}
      {missed.length > 0 && (
        <>
          <SectionHeader title="Missed" count={missed.length} color="text-red-400" accent="bg-red-400" />
          <Reorder.Group axis="y" values={missed} onReorder={() => {}} className="space-y-2">
            {missed.map(task => <TaskRow key={task._id} task={task} />)}
          </Reorder.Group>
        </>
      )}

      {/* ── Empty state ──────────────────────────────── */}
      {todayAll.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="text-7xl mb-4">📋</div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg">Nothing planned for today</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Click the bar above or press Q to get started</p>
        </motion.div>
      )}

      {/* ── Upcoming ─────────────────────────────────── */}
      {upcoming.length > 0 && (
        <>
          <SectionHeader title="Coming Up" count={upcoming.length} color="text-blue-400" accent="bg-blue-400" />
          <Reorder.Group axis="y" values={upcoming} onReorder={() => {}} className="space-y-2">
            {upcoming.map(task => <TaskRow key={task._id} task={task} showDate />)}
          </Reorder.Group>
        </>
      )}

      {/* ── Weekly planner link ───────────────────────── */}
      <motion.button whileHover={{ x: 3 }} onClick={() => setActiveView('weekly')}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-sm text-gray-400 hover:text-orange-500 hover:border-orange-300 dark:hover:border-orange-800 transition-all font-medium">
        Open full weekly planner <ChevronRight size={16} />
      </motion.button>
    </div>
  )
}