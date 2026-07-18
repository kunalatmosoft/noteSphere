import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Notebook, Search, TrendingUp, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-base-800 bg-base-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <Notebook size={22} className="text-accent-500" />
          Notesphere
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link to="/search" className="p-2 rounded-lg hover:bg-base-800 text-base-300" title="Search">
            <Search size={18} />
          </Link>
          <Link to="/trending" className="p-2 rounded-lg hover:bg-base-800 text-base-300" title="Trending">
            <TrendingUp size={18} />
          </Link>

          {user ? (
            <>
              <Link
                to="/notes"
                className="px-3 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-sm font-medium"
              >
                My Notes
              </Link>
              <Link to={`/u/${profile?.username}`} className="p-1.5 rounded-full hover:bg-base-800" title="Profile">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </Link>
              <button
                onClick={() => logout().then(() => navigate('/'))}
                className="p-2 rounded-lg hover:bg-base-800 text-base-300"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded-lg hover:bg-base-800 text-sm">
                Log in
              </Link>
              <Link to="/signup" className="px-3 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-sm font-medium">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
