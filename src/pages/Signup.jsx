import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, name)
      navigate('/notes')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-base-950 border border-base-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Subtle top gradient accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-70" />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create an account</h1>
          <p className="text-base-400 text-sm">Join today to start organizing your thoughts</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-base-300 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-500 group-focus-within:text-accent-500 transition-colors" size={18} />
              <input
                required placeholder="John Doe" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-base-900/50 border border-base-800 rounded-xl pl-10 pr-4 py-2.5 text-base-100 placeholder-base-600 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-base-300 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-500 group-focus-within:text-accent-500 transition-colors" size={18} />
              <input
                type="email" required placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-base-900/50 border border-base-800 rounded-xl pl-10 pr-4 py-2.5 text-base-100 placeholder-base-600 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-base-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-500 group-focus-within:text-accent-500 transition-colors" size={18} />
              <input
                type="password" required placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-base-900/50 border border-base-800 rounded-xl pl-10 pr-4 py-2.5 text-base-100 placeholder-base-600 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-base-500 ml-1 mt-1">Must be at least 6 characters.</p>
          </div>

          <button 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl py-2.5 font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-4 shadow-lg shadow-accent-500/20"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-base-800"></div>
          <span className="text-xs font-medium text-base-500 uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 h-px bg-base-800"></div>
        </div>

        <button
          onClick={() => loginWithGoogle().then(() => navigate('/notes'))}
          className="w-full flex items-center justify-center gap-3 bg-base-900 border border-base-800 hover:bg-base-800 hover:border-base-700 text-base-100 rounded-xl py-2.5 font-medium transition-all active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-sm text-center text-base-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-400 font-medium hover:text-accent-300 transition-colors">
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}