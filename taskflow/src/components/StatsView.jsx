import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, subDays } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { CATEGORY_CONFIG } from '../utils/taskUtils'

const PIE_COLORS = ['#22c55e', '#f97316', '#ef4444']

const tooltipStyle = {
  backgroundColor: 'rgba(17,24,39,0.9)',
  border: '1px solid rgba(75,85,99,0.3)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
  padding: '8px 12px',
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
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const pieData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending',   value: stats.pending   },
    { name: 'Missed',    value: stats.missed     },
  ].filter(d => d.value > 0)

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const StatCard = ({ label, value, color, emoji }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>{emoji}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6 overflow-y-auto h-full pb-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Tasks" value={stats.total}     color="bg-gray-100 dark:bg-gray-800"         emoji="📋" />
        <StatCard label="Completed"   value={stats.completed} color="bg-green-100 dark:bg-green-900/30"    emoji="✅" />
        <StatCard label="Pending"     value={stats.pending}   color="bg-orange-100 dark:bg-orange-900/30"  emoji="⏳" />
        <StatCard label="Missed"      value={stats.missed}    color="bg-red-100 dark:bg-red-900/30"        emoji="❌" />
      </div>

      {/* Streak + Rate */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-orange-100 text-sm font-medium mb-1">Current Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{streak}</span>
            <span className="text-orange-200">days</span>
          </div>
          <p className="text-2xl mt-2">🔥</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-gray-500 text-sm font-medium mb-1">Completion Rate</p>
          <span className="text-4xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{completionRate}%</span>
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-green-400 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={8} barCategoryGap="30%">
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(249,115,22,0.05)' }} />
              <Bar dataKey="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending"   fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Missed"    fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Task Status</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>By Category</h3>
          <div className="space-y-2">
            {categoryData.map(({ name, value }) => {
              const cfg = CATEGORY_CONFIG[name] || CATEGORY_CONFIG.Other
              const pct = Math.round((value / stats.total) * 100)
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-6 text-base">{cfg.icon}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-20">{name}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-orange-400 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}