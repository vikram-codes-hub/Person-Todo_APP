import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '../hooks/useApp'
import { getWeekDates } from '../utils/taskUtils'
import DayColumn from './DayColumn'

export default function WeeklyView() {
  const { weekOffset, setWeekOffset } = useApp()
  const weekDates = getWeekDates(weekOffset)

  const weekLabel =
    weekOffset === 0  ? 'This Week'  :
    weekOffset === -1 ? 'Last Week'  :
    weekOffset === 1  ? 'Next Week'  :
    `${format(weekDates[0].date, 'MMM d')} – ${format(weekDates[6].date, 'MMM d')}`

  return (
    <div className="h-full flex flex-col">
      {/* Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <motion.h2 key={weekLabel} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="font-bold text-lg text-gray-800 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          {weekLabel}
        </motion.h2>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-3 flex-1 min-h-0">
        {weekDates.map(({ name, date, dateStr }) => (
          <DayColumn key={dateStr} day={name.slice(0, 3)} date={date} dateStr={dateStr} />
        ))}
      </div>
    </div>
  )
}