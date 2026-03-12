import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
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

  const dateRange = `${format(weekDates[0].date, 'MMM d')} – ${format(weekDates[6].date, 'MMM d, yyyy')}`

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-orange-500 transition-all active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <motion.h2
            key={weekLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-black text-lg sm:text-xl text-gray-800 dark:text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {weekLabel}
          </motion.h2>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
            <CalendarDays size={11} /> {dateRange}
          </p>
        </div>

        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-orange-500 transition-all active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid — horizontal scroll on mobile, 7-col on desktop */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 h-full min-w-[640px]">
          {weekDates.map(({ name, date, dateStr }) => (
            <DayColumn key={dateStr} day={name.slice(0, 3)} date={date} dateStr={dateStr} />
          ))}
        </div>
      </div>
    </div>
  )
}