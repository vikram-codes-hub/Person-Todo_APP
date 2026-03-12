import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../hooks/useApp'

export function Confetti() {
  const { confetti, streak } = useApp()
  const colors = ['#f97316', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']

  if (!confetti) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => (
        <motion.div key={i} className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${Math.random() * 100}%`, top: '-10px', backgroundColor: colors[i % colors.length] }}
          animate={{ y: ['0vh', '110vh'], x: [0, (Math.random() - 0.5) * 200], rotate: [0, Math.random() * 720 - 360], opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'easeIn' }}
        />
      ))}
      <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.5 }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl px-8 py-6 shadow-2xl">
          <p className="text-5xl mb-2">🔥</p>
          <p className="font-bold text-2xl text-orange-500" style={{ fontFamily: 'Syne, sans-serif' }}>{streak} Day Streak!</p>
          <p className="text-gray-500 text-sm mt-1">You're on fire! Keep it up!</p>
        </div>
      </motion.div>
    </div>
  )
}

export function Notification() {
  const { notification } = useApp()
  return (
    <AnimatePresence>
      {notification && (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed bottom-6 right-6 z-[90] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-gray-900 dark:bg-white dark:text-gray-900'
          }`}>
          <span>{notification.type === 'error' ? '🗑️' : '✓'}</span>
          {notification.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}