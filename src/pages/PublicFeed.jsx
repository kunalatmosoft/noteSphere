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
  Activity,
  Zap
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { recommendUsers } from '../lib/social.js'

// Skeleton Components
const SkeletonPostCard = () => (
  <div className="bg-base-900 border border-base-800 rounded-xl overflow-hidden animate-pulse">
    <div className="h-48 bg-base-800" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-base-800 rounded w-3/4" />
      <div className="h-4 bg-base-800 rounded w-full" />
      <div className="h-4 bg-base-800 rounded w-2/3" />
      <div className="flex items-center gap-3 pt-2">
        <div className="w-8 h-8 rounded-full bg-base-800" />
        <div className="flex-1">
          <div className="h-3 bg-base-800 rounded w-1/2" />
          <div className="h-2 bg-base-800 rounded w-1/3 mt-1" />
        </div>
      </div>
    </div>
  </div>
)

const SkeletonTrendingItem = () => (
  <div className="flex gap-2 items-center animate-pulse">
    <div className="w-4 h-4 bg-base-800 rounded" />
    <div className="h-4 bg-base-800 rounded flex-1" />
  </div>
)

const SkeletonTag = () => (
  <div className="h-6 bg-base-800 rounded-full w-16 animate-pulse" />
)

const SkeletonAuthor = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-base-800" />
    <div className="flex-1">
      <div className="h-3 bg-base-800 rounded w-3/4" />
      <div className="h-2 bg-base-800 rounded w-1/2 mt-1" />
    </div>
  </div>
)

export default function PublicFeed() {
  const { profile } = useAuth()
  const [sort, setSort] = useState('recent')
  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [tags, setTags] = useState([])
  const [recUsers, setRecUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Refs for scroll management
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const [feed, trend, tagList] = await Promise.all([getFeed({ sort }), getTrending(), getAllTags()])
      setPosts(feed); setTrending(trend); setTags(tagList)
      if (profile) setRecUsers(await recommendUsers(profile.uid, profile.following || []))
      setLoading(false)
      
      // Scroll to top when sort changes
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0
      }
    })()
  }, [sort])

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-950 via-base-900 to-base-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          
          {/* Main Feed Section - Scrollable */}
          <div className="min-h-[calc(100vh-3rem)]">
            <div 
              ref={scrollContainerRef}
              className="lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-base-700 scrollbar-track-transparent hover:scrollbar-thumb-base-600"
            >
              {/* Header with animated gradient border */}
              <div className="relative mb-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-accent-500/20 rounded-xl blur" />
                <div className="relative bg-base-900/80 backdrop-blur-sm border border-base-800 rounded-xl p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent-500/10 rounded-lg border border-accent-500/20">
                        <Sparkles size={20} className="text-accent-400" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-base-50">Public Blogs</h1>
                        <p className="text-xs text-base-400">Discover amazing content from the community</p>
                      </div>
                    </div>
                    
                    <div className="flex bg-base-800/50 rounded-lg p-0.5 border border-base-700/50">
                      <button 
                        onClick={() => setSort('recent')} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          sort === 'recent' 
                            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' 
                            : 'text-base-400 hover:text-base-200 hover:bg-base-700/50'
                        }`}
                      >
                        <Clock size={14} />
                        Recent
                      </button>
                      <button 
                        onClick={() => setSort('trending')} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          sort === 'trending' 
                            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' 
                            : 'text-base-400 hover:text-base-200 hover:bg-base-700/50'
                        }`}
                      >
                        <Flame size={14} />
                        Top
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Grid with Skeleton Loading */}
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonPostCard key={i} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-base-900/50 backdrop-blur-sm border border-base-800 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-base-800 rounded-full flex items-center justify-center">
                    <Zap size={24} className="text-base-400" />
                  </div>
                  <h3 className="text-base-50 font-semibold mb-2">No posts yet</h3>
                  <p className="text-base-400 text-sm">Be the first to publish a note and share your ideas!</p>
                  <Link 
                    to="/new" 
                    className="inline-block mt-4 px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40"
                  >
                    Create Post
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                  {posts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="space-y-4 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin scrollbar-thumb-base-700 scrollbar-track-transparent hover:scrollbar-thumb-base-600">
              
              {/* Trending Section */}
              <div className="bg-base-900/80 backdrop-blur-sm border border-base-800 rounded-xl p-4 hover:border-base-700 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base-50 flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <TrendingUp size={16} className="text-orange-400" />
                    </div>
                    Trending Now
                  </h3>
                  <span className="text-[10px] font-medium text-base-400 bg-base-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Activity size={10} />
                    Live
                  </span>
                </div>
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <SkeletonTrendingItem key={i} />
                    ))}
                  </div>
                ) : (
                  <ol className="space-y-2">
                    {trending.slice(0, 6).map((p, i) => (
                      <li key={p.id} className="group">
                        <Link 
                          to={`/post/${p.id}`} 
                          className="flex items-center gap-2 text-sm hover:text-accent-400 transition-colors duration-200"
                        >
                          <span className={`text-xs font-mono w-5 ${
                            i === 0 ? 'text-yellow-400' : 
                            i === 1 ? 'text-gray-400' : 
                            i === 2 ? 'text-amber-600' : 'text-base-500'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="flex-1 line-clamp-1 text-base-300 group-hover:text-base-50 transition-colors">
                            {p.title}
                          </span>
                          <ChevronRight size={14} className="text-base-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
                
                {trending.length > 6 && (
                  <Link 
                    to="/trending" 
                    className="mt-3 text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 font-medium"
                  >
                    View all trends
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>

              {/* Tags Section */}
              <div className="bg-base-900/80 backdrop-blur-sm border border-base-800 rounded-xl p-4 hover:border-base-700 transition-colors duration-200">
                <h3 className="font-semibold text-base-50 flex items-center gap-2 mb-4 text-sm">
                  <div className="p-1.5 bg-primary-500/10 rounded-lg border border-primary-500/20">
                    <Hash size={16} className="text-primary-400" />
                  </div>
                  Popular Tags
                </h3>
                
                {loading ? (
                  <div className="flex flex-wrap gap-2">
                    {[...Array(12)].map((_, i) => (
                      <SkeletonTag key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 15).map(([tag, count]) => (
                      <Link 
                        key={tag} 
                        to={`/search?tag=${tag}`} 
                        className="group text-xs bg-base-800/50 hover:bg-accent-500/10 hover:text-accent-400 px-3 py-1.5 rounded-full border border-base-700/50 hover:border-accent-500/30 transition-all duration-200"
                      >
                        <span className="font-medium">#{tag}</span>
                        <span className="text-base-500 group-hover:text-accent-500/60 ml-1 text-[10px]">
                          {count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                
                {tags.length > 15 && (
                  <Link 
                    to="/search" 
                    className="mt-3 text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 font-medium"
                  >
                    See all tags
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>

              {/* Suggested Authors Section */}
              {profile && (
                <div className="bg-base-900/80 backdrop-blur-sm border border-base-800 rounded-xl p-4 hover:border-base-700 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base-50 flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Users size={16} className="text-emerald-400" />
                      </div>
                      Suggested Authors
                    </h3>
                    <span className="text-[10px] font-medium text-base-400 bg-base-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Activity size={10} />
                      Active
                    </span>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <SkeletonAuthor key={i} />
                      ))}
                    </div>
                  ) : recUsers.length > 0 ? (
                    <div className="space-y-3">
                      {recUsers.slice(0, 4).map((u) => (
                        <Link 
                          key={u.uid} 
                          to={`/u/${u.username}`} 
                          className="group flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-base-800/50 transition-all duration-200"
                        >
                          {u.photoURL ? (
                            <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover ring-2 ring-base-700 group-hover:ring-accent-500/50 transition-all" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500/20 to-primary-500/20 flex items-center justify-center border border-base-700">
                              <span className="text-xs text-base-400 font-medium">
                                {u.displayName?.[0] || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base-200 group-hover:text-accent-400 transition-colors truncate">
                              {u.displayName || u.username}
                            </p>
                            <p className="text-xs text-base-400 flex items-center gap-1">
                              <Users size={10} />
                              {u.followers?.length || 0} followers
                            </p>
                          </div>
                          <button className="text-xs bg-accent-500/10 hover:bg-accent-500 text-accent-400 hover:text-white px-2.5 py-1 rounded-full border border-accent-500/20 hover:border-accent-500 transition-all duration-200 font-medium opacity-0 group-hover:opacity-100">
                            <UserPlus size={12} />
                          </button>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-base-400 text-center py-2">
                      No suggestions yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}