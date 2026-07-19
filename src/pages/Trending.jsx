import React, { useEffect, useState } from 'react'
import { getTrending } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { Flame, TrendingUp, Sparkles } from 'lucide-react'

export default function Trending() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('week') // 'day', 'week', 'month'

  useEffect(() => {
    (async () => {
      setLoading(true)
      
      // Map timeframe to days for the backend call
      let days = 7
      if (timeframe === 'day') days = 1
      if (timeframe === 'month') days = 30
      
      // Fetch trending posts (days, limit)
      const data = await getTrending(days, 30)
      setPosts(data || [])
      setLoading(false)
    })()
  }, [timeframe])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      
      {/* Modern Hero Section */}
      <div className="relative flex flex-col items-center justify-center py-12 mb-10 bg-base-900 rounded-3xl border border-base-800 overflow-hidden shadow-2xl">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-orange-500/20 shadow-inner">
            <Flame size={32} className="text-orange-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-base-100 via-base-100 to-base-400">
            Trending Now
          </h1>
          <p className="text-base-400 max-w-lg px-4 text-sm md:text-base">
            Discover the most popular, engaging, and widely discussed posts across the community right now.
          </p>
        </div>
      </div>

      {/* Timeframe Filter Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-base-900 p-1.5 rounded-2xl border border-base-800 shadow-sm">
          <button
            onClick={() => setTimeframe('day')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              timeframe === 'day' 
                ? 'bg-base-800 text-base-100 shadow-md border border-base-700/50' 
                : 'text-base-400 hover:text-base-200 hover:bg-base-800/50'
            }`}
          >
            <Sparkles size={16} className={timeframe === 'day' ? 'text-yellow-400' : ''} /> Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              timeframe === 'week' 
                ? 'bg-base-800 text-base-100 shadow-md border border-base-700/50' 
                : 'text-base-400 hover:text-base-200 hover:bg-base-800/50'
            }`}
          >
            <TrendingUp size={16} className={timeframe === 'week' ? 'text-orange-500' : ''} /> This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              timeframe === 'month' 
                ? 'bg-base-800 text-base-100 shadow-md border border-base-700/50' 
                : 'text-base-400 hover:text-base-200 hover:bg-base-800/50'
            }`}
          >
            <Flame size={16} className={timeframe === 'month' ? 'text-red-500' : ''} /> This Month
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        // Modern Skeleton Loaders
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col bg-base-900 border border-base-800 rounded-2xl h-80 p-5 animate-pulse">
              <div className="w-full h-32 bg-base-800 rounded-xl mb-4"></div>
              <div className="h-6 bg-base-800 rounded-md w-3/4 mb-3"></div>
              <div className="h-4 bg-base-800 rounded-md w-1/2 mb-6"></div>
              <div className="mt-auto flex justify-between items-center">
                <div className="w-8 h-8 rounded-full bg-base-800"></div>
                <div className="w-16 h-4 bg-base-800 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        // Empty State
        <div className="text-center py-20 bg-base-900/50 rounded-3xl border border-base-800 border-dashed">
          <Flame size={48} className="mx-auto text-base-700 mb-4" />
          <h3 className="text-xl font-bold text-base-200 mb-2">No trending posts yet</h3>
          <p className="text-base-400">Check back later to see what's heating up this {timeframe}.</p>
        </div>
      ) : (
        // Trending Posts Grid with Ranking Badges
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
          {posts.map((p, index) => (
            <div key={p.id} className="relative group">
              {/* Leaderboard Ranking Badge */}
              <div 
                className={`absolute -top-3 -left-3 z-10 w-9 h-9 flex items-center justify-center font-bold text-sm rounded-full shadow-lg border-2 ${
                  index === 0 ? 'bg-yellow-500 text-yellow-950 border-yellow-300 shadow-yellow-500/30' :
                  index === 1 ? 'bg-slate-300 text-slate-800 border-slate-100 shadow-slate-400/30' :
                  index === 2 ? 'bg-amber-700 text-amber-100 border-amber-600 shadow-amber-900/30' :
                  'bg-base-800 text-base-200 border-base-600 shadow-black/40'
                }`}
              >
                #{index + 1}
              </div>
              
              <div className="h-full transition-transform duration-300 ease-in-out group-hover:-translate-y-1">
                <PostCard post={p} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}