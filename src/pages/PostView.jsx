import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, incrementView, toggleLike } from '../lib/posts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useReaderStore } from '../store/useReaderStore.js'
import { 
  Heart, Download, FileDown, ArrowUp, ArrowDown, 
  Settings, Sun, Moon, Coffee, Sparkles, Maximize, Minimize,
  Share2, Check, BookOpen, List, X, ChevronRight, ChevronDown, 
  Type, ZoomIn, ZoomOut, MoveHorizontal, AlertCircle, RefreshCw,
  Keyboard, Copy
} from 'lucide-react'
import { format } from 'date-fns'

// High-speed In-Memory Cache (Zero-latency instant navigation)
const postMemoryCache = new Map()

// Synthesized Micro-Haptic Audio Engine (0 external assets required)
const playFeedback = (type = 'click') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } else if (type === 'toggle') {
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    }
  } catch {
    // AudioContext blocked or unsupported
  }
}

export default function PostView() {
  const { postId } = useParams()
  const { user } = useAuth()
  
  // Local UI & Telemetry State
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeHeading, setActiveHeading] = useState('')
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false)
  const [fontSizeOffset, setFontSizeOffset] = useState(0) // -2 to +4 scale
  const [contentWidth, setContentWidth] = useState('standard') // 'compact' | 'standard' | 'expanded'
  const [fetchError, setFetchError] = useState(null)
  const [isLoading, setIsLoading] = useState(!postMemoryCache.has(postId))
  const [toastMessage, setToastMessage] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showKeymap, setShowKeymap] = useState(false)

  const settingsPanelRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  // Zustand Store
  const {
    post, setPost,
    liked, setLiked,
    tableOfContents, setTableOfContents,
    isSidebarOpen, setSidebarOpen, toggleSidebar,
    isSettingsOpen, setSettingsOpen, toggleSettings,
    readMode, setReadMode,
    fontFamily, setFontFamily,
    isFocusMode, setFocusMode
  } = useReaderStore()

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 2400)
  }, [])

  const triggerSound = useCallback((type) => {
    if (soundEnabled) playFeedback(type)
  }, [soundEnabled])

  // Optimized Instant-Hydration Data Fetching with SWR Architecture
  const loadPostData = useCallback(async (isBackgroundRevalidate = false) => {
    try {
      if (!isBackgroundRevalidate && !postMemoryCache.has(postId)) {
        setIsLoading(true)
      }
      setFetchError(null)

      const p = await getPost(postId)
      if (!p) throw new Error('Document not found or access restricted.')

      // Sync Cache & State
      postMemoryCache.set(postId, p)
      setPost(p)
      incrementView(postId)
      setLiked(user ? (p.likes || []).includes(user.uid) : false)

      // Fast Table of Contents parser
      if (p.content) {
        const headings = []
        const lines = p.content.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(/^(#{1,4})\s+(.+)$/)
          if (match) {
            headings.push({
              level: match[1].length,
              text: match[2].trim(),
              slug: match[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            })
          }
        }
        setTableOfContents(headings)
      }
    } catch (err) {
      console.error(err)
      setFetchError(err.message || 'Unable to load post.')
    } finally {
      setIsLoading(false)
    }
  }, [postId, user, setPost, setLiked, setTableOfContents])

  useEffect(() => {
    // Check in-memory cache for immediate paint
    if (postMemoryCache.has(postId)) {
      const cached = postMemoryCache.get(postId)
      setPost(cached)
      setIsLoading(false)
      loadPostData(true) // Silent background revalidation
    } else {
      loadPostData(false)
    }
  }, [postId, loadPostData, setPost])

  // Click-outside listener for popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(e.target)) {
        setSettingsOpen(false)
        setIsFontDropdownOpen(false)
      }
    }
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isSettingsOpen, setSettingsOpen])

  // High-performance IntersectionObserver Scrollspy
  useEffect(() => {
    if (!post || tableOfContents.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) {
          setActiveHeading(visible.target.textContent.trim())
        }
      },
      { rootMargin: '-80px 0px -75% 0px', threshold: 0.1 }
    )

    const headingEls = document.querySelectorAll('h1, h2, h3, h4')
    headingEls.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [post, tableOfContents])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setFocusMode(false)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [setFocusMode])

  // Fullscreen & Focus Mode Toggle
  const toggleFocusMode = useCallback(async () => {
    triggerSound('toggle')
    try {
      if (!isFocusMode) {
        setFocusMode(true)
        setSettingsOpen(false)
        setSidebarOpen(false)
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } else {
        setFocusMode(false)
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen()
        }
      }
    } catch {
      setFocusMode(!isFocusMode)
    }
  }, [isFocusMode, setFocusMode, setSettingsOpen, setSidebarOpen, triggerSound])

  // Futuristic Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is inside an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return

      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault()
        toggleFocusMode()
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault()
        triggerSound('toggle')
        toggleSidebar()
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        triggerSound('toggle')
        toggleSettings()
      } else if (e.key === '?' || e.key === '/') {
        e.preventDefault()
        setShowKeymap(prev => !prev)
      } else if (e.key === 'Escape') {
        setSettingsOpen(false)
        setIsFontDropdownOpen(false)
        setShowKeymap(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleFocusMode, toggleSidebar, toggleSettings, setSettingsOpen, triggerSound])

  const handleLike = async () => {
    if (!user || !post) return
    triggerSound('click')
    const nextState = !liked
    setLiked(nextState)
    setPost({ ...post, likeCount: (post.likeCount || 0) + (nextState ? 1 : -1) })
    await toggleLike(post.id, user.uid, liked)
  }

  const handleShare = async () => {
    triggerSound('click')
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      triggerToast('Link copied to clipboard')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      triggerToast('Clipboard permission denied')
    }
  }

  const scrollToHeading = (text) => {
    triggerSound('click')
    const targets = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
    const match = targets.find(el => el.textContent.trim().toLowerCase().includes(text.toLowerCase()))
    if (match) {
      const y = match.getBoundingClientRect().top + window.scrollY - 84
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveHeading(text)
    }
  }

  const scrollToTop = () => {
    triggerSound('click')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    triggerSound('click')
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  }

  // Curated Distinct High-Class Typography Engines
  const fontOptions = useMemo(() => [
    { label: 'Inter UI', class: 'font-["Inter",_sans-serif]', category: 'Sans', spec: 'Standard Geometric Sans' },
    { label: 'Outfit Pro', class: 'font-["Outfit",_sans-serif]', category: 'Display', spec: 'Futuristic Headline Type' },
    { label: 'SF Pro / System', class: 'font-sans', category: 'Native', spec: 'Ultra-Clean OS Native' },
    { label: 'Merriweather', class: 'font-["Merriweather",_serif]', category: 'Serif', spec: 'Editorial High-Legibility' },
    { label: 'Playfair', class: 'font-["Playfair_Display",_serif]', category: 'Editorial', spec: 'High-Contrast Luxury Serif' },
    { label: 'JetBrains Mono', class: 'font-["JetBrains_Mono",_monospace]', category: 'Code', spec: 'Optimized Developer Monospace' },
    { label: 'Fira Code', class: 'font-["Fira_Code",_monospace]', category: 'Technical', spec: 'Ligature Monospace' },
  ], [])

  const currentFontObj = useMemo(() => {
    return fontOptions.find(f => f.class === fontFamily) || fontOptions[0]
  }, [fontOptions, fontFamily])

  // Precision Color Themes with High Visual Contrast & No Washed Blurs
  const themes = {
    light: {
      app: 'bg-[#fafafc] text-zinc-900',
      panel: 'bg-white border border-zinc-200/90 shadow-2xl shadow-zinc-300/40 text-zinc-900',
      badge: 'bg-zinc-100/90 text-zinc-800 hover:bg-zinc-200/80 border border-zinc-200',
      textMuted: 'text-zinc-500',
      btnActive: 'bg-zinc-950 text-white shadow-sm font-semibold',
      btnInactive: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200/90 transition-all',
      tocActive: 'border-zinc-950 bg-zinc-100 text-zinc-950 font-bold',
      tocInactive: 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60',
      dropdownItem: 'hover:bg-zinc-100 text-zinc-800',
      dropdownActive: 'bg-zinc-100 text-zinc-950 font-bold',
      dockBg: 'bg-white border-zinc-300 shadow-xl shadow-zinc-400/20 text-zinc-800',
      dockBtnActive: 'bg-zinc-900 text-white',
      dockBtnInactive: 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950'
    },
    dark: {
      app: 'bg-[#09090b] text-zinc-100',
      panel: 'bg-[#111114] border border-zinc-800/90 shadow-2xl shadow-black text-zinc-200',
      badge: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-750',
      textMuted: 'text-zinc-400',
      btnActive: 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20',
      btnInactive: 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-all',
      tocActive: 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold',
      tocInactive: 'border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850',
      dropdownItem: 'hover:bg-zinc-850 text-zinc-300',
      dropdownActive: 'bg-zinc-800 text-emerald-400 font-bold',
      dockBg: 'bg-[#111114] border-zinc-800/90 shadow-2xl shadow-black/80 text-zinc-200',
      dockBtnActive: 'bg-zinc-100 text-zinc-950 font-bold shadow-md shadow-white/10',
      dockBtnInactive: 'hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100'
    },
    sepia: {
      app: 'bg-[#f5ede0] text-[#342417]',
      panel: 'bg-[#eae0cf] border border-[#d6c4a9] shadow-2xl shadow-[#cfbe9f]/40 text-[#342417]',
      badge: 'bg-[#e0d3be] text-[#4d3623] border border-[#d6c4a9]',
      textMuted: 'text-[#846b55]',
      btnActive: 'bg-[#3b271a] text-[#faf6ee] font-bold shadow-md',
      btnInactive: 'bg-[#e2d5c0] text-[#4d3623] hover:bg-[#d6c5ad] border border-[#d6c4a9] transition-all',
      tocActive: 'border-[#3b271a] bg-[#3b271a]/10 text-[#3b271a] font-bold',
      tocInactive: 'border-transparent text-[#846b55] hover:text-[#3b271a] hover:bg-[#3b271a]/5',
      dropdownItem: 'hover:bg-[#d8c7ad] text-[#342417]',
      dropdownActive: 'bg-[#d8c7ad] text-[#3b271a] font-bold',
      dockBg: 'bg-[#eae0cf] border-[#d6c4a9] shadow-xl text-[#342417]',
      dockBtnActive: 'bg-[#3b271a] text-[#faf6ee]',
      dockBtnInactive: 'hover:bg-[#ded1bc] text-[#6e553f] hover:text-[#342417]'
    },
    chatgpt: {
      app: 'bg-[#18191a] text-[#ececf1]',
      panel: 'bg-[#242528] border border-[#393a3f] shadow-2xl shadow-black/70 text-[#ececf1]',
      badge: 'bg-[#323338] text-[#d1d5db] border border-[#43454b]',
      textMuted: 'text-[#9ca3af]',
      btnActive: 'bg-[#10a37f] text-white font-bold shadow-lg shadow-[#10a37f]/20',
      btnInactive: 'bg-[#2e3035] text-[#d1d5db] hover:bg-[#383a40] hover:text-white border border-[#43454b] transition-all',
      tocActive: 'border-[#10a37f] bg-[#10a37f]/15 text-[#10a37f] font-bold',
      tocInactive: 'border-transparent text-[#9ca3af] hover:text-white hover:bg-white/5',
      dropdownItem: 'hover:bg-[#383a40] text-[#d1d5db]',
      dropdownActive: 'bg-[#383a40] text-[#10a37f] font-bold',
      dockBg: 'bg-[#242528] border-[#393a3f] shadow-2xl text-[#ececf1]',
      dockBtnActive: 'bg-[#10a37f] text-white font-bold',
      dockBtnInactive: 'hover:bg-[#323338] text-[#9ca3af] hover:text-white'
    }
  }

  const activeTheme = themes[readMode] || themes.dark

  // Prose Theme Selector
  const getProseClass = () => {
    if (readMode === 'dark') return 'prose-invert'
    if (readMode === 'sepia') return 'prose-sepia'
    if (readMode === 'chatgpt') return 'prose-chatgpt'
    return ''
  }

  // Dynamic Layout Width Constraints
  const getWidthConstraint = () => {
    if (isFocusMode) return 'max-w-3xl mx-auto'
    if (contentWidth === 'compact') return 'max-w-2xl mx-auto'
    if (contentWidth === 'expanded') return 'max-w-5xl'
    return isSidebarOpen && tableOfContents.length > 0 ? 'max-w-3xl xl:max-w-4xl' : 'max-w-4xl mx-auto'
  }

  // Error State Handler
  if (fetchError) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center p-6 ${activeTheme.app}`}>
        <div className={`p-8 rounded-2xl max-w-md w-full text-center border ${activeTheme.panel}`}>
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Article</h2>
          <p className={`text-sm mb-6 ${activeTheme.textMuted}`}>{fetchError}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeTheme.btnInactive}`}>
              Return Home
            </Link>
            <button 
              onClick={() => loadPostData(false)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${activeTheme.btnActive}`}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !post) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] text-zinc-400">
        <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <BookOpen className="animate-spin text-emerald-500" size={20} />
          Loading document...
        </div>
      </div>
    )
  }

  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''

  return (
    <div 
      style={{ fontSize: `${16 + fontSizeOffset}px` }}
      className={`min-h-screen w-full transition-colors duration-200 ${activeTheme.app} ${fontFamily} antialiased selection:bg-emerald-500/30`}
    >
      
      {/* Interactive Micro Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-zinc-950 text-white border border-zinc-800 text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Keyboard Map Dialog Modal */}
      {showKeymap && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowKeymap(false)}
        >
          <div 
            className={`w-full max-w-sm rounded-2xl p-6 border ${activeTheme.panel}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Keyboard size={16} /> Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowKeymap(false)} className="p-1 rounded-lg opacity-60 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className={activeTheme.textMuted}>Zen / Fullscreen View</span>
                <kbd className="px-2 py-1 rounded bg-current/10 font-mono font-bold">Z</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={activeTheme.textMuted}>Toggle Table of Contents</span>
                <kbd className="px-2 py-1 rounded bg-current/10 font-mono font-bold">O</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={activeTheme.textMuted}>Open Appearance Settings</span>
                <kbd className="px-2 py-1 rounded bg-current/10 font-mono font-bold">S</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className={activeTheme.textMuted}>Close Active Modal</span>
                <kbd className="px-2 py-1 rounded bg-current/10 font-mono font-bold">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-10 lg:py-16">
        <div className="flex items-start justify-center gap-10 xl:gap-16 relative w-full">
          
          {/* Central Article Canvas */}
          <main className={`flex-1 min-w-0 transition-all duration-200 ${getWidthConstraint()}`}>
            {!isFocusMode && (
              <header className="mb-14 pb-12 border-b border-current/10 w-full">
                {post.cover && (
                  <div className="overflow-hidden rounded-2xl mb-10 shadow-xl w-full border border-black/10 dark:border-white/10">
                    <img 
                      src={post.cover} 
                      className="w-full max-h-[520px] object-cover hover:scale-[1.01] transition-transform duration-300" 
                      alt="Cover banner" 
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {(post.tags || []).map((t) => (
                    <Link 
                      key={t} 
                      to={`/search?tag=${t}`} 
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${activeTheme.badge}`}
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black tracking-tight leading-[1.12] mb-8">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-5 text-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold flex items-center justify-center uppercase shadow-md border border-white/20">
                      {post.authorName?.[0] || 'A'}
                    </div>
                    <div className="flex flex-col">
                      <Link to={`/u/${post.authorUsername}`} className="font-semibold hover:underline text-base leading-snug">
                        {post.authorName}
                      </Link>
                      <span className={`text-xs ${activeTheme.textMuted}`}>{date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleLike} 
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        liked 
                          ? 'text-rose-500 border border-rose-500/30 bg-rose-500/10' 
                          : activeTheme.btnInactive
                      }`}
                    >
                      <Heart size={15} fill={liked ? 'currentColor' : 'none'} className={liked ? 'scale-110' : ''} /> 
                      <span>{post.likeCount || 0}</span>
                    </button>

                    <button 
                      onClick={handleShare} 
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTheme.btnInactive}`}
                    >
                      {copiedLink ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
                      <span>{copiedLink ? 'Copied' : 'Share'}</span>
                    </button>

                    <div className="h-6 w-px bg-current/15 mx-1"></div>

                    <button 
                      onClick={() => {
                        triggerSound('click')
                        downloadMarkdown(post.title, post.content)
                        triggerToast('Markdown file generated')
                      }} 
                      className={`p-2.5 rounded-xl transition-all ${activeTheme.btnInactive}`}
                      title="Download Markdown"
                    >
                      <Download size={15} />
                    </button>

                    <button 
                      onClick={() => {
                        triggerSound('click')
                        downloadPDF('post-content', post.title)
                        triggerToast('Exporting PDF document')
                      }} 
                      className={`p-2.5 rounded-xl transition-all ${activeTheme.btnInactive}`}
                      title="Export PDF"
                    >
                      <FileDown size={15} />
                    </button>
                  </div>
                </div>
              </header>
            )}

            {isFocusMode && (
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-16 text-center leading-tight">
                {post.title}
              </h1>
            )}
            
            {/* Markdown Body Engine */}
            <div className={`prose-wrapper w-full max-w-none transition-colors duration-200 ${getProseClass()}`}>
              <MarkdownRenderer id="post-content" content={post.content} />
            </div>
          </main>

          {/* Sticky Table of Contents Sidebar */}
          {!isFocusMode && tableOfContents.length > 0 && isSidebarOpen && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-10 h-[calc(100vh-5rem)] z-10">
              <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${activeTheme.panel}`}>
                
                <div className="flex items-center justify-between p-4 border-b border-current/10 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                    <List size={14} />
                    <span>Contents ({tableOfContents.length})</span>
                  </div>
                  <button 
                    onClick={() => {
                      triggerSound('click')
                      setSidebarOpen(false)
                    }}
                    className="p-1 rounded-lg opacity-50 hover:opacity-100 hover:bg-current/10 transition-all"
                    title="Hide Outline"
                  >
                    <X size={15} />
                  </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-[13px]">
                  {tableOfContents.map((item, idx) => {
                    const isActive = activeHeading.toLowerCase().includes(item.text.toLowerCase())
                    return (
                      <button
                        key={idx}
                        onClick={() => scrollToHeading(item.text)}
                        style={{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }}
                        className={`group flex items-center justify-between w-full text-left py-2 pr-2.5 rounded-lg border-l-2 transition-all ${
                          isActive ? activeTheme.tocActive : activeTheme.tocInactive
                        }`}
                        title={item.text}
                      >
                        <span className="truncate">{item.text}</span>
                        {isActive && <ChevronRight size={13} className="shrink-0 ml-1.5 opacity-80" />}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>
          )}

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-200 lg:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setSidebarOpen(false)} 
      />
      
      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-[85vw] sm:w-88 z-50 transform transition-transform duration-200 ease-out lg:hidden flex flex-col border-l ${
          activeTheme.panel
        } ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-current/10 shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-xs tracking-wider uppercase opacity-80">
            <List size={15} />
            <span>Contents</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className={`rounded-xl p-2 transition-colors ${activeTheme.btnInactive}`}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          {tableOfContents.map((item, index) => {
            const isActive = activeHeading.toLowerCase().includes(item.text.toLowerCase())
            return (
              <button
                key={index}
                onClick={() => {
                  scrollToHeading(item.text)
                  setSidebarOpen(false)
                }}
                style={{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }}
                className={`block w-full text-left text-[13px] py-2.5 pr-2.5 rounded-lg border-l-2 transition-all ${
                  isActive ? activeTheme.tocActive : activeTheme.tocInactive
                }`}
              >
                <span className="truncate block">{item.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Solid Futuristic Floating Action Dock */}
      <div 
        ref={settingsPanelRef}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        {/* Settings Popover Panel */}
        <div 
          className={`absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 p-5 rounded-2xl w-[330px] transition-all duration-200 origin-bottom border ${
            activeTheme.panel
          } ${isSettingsOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
        >
          {/* Theme Mode Selector */}
          <div className="mb-4">
            <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${activeTheme.textMuted}`}>
              <Sun size={13} /> Theme Palette
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[ 
                { mode: 'light', label: 'Light', icon: Sun }, 
                { mode: 'dark', label: 'Dark', icon: Moon }, 
                { mode: 'sepia', label: 'Sepia', icon: Coffee }, 
                { mode: 'chatgpt', label: 'Onyx', icon: Sparkles }
              ].map(({ mode, label, icon: Icon }) => (
                <button 
                  key={mode}
                  onClick={() => {
                    triggerSound('click')
                    setReadMode(mode)
                  }} 
                  className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center gap-1.5 transition-all ${
                    readMode === mode ? activeTheme.btnActive : activeTheme.btnInactive
                  }`} 
                >
                  <Icon size={14} />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Engine Dropdown */}
          <div className="mb-4">
            <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${activeTheme.textMuted}`}>
              <Type size={13} /> Typography
            </h4>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  triggerSound('click')
                  setIsFontDropdownOpen(!isFontDropdownOpen)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium border border-current/15 ${activeTheme.btnInactive}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{currentFontObj.label}</span>
                  <span className="text-[9px] opacity-60 uppercase font-mono px-1.5 py-0.5 rounded bg-current/10">
                    {currentFontObj.category}
                  </span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFontDropdownOpen && (
                <div className={`absolute left-0 bottom-[calc(100%+6px)] w-full max-h-52 overflow-y-auto rounded-xl p-1.5 shadow-2xl border z-50 ${activeTheme.panel}`}>
                  {fontOptions.map((font) => {
                    const isSelected = fontFamily === font.class
                    return (
                      <button
                        key={font.label}
                        type="button"
                        onClick={() => {
                          triggerSound('click')
                          setFontFamily(font.class)
                          setIsFontDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected ? activeTheme.dropdownActive : activeTheme.dropdownItem
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${font.class}`}>{font.label}</span>
                            <span className="text-[9px] opacity-50 uppercase font-mono">{font.category}</span>
                          </div>
                          <span className="text-[10px] opacity-60 truncate">{font.spec}</span>
                        </div>
                        {isSelected && <Check size={13} className="text-emerald-500 shrink-0 ml-2" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Reading Scale & Viewport Width Controls */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${activeTheme.textMuted}`}>
                Text Size
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    triggerSound('click')
                    setFontSizeOffset(prev => Math.max(-2, prev - 1))
                  }}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${activeTheme.btnInactive}`}
                  title="Decrease font size"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-mono w-6 text-center">{fontSizeOffset > 0 ? `+${fontSizeOffset}` : fontSizeOffset}</span>
                <button 
                  onClick={() => {
                    triggerSound('click')
                    setFontSizeOffset(prev => Math.min(4, prev + 1))
                  }}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${activeTheme.btnInactive}`}
                  title="Increase font size"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>

            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${activeTheme.textMuted}`}>
                Content Width
              </span>
              <div className="flex items-center gap-1">
                {['compact', 'standard', 'expanded'].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      triggerSound('click')
                      setContentWidth(w)
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                      contentWidth === w ? activeTheme.btnActive : activeTheme.btnInactive
                    }`}
                  >
                    {w[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Zen View / Fullscreen Action */}
          <button 
            onClick={toggleFocusMode}
            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
              isFocusMode ? activeTheme.btnActive : activeTheme.btnInactive
            }`}
          >
            {isFocusMode ? <><Minimize size={14} /> Exit Zen View</> : <><Maximize size={14} /> Zen View (Z)</>}
          </button>
        </div>

        {/* Primary Tactile Dock Pill */}
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border shadow-2xl transition-all ${activeTheme.dockBg}`}>
          <button 
            onClick={scrollToTop} 
            className={`p-2 rounded-full transition-colors ${activeTheme.dockBtnInactive}`} 
            title="Scroll to Top"
          >
            <ArrowUp size={15} />
          </button>

          {tableOfContents.length > 0 && (
            <button 
              onClick={() => {
                triggerSound('toggle')
                toggleSidebar()
              }} 
              className={`p-2 rounded-full transition-all ${
                isSidebarOpen ? activeTheme.dockBtnActive : activeTheme.dockBtnInactive
              }`}
              title="Toggle Outline (O)"
            >
              <List size={15} />
            </button>
          )}

          <div className="h-4 w-px bg-current opacity-20 mx-0.5" />

          <button 
            onClick={() => {
              triggerSound('toggle')
              toggleSettings()
            }} 
            className={`p-2 rounded-full transition-all ${
              isSettingsOpen ? activeTheme.dockBtnActive : activeTheme.dockBtnInactive
            }`}
            title="Reading Engine Settings (S)"
          >
            <Settings size={15} className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-45' : ''}`} />
          </button>

          <button 
            onClick={() => setShowKeymap(true)}
            className={`p-2 rounded-full transition-all ${activeTheme.dockBtnInactive}`}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={15} />
          </button>

          <div className="h-4 w-px bg-current opacity-20 mx-0.5" />

          <button 
            onClick={scrollToBottom} 
            className={`p-2 rounded-full transition-colors ${activeTheme.dockBtnInactive}`} 
            title="Scroll to Bottom"
          >
            <ArrowDown size={15} />
          </button>
        </div>
      </div>

    </div>
  )
}