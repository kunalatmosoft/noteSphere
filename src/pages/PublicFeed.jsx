import React, { useEffect, useState, useRef, useMemo } from 'react'
import { getFeed, getTrending, getAllTags } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Hash,
  Users,
  Clock,
  Flame,
  ChevronRight,
  UserPlus,
  ArrowUpRight,
  PenSquare,
  Orbit,
  Telescope,
  Radio,
  Stars,
  Globe2,
  Search,
  Sparkles,
  Satellite,
  Compass,
  Check,
  Zap,
  Activity,
  Layers
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { recommendUsers } from '../lib/social.js'
import SEO from '../components/SEO.jsx'

// Dynamic titles that cycle on every page refresh / mount
const COSMIC_HEADLINES = [
  {
    prefix: 'Chart knowledge across',
    accent: 'the cosmos.',
    desc: 'Explore distributed systems, AI architectures, and field dispatches broadcasted from thinkers across the digital constellation.',
    tag: 'DEEP SPACE TERMINAL // SEC-09'
  },
  {
    prefix: 'Broadcast transmissions beyond',
    accent: 'the event horizon.',
    desc: 'Unearth technical blueprints, engineering notes, and algorithmic breakthroughs synchronized from remote cosmic nodes.',
    tag: 'QUANTUM RELAY ACTIVE // FREQ-42'
  },
  {
    prefix: 'Navigate the constellations of',
    accent: 'human intelligence.',
    desc: 'Peer into peer-to-peer networks, zero-knowledge proofs, and frontier thoughts archived in a decentralized space.',
    tag: 'ORBITAL OBSERVATORY // NODE-01'
  },
  {
    prefix: 'Synthesize signals from',
    accent: 'infinite galaxies.',
    desc: 'A planetary repository of ideas, research notes, and creative logs shared by stellar developers and researchers.',
    tag: 'STELLAR BEACON // SYNCHRONIZED'
  }
]

// Canvas starfield with animated particles & ambient nebula flares
const GalaxyBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const starCount = 75
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const isDark = document.documentElement.classList.contains('dark')

      stars.forEach((star) => {
        star.x += star.dx
        star.y += star.dy

        if (star.x < 0) star.x = width
        if (star.x > width) star.x = 0
        if (star.y < 0) star.y = height
        if (star.y > height) star.y = 0

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(199, 210, 254, ${star.alpha})`
          : `rgba(79, 70, 229, ${star.alpha * 0.4})`
        ctx.shadowBlur = star.size * 3.5
        ctx.shadowColor = isDark ? '#a5b4fc' : '#6366f1'
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

      {/* Atmospheric Nebula Blooms */}
      <div
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-cyan-500/15 via-indigo-600/20 to-fuchsia-600/20 dark:from-cyan-400/20 dark:via-indigo-600/30 dark:to-fuchsia-600/25 rounded-full blur-[140px] animate-pulse"
        style={{ animationDuration: '10s' }}
      />
      <div className="absolute top-[40%] -left-48 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute top-[65%] -right-48 w-[450px] h-[450px] bg-fuchsia-500/10 dark:bg-purple-600/20 rounded-full blur-[120px]" />

      {/* Futuristic Spatial Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)]" />
    </div>
  )
}

// Shimmer Skeleton Loaders
const SkeletonPostCard = () => (
  <div className="relative rounded-3xl bg-white/40 dark:bg-[#070b19]/60 backdrop-blur-xl border border-zinc-200/80 dark:border-indigo-500/15 p-5 overflow-hidden animate-pulse flex flex-col justify-between h-[390px] shadow-sm">
    <div className="space-y-4">
      <div className="h-48 bg-zinc-200/80 dark:bg-white/[0.04] rounded-2xl w-full" />
      <div className="h-4 bg-zinc-200/90 dark:bg-white/[0.06] rounded-md w-3/4" />
      <div className="h-3 bg-zinc-200/60 dark:bg-white/[0.03] rounded-md w-full" />
      <div className="h-3 bg-zinc-200/60 dark:bg-white/[0.03] rounded-md w-4/5" />
    </div>
    <div className="flex items-center gap-3 pt-4 border-t border-zinc-200/70 dark:border-white/[0.05]">
      <div className="w-9 h-9 rounded-full bg-zinc-200/80 dark:bg-white/[0.05]" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-zinc-200/80 dark:bg-white/[0.05] rounded w-1/3" />
        <div className="h-2.5 bg-zinc-200/50 dark:bg-white/[0.03] rounded w-1/4" />
      </div>
    </div>
  </div>
)

const SkeletonTrendingItem = () => (
  <div className="flex items-center gap-3 py-2.5 animate-pulse">
    <div className="w-5 h-4 bg-zinc-200 dark:bg-white/[0.05] rounded" />
    <div className="h-3.5 bg-zinc-200 dark:bg-white/[0.06] rounded-md flex-1" />
  </div>
)

const SkeletonTag = () => (
  <div className="h-8 bg-zinc-200/70 dark:bg-white/[0.04] rounded-xl w-24 animate-pulse border border-zinc-300/40 dark:border-white/[0.04]" />
)

const SkeletonAuthor = () => (
  <div className="flex items-center gap-3 py-2 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-white/[0.05]" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3.5 bg-zinc-200 dark:bg-white/[0.06] rounded w-2/3" />
      <div className="h-2.5 bg-zinc-200/60 dark:bg-white/[0.03] rounded w-1/3" />
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
  const [selectedTag, setSelectedTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [followedMap, setFollowedMap] = useState({})

  // Pick a fresh headline on every component mount / browser refresh
  const headline = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * COSMIC_HEADLINES.length)
    return COSMIC_HEADLINES[randomIndex]
  }, [])

  const scrollContainerRef = useRef(null)

  useEffect(() => {
    ;(async () => {
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

  // Filter posts based on in-memory search and tag filter
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchTag = selectedTag ? p.tags?.includes(selectedTag) : true
      const matchSearch = searchQuery.trim()
        ? p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      return matchTag && matchSearch
    })
  }, [posts, selectedTag, searchQuery])

  const toggleFollow = (uid) => {
    setFollowedMap((prev) => ({ ...prev, [uid]: !prev[uid] }))
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa] dark:bg-[#030612] text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-sans selection:bg-indigo-500/30 selection:text-indigo-400">
      <SEO
        title="Cosmic Explorer Feed"
        description="Fresh insights, quantum ideas, and interstellar dispatches from thinkers across Notesphere."
        url="/"
      />

      {/* Dynamic Starfield Canvas Background */}
      <GalaxyBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">

        {/* ============================================================== */}
        {/* ULTRA-MODERN STYLISH HERO SECTION (Changes on Refresh)         */}
        {/* ============================================================== */}
        <section className="relative mb-10 rounded-[2.5rem] p-6 sm:p-12 lg:p-14 overflow-hidden border border-zinc-200/90 dark:border-indigo-500/25 bg-white/75 dark:bg-[#070b19]/65 backdrop-blur-3xl shadow-2xl shadow-indigo-500/5 dark:shadow-[0_0_80px_rgba(79,70,229,0.15)] transition-all">
          
          {/* Orbital Mechanical Rings */}
          <div className="pointer-events-none absolute -right-24 -top-24 w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full border border-indigo-500/20 dark:border-indigo-400/20 animate-[spin_180s_linear_infinite]" />
          <div className="pointer-events-none absolute -right-44 -top-44 w-[540px] h-[540px] sm:w-[680px] sm:h-[680px] rounded-full border border-dashed border-purple-500/20 dark:border-purple-400/25 animate-[spin_240s_linear_infinite_reverse]" />
          
          {/* Pulsing Quantum Coordinate Dot */}
          <div className="pointer-events-none absolute right-24 sm:right-40 top-16 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)] animate-ping" />
          <div className="pointer-events-none absolute right-24 sm:right-40 top-16 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />

          <div className="relative z-10 max-w-4xl">
            {/* Telemetry Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-200/90 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono tracking-wider mb-6 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="font-semibold text-[11px] uppercase tracking-wider">{headline.tag}</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <Activity size={12} className="animate-pulse text-indigo-500" />
                RELAY ACTIVE
              </span>
            </div>

            {/* Impressive Typography Title (Serif Display + Gradient Sans-Serif) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.08] text-zinc-900 dark:text-zinc-50 drop-shadow-sm">
              {headline.prefix}{' '}
              <span className="block sm:inline font-sans font-black italic tracking-normal bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
                {headline.accent}
              </span>
            </h1>

            {/* Description Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl font-sans font-normal leading-relaxed">
              {headline.desc}
            </p>

            {/* Interactive Hero Controls & Live Orbital Indicators */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
              <Link
                to="/notes"
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-sans font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <PenSquare size={16} />
                <span>Transmit New Article</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center gap-6 sm:gap-8 border-t sm:border-t-0 sm:border-l border-zinc-200/90 dark:border-white/10 pt-4 sm:pt-0 sm:pl-7 text-xs text-zinc-500 dark:text-zinc-400">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono tracking-tight">
                    <Stars size={18} className="text-amber-400" />
                    <span>{posts.length > 0 ? `${posts.length}` : '—'}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Transmissions</span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono tracking-tight">
                    <Globe2 size={18} className="text-cyan-500 dark:text-cyan-400" />
                    <span>{tags.length > 0 ? tags.length : '—'}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Sectors</span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono tracking-tight">
                    <Zap size={18} className="text-emerald-500 dark:text-emerald-400" />
                    <span>{trending.length > 0 ? `${trending.length}` : '—'}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">High Grav</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* RESPONSIVE FILTER CONTROLS & SEARCH BAR                        */}
        {/* ============================================================== */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#070b19]/60 backdrop-blur-xl border border-zinc-200/80 dark:border-indigo-500/10 shadow-sm">
            
            {/* Rapid In-Memory Post Search */}
            <div className="relative flex-1 max-w-lg">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Scan transmissions by keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 text-xs sm:text-sm rounded-xl bg-zinc-100/80 dark:bg-[#030612]/70 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 uppercase font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Segments */}
            <div className="flex items-center gap-1 self-start sm:self-auto p-1 bg-zinc-100/90 dark:bg-[#030612]/80 border border-zinc-200 dark:border-white/[0.08] rounded-xl w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setSort('recent')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  sort === 'recent'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Clock size={13} strokeWidth={2.2} />
                Latest Epoch
              </button>
              <button
                onClick={() => setSort('trending')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  sort === 'trending'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Flame size={13} strokeWidth={2.2} />
                High Orbit
              </button>
            </div>
          </div>

          {/* Category Chips Bar */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm'
                    : 'bg-white/60 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.06] hover:border-indigo-500/40'
                }`}
              >
                All Sectors
              </button>
              {tags.slice(0, 12).map(([tag]) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm'
                      : 'bg-white/60 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.06] hover:border-indigo-500/40'
                  }`}
                >
                  <span>#{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* POSTS GRID & SIDEBAR SECTION                                   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* Posts Feed Column */}
          <main className="min-w-0">
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
                {[...Array(6)].map((_, i) => (
                  <SkeletonPostCard key={i} />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="relative rounded-3xl bg-white/40 dark:bg-[#070b19]/40 border border-dashed border-zinc-300 dark:border-indigo-500/20 p-12 text-center overflow-hidden">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                  <Telescope size={30} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  Sector Uncharted
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
                  {selectedTag || searchQuery
                    ? 'No transmissions align with your active filters. Broaden your coordinates.'
                    : 'No transmissions detected in this orbit yet. Transmit the maiden entry.'}
                </p>
                {selectedTag || searchQuery ? (
                  <button
                    onClick={() => {
                      setSelectedTag(null)
                      setSearchQuery('')
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  >
                    Reset Active Filters
                  </button>
                ) : (
                  <Link
                    to="/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    <PenSquare size={14} strokeWidth={2.2} />
                    Broadcast Dispatch
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-8">
                {filteredPosts.map((p) => (
                  <div
                    key={p.id}
                    className="group relative transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="absolute -inset-0.5 rounded-[1.7rem] bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-indigo-500/30 group-hover:via-purple-500/30 group-hover:to-cyan-500/30 transition-all duration-500 blur-sm pointer-events-none" />
                    <PostCard post={p} />
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar: Stellar Radar & Voyagers */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">

            {/* Trending Section */}
            <div className="rounded-3xl bg-white/70 dark:bg-[#070b19]/60 backdrop-blur-xl border border-zinc-200/80 dark:border-indigo-500/10 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-indigo-500/20 transition-all">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/60 dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                    <TrendingUp size={13} strokeWidth={2.5} />
                  </span>
                  High Gravity Feeds
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Wave
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
                        className="group flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span
                            className={`text-xs font-mono font-bold w-4 text-center ${
                              i === 0
                                ? 'text-amber-500 dark:text-amber-400'
                                : i === 1
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : i === 2
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            0{i + 1}
                          </span>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {p.title}
                          </span>
                        </div>
                        <ArrowUpRight
                          size={13}
                          className="text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}

              {trending.length > 5 && (
                <Link
                  to="/trending"
                  className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-white/[0.04] text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-between font-semibold group"
                >
                  <span>Radar charts & telemetry</span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Popular Sectors / Tags */}
            <div className="rounded-3xl bg-white/70 dark:bg-[#070b19]/60 backdrop-blur-xl border border-zinc-200/80 dark:border-indigo-500/10 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-indigo-500/20 transition-all">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/60 dark:border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Hash size={13} strokeWidth={2.5} />
                  </span>
                  Exploration Clusters
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
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`group flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 ${
                        selectedTag === tag
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                          : 'bg-zinc-100/80 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 border-zinc-200/70 dark:border-white/[0.06] hover:border-indigo-500/40 hover:bg-indigo-500/10'
                      }`}
                    >
                      <span>#{tag}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                          selectedTag === tag
                            ? 'bg-white/20 border-white/20 text-white'
                            : 'bg-white dark:bg-black/40 border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Voyagers */}
            {profile && (
              <div className="rounded-3xl bg-white/70 dark:bg-[#070b19]/60 backdrop-blur-xl border border-zinc-200/80 dark:border-indigo-500/10 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-indigo-500/20 transition-all">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200/60 dark:border-white/[0.05]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      <Users size={13} strokeWidth={2.5} />
                    </span>
                    Neighboring Voyagers
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
                    {recUsers.slice(0, 4).map((u) => {
                      const isFollowing = !!followedMap[u.uid]
                      return (
                        <div
                          key={u.uid}
                          className="group flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all"
                        >
                          <Link
                            to={`/u/${u.username}`}
                            className="flex items-center gap-3 min-w-0 flex-1"
                          >
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.username}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/60 transition-all"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                {u.displayName?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                                {u.displayName || u.username}
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 truncate">
                                {(u.followers?.length || 0) + (isFollowing ? 1 : 0)} crew members
                              </p>
                            </div>
                          </Link>

                          <button
                            onClick={() => toggleFollow(u.uid)}
                            className={`p-1.5 rounded-lg border transition-all active:scale-95 ml-2 shrink-0 ${
                              isFollowing
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-zinc-100 dark:bg-white/[0.05] hover:bg-indigo-600 text-zinc-600 dark:text-zinc-400 hover:text-white border-zinc-200 dark:border-white/[0.06] hover:border-indigo-500/30'
                            }`}
                            title={isFollowing ? 'Tracking voyager' : 'Follow voyager'}
                          >
                            {isFollowing ? <Check size={13} strokeWidth={2.5} /> : <UserPlus size={13} strokeWidth={2} />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center py-2">
                    No active voyagers in range
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