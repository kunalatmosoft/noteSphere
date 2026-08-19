import React, { useEffect, useState, useMemo } from 'react'
import { getTrending } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Crown, 
  Award, 
  Medal, 
  Search, 
  X, 
  Activity,
  Calendar,
  Hash
} from 'lucide-react'

// Modern Shimmer Skeleton
const SkeletonTrendingCard = () => (
  <div className="bg-[#0d0f17]/70 border border-white/[0.06] rounded-2xl p-5 h-84 animate-pulse flex flex-col justify-between overflow-hidden relative">
    <div className="space-y-3.5">
      <div className="h-44 bg-white/[0.04] rounded-xl w-full" />
      <div className="h-4.5 bg-white/[0.06] rounded-md w-4/5" />
      <div className="h-3 bg-white/[0.03] rounded-md w-full" />
      <div className="h-3 bg-white/[0.03] rounded-md w-2/3" />
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
      <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
      <div className="w-16 h-3 bg-white/[0.04] rounded-md" />
    </div>
  </div>
)

export default function Trending() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('week') // 'day', 'week', 'month'
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      
      let days = 7
      if (timeframe === 'day') days = 1
      if (timeframe === 'month') days = 30
      
      const data = await getTrending(days, 30)
      setPosts(data || [])
      setLoading(false)
    })()
  }, [timeframe])

  // Extract popular tags from current trending posts
  const availableTags = useMemo(() => {
    const counts = {}
    posts.forEach(p => {
      p.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [posts])

  // Filter posts based on search input and active tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTag = !activeTag || post.tags?.includes(activeTag)

      return matchesSearch && matchesTag
    })
  }, [posts, searchQuery, activeTag])

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Radiant Background Accents */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        
        {/* Futuristic Hero Section */}
        <div className="relative mb-10 rounded-3xl bg-[#0d0f17]/80 backdrop-blur-2xl border border-white/[0.08] p-8 sm:p-12 overflow-hidden shadow-2xl shadow-black/60 text-center flex flex-col items-center">
          {/* Subtle Grid Lines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Live Algorithmic Momentum
          </div>

          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-30 animate-pulse" />
            <div className="relative p-3.5 rounded-2xl bg-[#131622] border border-white/[0.1] text-orange-400 shadow-xl">
              <Flame size={32} strokeWidth={2.2} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 mb-3">
            Trending Leaderboard
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-8 leading-relaxed">
            The most engaging discussions, groundbreaking technical notes, and viral insights across the network.
          </p>

          {/* Futuristic Timeframe Switcher */}
          <div className="flex items-center p-1.5 bg-black/50 border border-white/[0.08] rounded-2xl shadow-inner backdrop-blur-md">
            {[
              { id: 'day', label: '24 Hours', icon: Sparkles, color: 'text-amber-400' },
              { id: 'week', label: 'This Week', icon: TrendingUp, color: 'text-orange-400' },
              { id: 'month', label: 'All Month', icon: Flame, color: 'text-rose-400' }
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => {
                  setTimeframe(id)
                  setActiveTag(null)
                }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  timeframe === id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={15} className={timeframe === id ? 'text-white' : color} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Discovery & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search trending titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f17]/70 border border-white/[0.08] focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Tag Pills */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
                <Hash size={12} /> Topics:
              </span>
              {availableTags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                    activeTag === tag
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      : 'bg-[#0d0f17]/60 text-zinc-400 border-white/[0.06] hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  #{tag} <span className="text-[10px] opacity-60 ml-0.5">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonTrendingCard key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-[#0d0f17]/40 border border-white/[0.06] border-dashed">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Zap size={26} strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-zinc-200 mb-1">No trending posts found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery || activeTag 
                ? 'Try clearing your search query or topic filter to view all results.' 
                : `No activity recorded for this ${timeframe}. Check back soon.`}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((p, index) => {
              // Podium Styling Hierarchy for Top 3
              const isTop1 = index === 0 && !searchQuery && !activeTag
              const isTop2 = index === 1 && !searchQuery && !activeTag
              const isTop3 = index === 2 && !searchQuery && !activeTag

              return (
                <div key={p.id} className="relative group flex flex-col">
                  {/* Futuristic Floating Crown & Rank Badges */}
                  <div 
                    className={`absolute -top-3.5 -left-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-xs shadow-xl border backdrop-blur-md transition-transform group-hover:scale-105 ${
                      isTop1 
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-yellow-200/80 shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
                      isTop2 
                        ? 'bg-gradient-to-r from-slate-200 to-zinc-300 text-zinc-900 border-white shadow-[0_0_15px_rgba(226,232,240,0.3)]' :
                      isTop3 
                        ? 'bg-gradient-to-r from-amber-700 to-orange-800 text-amber-100 border-amber-500/60 shadow-[0_0_15px_rgba(180,83,9,0.3)]' :
                        'bg-[#131622]/90 text-zinc-400 border-white/[0.08]'
                    }`}
                  >
                    {isTop1 && <Crown size={13} strokeWidth={2.5} className="text-black" />}
                    {isTop2 && <Award size={13} strokeWidth={2.5} className="text-zinc-900" />}
                    {isTop3 && <Medal size={13} strokeWidth={2.5} className="text-amber-200" />}
                    <span>#{index + 1}</span>
                  </div>

                  {/* Card Container with Hover Accent */}
                  <div className={`h-full rounded-2xl transition-all duration-300 group-hover:-translate-y-1.5 ${
                    isTop1 ? 'p-[1px] bg-gradient-to-b from-amber-500/40 via-transparent to-transparent rounded-2xl' : ''
                  }`}>
                    <PostCard post={p} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}