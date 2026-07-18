import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PublicFeed from './pages/PublicFeed.jsx'
import PostView from './pages/PostView.jsx'
import Profile from './pages/Profile.jsx'
import Search from './pages/Search.jsx'
import Trending from './pages/Trending.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-base-950 text-base-100 font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicFeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/post/:postId" element={<PostView />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route
          path="/notes/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
