import { format, addDays, startOfDay } from 'date-fns'

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const CATEGORIES = ['Study', 'Work', 'Personal', 'Health', 'Other']
export const PRIORITIES = ['High', 'Medium', 'Low']
export const RECURRENCE_OPTIONS = ['None', 'Daily', 'Weekly', 'Weekdays']

export const PRIORITY_CONFIG = {
  High:   { color: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border border-red-200',    dot: '🔴' },
  Medium: { color: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200', dot: '🟡' },
  Low:    { color: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border border-green-200',  dot: '🟢' },
}

export const CATEGORY_CONFIG = {
  Study:    { icon: '📚', color: 'bg-blue-100 text-blue-700' },
  Work:     { icon: '💼', color: 'bg-purple-100 text-purple-700' },
  Personal: { icon: '✨', color: 'bg-pink-100 text-pink-700' },
  Health:   { icon: '💪', color: 'bg-emerald-100 text-emerald-700' },
  Other:    { icon: '📌', color: 'bg-gray-100 text-gray-600' },
}

export const getWeekDates = (weekOffset = 0) => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = addDays(startOfDay(today), mondayOffset + weekOffset * 7)
  return DAYS.map((name, i) => {
    const date = addDays(monday, i)
    return { name, date, dateStr: format(date, 'yyyy-MM-dd') }
  })
}

export const getMonthDates = (year, month) => {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const days  = []
  const startPad = (first.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

export const shouldTaskAppearOnDate = (task, dateStr) => {
  if (task.date === dateStr) return true
  if (!task.recurrence || task.recurrence === 'None') return false

  const taskDate   = new Date(task.date + 'T00:00')
  const targetDate = new Date(dateStr + 'T00:00')
  if (targetDate < taskDate) return false

  if (task.recurrence === 'Daily')    return true
  if (task.recurrence === 'Weekly')   return taskDate.getDay() === targetDate.getDay()
  if (task.recurrence === 'Weekdays') {
    const d = targetDate.getDay()
    return d !== 0 && d !== 6
  }
  return false
}

export const calcStreak = (tasks) => {
  const completedDates = new Set(
    tasks.filter(t => t.status === 'Completed').map(t => t.date)
  )
  let streak = 0
  let d = new Date()
  while (true) {
    const ds = format(d, 'yyyy-MM-dd')
    if (completedDates.has(ds)) {
      streak++
      d = addDays(d, -1)
    } else break
  }
  return streak
}