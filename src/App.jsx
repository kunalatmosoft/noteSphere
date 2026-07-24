import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAnalytics } from './hooks/useAnalytics.js'
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
import Library from './pages/Library.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import PostDetailsPage from './pages/PostDetailsPage.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div> // Wait for auth check to finish
  if (!user) return <Navigate to="/login" replace />
  
  return children
}

export default function App() {
  useAnalytics()
  return (
    <div className="min-h-screen bg-base-950 text-base-100 font-sans">
      <Navbar />
      <Routes>
        {/* Existing Application Routes */}
        <Route path="/" element={<PublicFeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/library" element={<Library />} />
        <Route path="/post/:postId" element={<PostView />} />
        <Route path="/u/:username" element={<Profile />} />
        
        {/* Protected Dashboard */}
        <Route
          path="/notes/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* NEW: Reddit-like Application Routes       */}
        {/* ========================================= */}
        
        {/* Global Reddit Feed */}
        <Route path="/r" element={<CommunityPage />} />
        
        {/* Specific Community Feed */}
        <Route path="/r/:communityId" element={<CommunityPage />} />
        
        {/* Single Reddit Post View */}
        <Route path="/r/post/:postId" element={<PostDetailsPage />} />
        
      </Routes>
    </div>
  )
}