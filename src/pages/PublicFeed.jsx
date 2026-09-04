import React, { useEffect, useState, useRef } from 'react'
import { getFeed, getTrending, getAllTags } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Hash, 
  Users, 
  Sparkles, 
  Clock, 
  Flame,
  ChevronRight,
  UserPlus,
  Compass,
  ArrowUpRight,
  PenSquare
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { recommendUsers } from '../lib/social.js'

// Modern Shimmer Skeletons
const SkeletonPostCard = () => (
  <div className="bg-[#0d0f17]/60 border border-white/[0.06] rounded-2xl p-4 overflow-hidden animate-pulse flex flex-col justify-between h-[340px]">
    <div className="space-y-3">
      <div className="h-44 bg-white/[0.04] rounded-xl w-full" />
      <div className="h-4 bg-white/[0.06] rounded-md w-3/4" />
      <div className="h-3 bg-white/[0.03] rounded-md w-full" />
      <div className="h-3 bg-white/[0.03] rounded-md w-2/3" />
    </div>
    <div className="flex items-center gap-3 pt-3 border-t border-white/[0.04]">
      <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/[0.05] rounded w-1/3" />
        <div className="h-2 bg-white/[0.03] rounded w-1/4" />
      </div>
    </div>
  </div>
)

const SkeletonTrendingItem = () => (
  <div className="flex items-center gap-3 py-2 animate-pulse">
    <div className="w-5 h-4 bg-white/[0.04] rounded" />
    <div className="h-3.5 bg-white/[0.05] rounded-md flex-1" />
  </div>
)

const SkeletonTag = () => (
  <div className="h-7 bg-white/[0.04] rounded-lg w-20 animate-pulse border border-white/[0.02]" />
)

const SkeletonAuthor = () => (
  <div className="flex items-center gap-3 py-2 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-white/[0.05]" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3.5 bg-white/[0.06] rounded w-2/3" />
      <div className="h-2.5 bg-white/[0.03] rounded w-1/3" />
    </div>
  </div>
)

import SEO from '../components/SEO.jsx'

export default function PublicFeed() {
  const { profile } = useAuth()
  const [sort, setSort] = useState('recent')
  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [tags, setTags] = useState([])
  const [recUsers, setRecUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const [feed, trend, tagList] = await Promise.all([
        getFeed({ sort }), 
        getTrending(), 
        getAllTags()
      ])
      setPosts(feed)
      setTrending(trend)
      setTags(tagList)
      if (profile) setRecUsers(await recommendUsers(profile.uid, profile.following || []))
      setLoading(false)
      
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0
      }
    })()
  }, [sort, profile])

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <SEO 
        title="Explore Feed"
        description="Fresh insights, documentation, and ideas from the community on Notesphere."
        url="/"
      />
      {/* Subtle Ambient Background Lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
          
          {/* Main Feed Section */}
          <main className="min-w-0">
            {/* Header & Filter Controls */}
            <div className="relative mb-8 p-5 sm:p-6 rounded-2xl bg-[#0d0f17]/80 backdrop-blur-xl border border-white/[0.07] shadow-xl shadow-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
                    <Sparkles size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                      Explore Feed
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Fresh insights, documentation, and ideas from the community
                    </p>
                  </div>
                </div>
                
                {/* Segmented Filter Pills */}
                <div className="flex items-center p-1 bg-black/40 border border-white/[0.06] rounded-xl self-start sm:self-auto">
                  <button 
                    onClick={() => setSort('recent')} 
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      sort === 'recent' 
                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Clock size={13} strokeWidth={2.2} />
                    Latest
                  </button>
                  <button 
                    onClick={() => setSort('trending')} 
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      sort === 'trending' 
                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Flame size={13} strokeWidth={2.2} />
                    Trending
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
                {[...Array(6)].map((_, i) => (
                  <SkeletonPostCard key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="relative rounded-2xl bg-[#0d0f17]/40 border border-white/[0.06] p-12 text-center overflow-hidden">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Compass size={28} strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1">No publications yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                  Be the first one to share an insightful guide or article with the workspace.
                </p>
                <Link 
                  to="/new" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-95"
                >
                  <PenSquare size={14} strokeWidth={2.2} />
                  Write First Post
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Sticky Widget Column */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            
            {/* Trending Panel */}
            <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-white/[0.12] transition-colors">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <TrendingUp size={14} strokeWidth={2.5} />
                  </span>
                  Top Discussions
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>
              
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonTrendingItem key={i} />
                  ))}
                </div>
              ) : (
                <ol className="space-y-1">
                  {trending.slice(0, 5).map((p, i) => (
                    <li key={p.id}>
                      <Link 
                        to={`/post/${p.id}`} 
                        className="group flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span className={`text-xs font-mono font-bold w-4 text-center ${
                            i === 0 ? 'text-amber-400' :
                            i === 1 ? 'text-zinc-300' :
                            i === 2 ? 'text-amber-600' : 'text-zinc-600'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="text-xs font-medium text-zinc-300 group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {p.title}
                          </span>
                        </div>
                        <ArrowUpRight size={13} className="text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
              
              {trending.length > 5 && (
                <Link 
                  to="/trending" 
                  className="mt-3 pt-3 border-t border-white/[0.04] text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center justify-between font-semibold group"
                >
                  Explore ranking board
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Popular Tags */}
            <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-white/[0.12] transition-colors">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Hash size={14} strokeWidth={2.5} />
                  </span>
                  Explore Topics
                </h3>
              </div>
              
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonTag key={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 12).map(([tag, count]) => (
                    <Link 
                      key={tag} 
                      to={`/search?tag=${tag}`} 
                      className="group flex items-center gap-1.5 text-xs bg-black/40 hover:bg-indigo-500/10 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg border border-white/[0.06] hover:border-indigo-500/30 transition-all duration-150"
                    >
                      <span className="font-medium text-zinc-300 group-hover:text-indigo-300">#{tag}</span>
                      <span className="text-[10px] font-semibold text-zinc-500 group-hover:text-indigo-400/80 bg-white/[0.03] px-1.5 py-0.2 rounded">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              
              {tags.length > 12 && (
                <Link 
                  to="/search" 
                  className="mt-3 pt-3 border-t border-white/[0.04] text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center justify-between font-semibold group"
                >
                  All categories
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Recommended Creators */}
            {profile && (
              <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.05]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Users size={14} strokeWidth={2.5} />
                    </span>
                    Suggested Authors
                  </h3>
                </div>
                
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonAuthor key={i} />
                    ))}
                  </div>
                ) : recUsers.length > 0 ? (
                  <div className="space-y-2">
                    {recUsers.slice(0, 4).map((u) => (
                      <div 
                        key={u.uid} 
                        className="group flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-all"
                      >
                        <Link 
                          to={`/u/${u.username}`} 
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          {u.photoURL ? (
                            <img 
                              src={u.photoURL} 
                              alt={u.username} 
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                              {u.displayName?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors truncate">
                              {u.displayName || u.username}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                              {u.followers?.length || 0} followers
                            </p>
                          </div>
                        </Link>
                        
                        <button 
                          className="p-1.5 bg-white/[0.04] hover:bg-indigo-600 text-zinc-400 hover:text-white rounded-lg border border-white/[0.06] hover:border-indigo-500/30 transition-all active:scale-95 ml-2 shrink-0"
                          title="Follow creator"
                        >
                          <UserPlus size={13} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-2">
                    No new suggestions right now
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}