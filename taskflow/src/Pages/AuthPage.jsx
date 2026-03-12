import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authAPI } from '../utils/api'

export default function AuthPage({ onAuth }) {
  const [mode,    setMode]    = useState('login') // 'login' | 'register'
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setError('Please fill in all fields')
    if (mode === 'register' && !form.name.trim()) return setError('Name is required')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')

    setLoading(true)
    setError('')
    try {
     const res = mode === 'login'
  ? await authAPI.login({ email: form.email, password: form.password })
  : await authAPI.register({ name: form.name, email: form.email, password: form.password })

const { token, user } = res 
localStorage.setItem('tf_token', token)
localStorage.setItem('tf_user',  JSON.stringify(user))
onAuth(user)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-200 dark:shadow-orange-900/40 mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h1
            className="text-3xl font-black text-gray-900 dark:text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            TaskFlow
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* Mode tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setForm({ name: '', email: '', password: '' }) }}
                className={`flex-1 py-3.5 text-sm font-bold capitalize transition-all ${
                  mode === m
                    ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 space-y-4">

            {/* Name field (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      onKeyDown={handleKey}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onKeyDown={handleKey}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onKeyDown={handleKey}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
              <button
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-xl"
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-orange-200 dark:shadow-orange-900/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </motion.button>

            {/* Switch mode */}
            <p className="text-center text-xs text-gray-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={switchMode}
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Features hint */}
        {mode === 'register' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 grid grid-cols-3 gap-2 text-center"
          >
            {['Track daily tasks', 'Build streaks 🔥', 'See your stats 📊'].map(f => (
              <div key={f} className="flex items-center justify-center gap-1 text-xs text-gray-400 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-2 py-2">
                <CheckCircle size={10} className="text-green-400 flex-shrink-0" /> {f}
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}