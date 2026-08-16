import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, incrementView, toggleLike } from '../lib/posts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useReaderStore } from '../store/useReaderStore.js'
import { 
  Heart, Download, FileDown, ArrowUp, ArrowDown, 
  Settings, Sun, Moon, Coffee, Bot, Maximize, Minimize,
  Share2, Check, BookOpen, List, X, ChevronRight, Type
} from 'lucide-react'
import { format } from 'date-fns'

export default function PostView() {
  const { postId } = useParams()
  const { user } = useAuth()
  
  const [copiedLink, setCopiedLink] = useState(false)
  const [isUiVisible, setIsUiVisible] = useState(true)
  const [activeHeading, setActiveHeading] = useState('')
  const inactivityTimerRef = useRef(null)

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

  // Auto-Hide Timer for Floating Dock
/*   useEffect(() => {
    const handleActivity = () => {
      setIsUiVisible(true)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        if (!isSettingsOpen) setIsUiVisible(false)
      }, 15000)
    }

    const events = ['mousemove', 'mousedown', 'touchstart', 'scroll', 'keydown']
    events.forEach(event => window.addEventListener(event, handleActivity))

    inactivityTimerRef.current = setTimeout(() => setIsUiVisible(false), 35000)

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      events.forEach(event => window.removeEventListener(event, handleActivity))
    }
  }, [isSettingsOpen]) */

  // Fetch Post & Parse Headings
  useEffect(() => {
    setPost(null)
    ;(async () => {
      const p = await getPost(postId)
      setPost(p)
      if (p) {
        incrementView(postId)
        setLiked(user ? (p.likes || []).includes(user.uid) : false)
        
        if (p.content) {
          const headings = p.content
            .split('\n')
            .filter((line) => /^#{1,6}\s/.test(line))
            .map((line) => {
              const level = line.match(/^#+/)[0].length
              const text = line.replace(/^#+\s/, '').trim()
              return { level, text }
            })
          setTableOfContents(headings)
        }
      }
    })()
  }, [postId, user, setPost, setLiked, setTableOfContents])

  // Advanced Scrollspy for Table of Contents
  useEffect(() => {
    if (!post || tableOfContents.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting)
        if (visibleEntries.length > 0) {
          setActiveHeading(visibleEntries[0].target.textContent.trim())
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0.1 }
    )

    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headingElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [post, tableOfContents])

  // Fullscreen Handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setFocusMode(false)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [setFocusMode])

  const toggleFocusMode = async () => {
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
    } catch (err) {
      console.error("Fullscreen error:", err)
      setFocusMode(!isFocusMode) 
    }
  }

  async function handleLike() {
    if (!user || !post) return
    await toggleLike(post.id, user.uid, liked)
    setLiked(!liked)
    setPost({ ...post, likeCount: (post.likeCount || 0) + (liked ? -1 : 1) })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const scrollToHeading = (text) => {
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    const target = elements.find(el => el.textContent.trim().includes(text.trim()))
    if (target) {
      const yOffset = -90
      const y = target.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveHeading(text)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  if (!post) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] text-zinc-400">
        <div className="flex items-center gap-3 animate-pulse text-sm font-semibold tracking-wide">
          <BookOpen className="animate-spin text-emerald-500" size={20} />
          Loading document...
        </div>
      </div>
    )
  }

  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''

  // Expanded Premium Typography
  const fontOptions = [
    { label: 'System', class: 'font-sans' },
    { label: 'Inter', class: 'font-["Inter",_sans-serif]' },
    { label: 'Roboto', class: 'font-["Roboto",_sans-serif]' },
    { label: 'Article', class: 'font-serif' },
    { label: 'Georgia', class: 'font-["Georgia",_serif]' },
    { label: 'Fira Code', class: 'font-["Fira_Code",_monospace]' },
    { label: 'Mono', class: 'font-mono' },
  ]

  // Ultra-modern color palettes with exact aesthetic mirroring your screenshot
  const themes = {
    light: {
      app: 'bg-[#fcfcfc] text-zinc-900',
      panel: 'bg-white/80 backdrop-blur-3xl ring-1 ring-zinc-200 shadow-2xl shadow-zinc-200/50',
      badge: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 ring-1 ring-zinc-200',
      textMuted: 'text-zinc-500',
      btnActive: 'bg-zinc-900 text-white shadow-md font-bold',
      btnInactive: 'bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 ring-1 ring-zinc-200 shadow-sm transition-all',
      tocActive: 'border-zinc-900 bg-zinc-900/5 text-zinc-900 font-semibold',
      tocInactive: 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50'
    },
    dark: {
      app: 'bg-[#09090b] text-zinc-200',
      panel: 'bg-[#18181b]/80 backdrop-blur-3xl ring-1 ring-white/10 shadow-2xl shadow-black/80',
      badge: 'bg-zinc-800/50 text-zinc-300 ring-1 ring-white/10',
      textMuted: 'text-zinc-500',
      btnActive: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/50 shadow-md font-bold',
      btnInactive: 'bg-zinc-800/40 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200 ring-1 ring-white/10 transition-all',
      tocActive: 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold',
      tocInactive: 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
    },
    sepia: {
      app: 'bg-[#f4ebd8] text-[#3d2b1f]',
      panel: 'bg-[#ebe0c8]/80 backdrop-blur-3xl ring-1 ring-[#d6c7ab] shadow-2xl shadow-[#d6c7ab]/40',
      badge: 'bg-[#e3d5bb]/50 text-[#5c4632] ring-1 ring-[#d6c7ab]',
      textMuted: 'text-[#826a54]',
      btnActive: 'bg-[#3d2b1f] text-[#f4ebd8] font-bold shadow-md',
      btnInactive: 'bg-[#ebe0c8]/50 text-[#5c4632] hover:bg-[#e3d5bb] hover:text-[#3d2b1f] ring-1 ring-[#d6c7ab] shadow-sm transition-all',
      tocActive: 'border-[#3d2b1f] bg-[#3d2b1f]/5 text-[#3d2b1f] font-semibold',
      tocInactive: 'border-transparent text-[#826a54] hover:text-[#3d2b1f] hover:bg-[#3d2b1f]/5'
    },
    chatgpt: {
      app: 'bg-[#212121] text-[#ececf1]',
      panel: 'bg-[#2f2f2f]/80 backdrop-blur-3xl ring-1 ring-[#424242] shadow-2xl shadow-black/60',
      badge: 'bg-[#424242]/50 text-[#d1d5db] ring-1 ring-[#424242]',
      textMuted: 'text-[#9ca3af]',
      btnActive: 'bg-[#10a37f]/10 text-[#10a37f] ring-1 ring-[#10a37f]/50 font-bold shadow-md',
      btnInactive: 'bg-[#2f2f2f]/50 text-[#d1d5db] hover:bg-[#424242] hover:text-white ring-1 ring-[#424242] shadow-sm transition-all',
      tocActive: 'border-[#10a37f] bg-[#10a37f]/10 text-[#10a37f] font-semibold',
      tocInactive: 'border-transparent text-[#9ca3af] hover:text-white hover:bg-white/5'
    }
  }

  const activeTheme = themes[readMode] || themes.dark

  const getProseClass = () => {
    if (readMode === 'dark') return 'prose-invert'
    if (readMode === 'sepia') return 'prose-sepia'
    if (readMode === 'chatgpt') return 'prose-chatgpt'
    return ''
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ease-out ${activeTheme.app} ${fontFamily} antialiased selection:bg-emerald-500/30`}>
      
      {/* 
        MAIN GRID WRAPPER 
        Using items-start on the wrapper ensures child elements do not stretch automatically, 
        giving the sticky sidebar the perfect track to slide on.
      */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-10 lg:py-16">
        <div className="flex items-start justify-center gap-10 xl:gap-16 relative w-full">
          
          {/* Central Reading Canvas */}
          <main 
            className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${
              isFocusMode 
                ? 'max-w-3xl mx-auto' 
                : isSidebarOpen && tableOfContents.length > 0
                  ? 'max-w-3xl xl:max-w-4xl' 
                  : 'max-w-4xl mx-auto'
            }`}
          >
            {!isFocusMode && (
              <header className="mb-14 pb-12 border-b border-current/10 w-full">
                {post.cover && (
                  <div className="overflow-hidden rounded-3xl mb-12 shadow-2xl w-full ring-1 ring-white/10">
                    <img 
                      src={post.cover} 
                      className="w-full max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-700 ease-out" 
                      alt="Cover" 
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {(post.tags || []).map((t) => (
                    <Link 
                      key={t} 
                      to={`/search?tag=${t}`} 
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all backdrop-blur-sm ${activeTheme.badge}`}
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black tracking-tight leading-[1.1] mb-8">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-5 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold flex items-center justify-center uppercase shadow-lg ring-2 ring-white/10">
                      {post.authorName?.[0] || 'A'}
                    </div>
                    <div className="flex flex-col">
                      <Link to={`/u/${post.authorUsername}`} className="font-semibold hover:underline text-base">
                        {post.authorName}
                      </Link>
                      <span className={`text-xs mt-0.5 tracking-wide ${activeTheme.textMuted}`}>{date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleLike} 
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wider transition-all ${liked ? 'text-rose-500 ring-1 ring-rose-500/50 bg-rose-500/10' : activeTheme.btnInactive}`}
                    >
                      <Heart size={16} fill={liked ? 'currentColor' : 'none'} className={liked ? 'scale-110 transition-transform' : 'transition-transform'} /> 
                      <span>{post.likeCount || 0}</span>
                    </button>

                    <button 
                      onClick={handleShare} 
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wider transition-all ${activeTheme.btnInactive}`}
                    >
                      {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                      <span>{copiedLink ? 'Copied' : 'Share'}</span>
                    </button>

                    <div className="h-8 w-px bg-current/10 mx-1"></div>

                    <button 
                      onClick={() => downloadMarkdown(post.title, post.content)} 
                      className={`p-3 rounded-2xl transition-all ${activeTheme.btnInactive}`}
                      title="Download Markdown"
                    >
                      <Download size={16} />
                    </button>

                    <button 
                      onClick={() => downloadPDF('post-content', post.title)} 
                      className={`p-3 rounded-2xl transition-all ${activeTheme.btnInactive}`}
                      title="Export PDF"
                    >
                      <FileDown size={16} />
                    </button>
                  </div>
                </div>
              </header>
            )}

            {isFocusMode && (
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-20 text-center leading-tight">
                {post.title}
              </h1>
            )}
            
            {/* Markdown Body Component */}
            <div className={`prose-wrapper w-full max-w-none transition-colors duration-500 ${getProseClass()}`}>
              <MarkdownRenderer id="post-content" content={post.content} />
            </div>
          </main>

          {/* 
            TRUE STICKY RIGHT SIDEBAR
            - `sticky top-10`: Anchors it dynamically to viewport.
            - `h-[calc(100vh-5rem)]`: Locks the height exactly to screen bounds so it NEVER stretches.
            Note: If it still breaks, check if your <App> or <body> has `overflow-x: hidden`. 
          */}
          {!isFocusMode && tableOfContents.length > 0 && isSidebarOpen && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-10 h-[calc(100vh-5rem)] z-10 transition-opacity duration-300">
              <div className={`flex flex-col h-full rounded-[2rem] overflow-hidden ${activeTheme.panel}`}>
                
                {/* TOC Header */}
                <div className="flex items-center justify-between p-5 pb-4 border-b border-current/10 shrink-0">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                    <List size={14} className="text-current opacity-60" />
                    <span>Contents</span>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-xl opacity-40 hover:opacity-100 hover:bg-current/10 transition-all"
                    title="Hide Outline"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Independently Scrollable Headings */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-[13px] scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent">
                  {tableOfContents.map((item, idx) => {
                    const isActive = activeHeading.toLowerCase().includes(item.text.toLowerCase()) || 
                                     item.text.toLowerCase().includes(activeHeading.toLowerCase())
                    return (
                      <button
                        key={idx}
                        onClick={() => scrollToHeading(item.text)}
                        style={{ paddingLeft: `${(item.level - 1) * 0.85 + 0.5}rem` }}
                        className={`group flex items-center justify-between w-full text-left py-2.5 pr-3 rounded-xl border-l-[3px] transition-all duration-300 ${
                          isActive ? activeTheme.tocActive : activeTheme.tocInactive
                        }`}
                        title={item.text}
                      >
                        <span className="truncate leading-relaxed">{item.text}</span>
                        {isActive && <ChevronRight size={14} className="shrink-0 opacity-100 ml-2" />}
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-md z-50 transition-opacity duration-500 lg:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setSidebarOpen(false)} 
      />
      
      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-[85vw] sm:w-96 ring-1 ring-white/10 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col ${
          activeTheme.panel
        } ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-current/10 shrink-0">
          <div className="flex items-center gap-3 font-bold text-xs tracking-[0.2em] uppercase opacity-80">
            <List size={16} />
            <span>Contents</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className={`rounded-2xl p-2.5 transition-colors ${activeTheme.btnInactive}`}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 space-y-1.5 custom-scrollbar">
          {tableOfContents.length > 0 ? (
            tableOfContents.map((item, index) => {
              const isActive = activeHeading.toLowerCase().includes(item.text.toLowerCase())
              return (
                <button
                  key={index}
                  onClick={() => {
                    scrollToHeading(item.text)
                    setSidebarOpen(false)
                  }}
                  style={{ paddingLeft: `${(item.level - 1) * 0.85 + 0.5}rem` }}
                  className={`block w-full text-left text-[13px] py-3 pr-3 rounded-xl border-l-[3px] transition-all duration-300 ${
                    isActive ? activeTheme.tocActive : activeTheme.tocInactive
                  }`}
                >
                  <span className="truncate block">{item.text}</span>
                </button>
              )
            })
          ) : (
            <p className="opacity-50 text-xs italic p-4 text-center">No headings found.</p>
          )}
        </div>
      </div>

      {/* Modern Floating Action Dock */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 p-2.5 rounded-full shadow-2xl ring-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isUiVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
        } bg-[#18181b]/95 backdrop-blur-3xl ring-white/10 text-zinc-300`}
      >
        
        {/* Settings Popover Panel */}
        <div 
          className={`absolute bottom-[calc(100%+20px)] left-1/2 -translate-x-1/2 p-6 rounded-[2rem] shadow-2xl w-[340px] transition-all duration-300 origin-bottom ${
            activeTheme.panel
          } ${isSettingsOpen ? 'scale-100 opacity-250 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
        >
          {/* Theme Section */}
          <div className="mb-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${activeTheme.textMuted}`}>
              <Sun size={12} /> Theme Selection
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {[ 
                { mode: 'light', label: 'Light' }, 
                { mode: 'dark', label: 'Dark' }, 
                { mode: 'sepia', label: 'Sepia' }, 
                { mode: 'chatgpt', label: 'AI' }
              ].map(({ mode, label }) => (
                <button 
                  key={mode}
                  onClick={() => setReadMode(mode)} 
                  className={`py-2.5 rounded-2xl text-[11px] font-semibold transition-all ${
                    readMode === mode ? activeTheme.btnActive : activeTheme.btnInactive
                  }`} 
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Extended Typography Section */}
          <div className="mb-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${activeTheme.textMuted}`}>
              <Type size={12} /> Typography
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map(({ label, class: fontClass }) => (
                <button 
                  key={label}
                  onClick={() => setFontFamily(fontClass)} 
                  className={`py-2.5 rounded-2xl text-[11px] font-medium transition-all ${fontClass} ${
                    fontFamily === fontClass ? activeTheme.btnActive : activeTheme.btnInactive
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Mode Toggle */}
          <button 
            onClick={toggleFocusMode}
            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs tracking-wider transition-all ${
              isFocusMode ? activeTheme.btnActive : activeTheme.btnInactive
            }`}
          >
            {isFocusMode ? <><Minimize size={16} /> Exit Zen Mode</> : <><Maximize size={16} /> Zen Mode</>}
          </button>
        </div>

        {/* Dock Buttons */}
        <button 
          onClick={scrollToTop} 
          className="p-3.5 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white group" 
          title="Scroll to Top"
        >
          <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>

        {tableOfContents.length > 0 && (
          <button 
            onClick={toggleSidebar} 
            className={`p-3.5 rounded-full transition-all ${
              isSidebarOpen ? 'bg-white text-zinc-900 shadow-lg shadow-white/20' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Outline"
          >
            <List size={18} />
          </button>
        )}

        <button 
          onClick={toggleSettings} 
          className={`p-3.5 rounded-full transition-all ${
            isSettingsOpen ? 'bg-white text-zinc-900 shadow-lg shadow-white/20' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
          }`}
          title="Reading Settings"
        >
          <Settings size={18} className={isSettingsOpen ? 'rotate-90 transition-transform duration-500' : 'transition-transform duration-500'} />
        </button>

        <button 
          onClick={scrollToBottom} 
          className="p-3.5 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white group" 
          title="Scroll to Bottom"
        >
          <ArrowDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

    </div>
  )
}