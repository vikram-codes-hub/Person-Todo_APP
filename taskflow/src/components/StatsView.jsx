import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { format, subDays } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { CATEGORY_CONFIG } from '../utils/taskUtils'

const PIE_COLORS = ['#22c55e', '#f97316', '#ef4444']

const tooltipStyle = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(75,85,99,0.2)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
  padding: '8px 12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
}

function StatCard({ label, value, color, emoji, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-xl flex-shrink-0`}>
        {emoji}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{label}</p>
      </div>
    </motion.div>
  )
}

export default function StatsView() {
  const { tasks, stats, streak } = useApp()

  const weeklyData = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const date    = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const day     = tasks.filter(t => t.date === dateStr)
      return {
        day:       format(date, 'EEE'),
        Completed: day.filter(t => t.status === 'Completed').length,
        Pending:   day.filter(t => t.status === 'Pending').length,
        Missed:    day.filter(t => t.status === 'Missed').length,
      }
    }), [tasks])

  const categoryData = useMemo(() => {
    const counts = {}
    tasks.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [tasks])

  const pieData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending',   value: stats.pending   },
    { name: 'Missed',    value: stats.missed     },
  ].filter(d => d.value > 0)

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="space-y-4 overflow-y-auto pb-6">

      {/* ── Stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Tasks" value={stats.total}     color="bg-gray-100 dark:bg-gray-800"        emoji="📋" delay={0}    />
        <StatCard label="Completed"   value={stats.completed} color="bg-green-100 dark:bg-green-900/30"   emoji="✅" delay={0.05} />
        <StatCard label="Pending"     value={stats.pending}   color="bg-orange-100 dark:bg-orange-900/30" emoji="⏳" delay={0.1}  />
        <StatCard label="Missed"      value={stats.missed}    color="bg-red-100 dark:bg-red-900/30"       emoji="❌" delay={0.15} />
      </div>

      {/* ── Streak + Completion rate ─────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -right-1 bottom-0 w-12 h-12 rounded-full bg-white/5" />
          <p className="text-orange-100 text-xs sm:text-sm font-medium mb-1 relative">Current Streak</p>
          <div className="flex items-baseline gap-1.5 relative">
            <span className="text-3xl sm:text-4xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>{streak}</span>
            <span className="text-orange-200 text-sm">days</span>
          </div>
          <p className="text-2xl mt-1.5 relative">🔥</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5"
        >
          <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Completion Rate</p>
          <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {completionRate}%
          </span>
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{stats.completed} of {stats.total} tasks done</p>
        </motion.div>
      </div>

      {/* ── Charts ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5"
        >
          <h3 className="font-black text-gray-900 dark:text-white mb-4 text-sm sm:text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
            Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={7} barCategoryGap="35%">
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(249,115,22,0.06)', radius: 4 }} />
              <Bar dataKey="Completed" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Pending"   fill="#f97316" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Missed"    fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Manual legend */}
          <div className="flex items-center justify-center gap-4 mt-2">
            {[['#22c55e','Completed'],['#f97316','Pending'],['#ef4444','Missed']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5"
        >
          <h3 className="font-black text-gray-900 dark:text-white mb-4 text-sm sm:text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
            Task Status
          </h3>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-gray-300 dark:text-gray-700">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-xs">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />)}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Category breakdown ───────────────────── */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5"
        >
          <h3 className="font-black text-gray-900 dark:text-white mb-4 text-sm sm:text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
            By Category
          </h3>
          <div className="space-y-2.5">
            {categoryData.map(({ name, value }, i) => {
              const cfg = CATEGORY_CONFIG[name] || CATEGORY_CONFIG.Other
              const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
              return (
                <div key={name} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-5 text-base flex-shrink-0">{cfg.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-16 sm:w-20 truncate flex-shrink-0">{name}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.4 + i * 0.06 }}
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-4 text-right">{value}</span>
                    <span className="text-[10px] text-gray-400 w-7">({pct}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}