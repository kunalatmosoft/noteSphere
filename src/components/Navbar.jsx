import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Notebook, Search, TrendingUp, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-4 z-50 mx-auto w-[96%] max-w-5xl mb-6 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-black/5 dark:border-white/20 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] transition-all duration-500">
      
      <div className="flex items-center justify-between px-4 py-1.5">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full group-hover:bg-accent-100 dark:group-hover:bg-accent-500/30 transition-all duration-300 border border-black/5 dark:border-white/20 group-hover:border-accent-300 dark:group-hover:border-accent-500/50 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] dark:group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <Notebook size={18} className="text-base-900 dark:text-teal-500 group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors drop-shadow-sm" />
          </div>
          <span className="font-bold text-base tracking-tight text-base-950 dark:text-teal-500 drop-shadow-sm">
            Notesphere
          </span>
        </Link>

        {/* Navigation Actions - Adaptive Inner Bubble */}
        <div className="flex items-center gap-1 bg-white/50 dark:bg-white/[0.12] rounded-full px-1.5 py-1 border border-black/5 dark:border-white/20 backdrop-blur-md shadow-inner dark:shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]">
          
          <Link to="/search" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/20 text-base-600 hover:text-base-950 dark:text-gray-900 dark:hover:text-white transition-all duration-300 active:scale-95" title="Search">
            <Search size={16} />
          </Link>
          <Link to="/trending" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/20 text-base-600 hover:text-base-950 dark:text-gray-900 dark:hover:text-white transition-all duration-300 active:scale-95" title="Trending">
            <TrendingUp size={16} />
          </Link>

          <div className="w-px h-4 bg-black/10 dark:bg-white/20 mx-1 sm:mx-1.5" /> {/* Adaptive Divider */}

          {user ? (
            <>
              <Link
                to="/notes"
                className="px-3 py-1 rounded-full bg-accent-100 hover:bg-accent-200 dark:bg-accent-500/30 dark:hover:bg-accent-500/40 border border-accent-200 dark:border-accent-500/40 text-accent-700 dark:text-accent-100 text-xs font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95"
              >
                My Notes
              </Link>
              
              <Link to={`/u/${profile?.username}`} className="p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/20 transition-all duration-300 border border-transparent hover:border-black/10 dark:hover:border-white/30 active:scale-95" title="Profile">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} className="w-6 h-6 rounded-full object-cover shadow-inner" alt="User Avatar" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/20 flex items-center justify-center border border-black/10 dark:border-white/20">
                    <User size={14} className="text-base-700 dark:text-black" />
                  </div>
                )}
              </Link>
              
              <button
                onClick={() => logout().then(() => navigate('/'))}
                className="p-1.5 rounded-full hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/30 dark:hover:text-rose-200 text-base-600 dark:text-gray-900 transition-all duration-300 active:scale-95"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block px-3 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/20 text-base-600 hover:text-base-950 dark:text-gray-200 dark:hover:text-white text-xs font-medium transition-all duration-300 active:scale-95">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-1 rounded-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-400 text-white text-xs font-medium transition-all duration-300 shadow-[0_4px_10px_rgba(99,102,241,0.2)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-accent-700/50 dark:border-accent-300/50 hover:scale-105 active:scale-95">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}