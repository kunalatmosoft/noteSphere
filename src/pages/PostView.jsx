import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, incrementView, toggleLike } from '../lib/posts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useReaderStore } from '../store/useReaderStore.js'
import { 
  Heart, Download, FileDown, ArrowUp, ArrowDown, 
  Menu, X, Settings, Sun, Moon, Coffee, Bot, Maximize, Minimize,
  Share2, Check, BookOpen, Compass, PanelRightClose, PanelRight
} from 'lucide-react'
import { format } from 'date-fns'

export default function PostView() {
  const { postId } = useParams()
  const { user } = useAuth()
  
  const [copiedLink, setCopiedLink] = useState(false)
  const [isUiVisible, setIsUiVisible] = useState(true)
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

  // 30-Second Inactivity Auto-Hide Timer
  useEffect(() => {
    const handleActivity = () => {
      setIsUiVisible(true)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        if (!isSettingsOpen) setIsUiVisible(false)
      }, 30000)
    }

    const events = ['mousemove', 'mousedown', 'touchstart', 'scroll', 'keydown']
    events.forEach(event => window.addEventListener(event, handleActivity))

    inactivityTimerRef.current = setTimeout(() => setIsUiVisible(false), 30000)

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      events.forEach(event => window.removeEventListener(event, handleActivity))
    }
  }, [isSettingsOpen])

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
              const text = line.replace(/^#+\s/, '')
              return { level, text }
            })
          setTableOfContents(headings)
        }
      }
    })()
  }, [postId, user, setPost, setLiked, setTableOfContents])

  // Sync Fullscreen Exit
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
      const yOffset = -80
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  if (!post) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0f17] text-slate-400">
        <div className="flex items-center gap-3 animate-pulse text-sm font-medium">
          <BookOpen className="animate-spin text-blue-500" size={20} />
          Loading document...
        </div>
      </div>
    )
  }

  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''

  // Consistent Theme Color Palettes (Applied universally across whole canvas)
  const themes = {
    light: {
      app: 'bg-[#fafafa] text-slate-900',
      panel: 'bg-white/95 backdrop-blur-md border-slate-200 shadow-xl',
      badge: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
      textMuted: 'text-slate-500 hover:text-slate-900',
      btnActive: 'bg-blue-600 text-white shadow-sm',
      btnInactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200/80',
    },
    dark: {
      app: 'bg-[#0b0f17] text-slate-100',
      panel: 'bg-[#111726]/95 backdrop-blur-md border-slate-800 shadow-2xl',
      badge: 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60',
      textMuted: 'text-slate-400 hover:text-slate-100',
      btnActive: 'bg-blue-600 text-white shadow-sm',
      btnInactive: 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700/60',
    },
    sepia: {
      app: 'bg-[#f6f0e2] text-[#433020]',
      panel: 'bg-[#ede3ce]/95 backdrop-blur-md border-[#dfd2ba] shadow-xl',
      badge: 'bg-[#e5d8bc] text-[#5b4636] hover:bg-[#dcd0b1] border-[#dfd2ba]',
      textMuted: 'text-[#7d6653] hover:text-[#433020]',
      btnActive: 'bg-[#8c735d] text-white shadow-sm',
      btnInactive: 'bg-[#e5d8bc] text-[#5b4636] hover:bg-[#dcd0b1] border-[#dfd2ba]',
    },
    chatgpt: {
      app: 'bg-[#18181b] text-[#ececf1]',
      panel: 'bg-[#232328]/95 backdrop-blur-md border-[#383842] shadow-2xl',
      badge: 'bg-[#2a2b32] text-[#d1d5db] hover:bg-[#343541] border-[#3e3f4b]',
      textMuted: 'text-[#9ca3af] hover:text-white',
      btnActive: 'bg-[#10a37f] text-white shadow-sm',
      btnInactive: 'bg-[#2a2b32] text-[#d1d5db] hover:bg-[#343541] border-[#3e3f4b]',
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
    <div className={`min-h-screen w-full transition-colors duration-300 ${activeTheme.app} ${fontFamily} antialiased selection:bg-blue-500/20`}>
      
      {/* Floating Top Nav (Auto-hides after 30s) */}


      {/* Main Grid Wrapper */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 lg:py-20">
        <div className="flex justify-center items-start gap-8 lg:gap-12 w-full">
          
          {/* Main Reading Canvas */}
          <main 
            className={`w-full min-w-0 transition-all duration-300 ${
              isFocusMode 
                ? 'max-w-4xl mx-auto' 
                : isSidebarOpen && tableOfContents.length > 0
                  ? 'max-w-3xl xl:max-w-4xl' 
                  : 'max-w-4xl xl:max-w-5xl mx-auto'
            }`}
          >
            {!isFocusMode && (
              <header className="mb-10 pb-8 border-b border-current/10 w-full">
                {post.cover && (
                  <div className="overflow-hidden rounded-2xl mb-8 border border-white/10 shadow-lg w-full">
                    <img 
                      src={post.cover} 
                      className="w-full max-h-[420px] object-cover hover:scale-105 transition-transform duration-700" 
                      alt="Cover" 
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {(post.tags || []).map((t) => (
                    <Link 
                      key={t} 
                      to={`/search?tag=${t}`} 
                      className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors border ${activeTheme.badge}`}
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] mb-6">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 font-bold flex items-center justify-center uppercase">
                      {post.authorName?.[0] || 'A'}
                    </div>
                    <div>
                      <Link to={`/u/${post.authorUsername}`} className="font-semibold hover:underline">
                        {post.authorName}
                      </Link>
                      <p className={`text-xs opacity-60 ${activeTheme.textMuted}`}>{date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleLike} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${liked ? 'text-red-500 border-red-500/30 bg-red-500/10' : activeTheme.btnInactive}`}
                    >
                      <Heart size={14} fill={liked ? 'currentColor' : 'none'} className={liked ? 'scale-110' : ''} /> 
                      <span>{post.likeCount || 0}</span>
                    </button>

                    <button 
                      onClick={handleShare} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${activeTheme.btnInactive}`}
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                      <span>{copiedLink ? 'Copied' : 'Share'}</span>
                    </button>

                    <button 
                      onClick={() => downloadMarkdown(post.title, post.content)} 
                      className={`p-2 rounded-lg border transition-all ${activeTheme.btnInactive}`}
                      title="Download Markdown"
                    >
                      <Download size={14} />
                    </button>

                    <button 
                      onClick={() => downloadPDF('post-content', post.title)} 
                      className={`p-2 rounded-lg border transition-all ${activeTheme.btnInactive}`}
                      title="Export PDF"
                    >
                      <FileDown size={14} />
                    </button>
                  </div>
                </div>
              </header>
            )}

            {isFocusMode && (
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-12 text-center">
                {post.title}
              </h1>
            )}
            
            {/* Markdown Body */}
            <div className={`prose-wrapper w-full max-w-none transition-colors duration-300 ${getProseClass()}`}>
              <MarkdownRenderer id="post-content" content={post.content} />
            </div>
          </main>

          {/* Desktop Right Outline (TOC) */}
          {!isFocusMode && tableOfContents.length > 0 && isSidebarOpen && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className={`sticky top-20 p-5 rounded-2xl border ${activeTheme.panel}`}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-current/10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-75">
                    <Compass size={14} />
                    <span>Contents</span>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="opacity-50 hover:opacity-100 transition-opacity p-1 rounded-md"
                    title="Close Sidebar"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <nav className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {tableOfContents.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToHeading(item.text)}
                      style={{ paddingLeft: `${(item.level - 1) * 0.65}rem` }}
                      className={`block text-left w-full truncate py-1 px-1.5 rounded transition-colors ${
                        item.level === 1 
                          ? 'font-semibold text-current opacity-90 hover:bg-current/5' 
                          : 'opacity-65 hover:opacity-100 hover:text-blue-500 hover:bg-current/5'
                      }`}
                      title={item.text}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

        </div>
      </div>

      {/* Mobile TOC Drawer */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setSidebarOpen(false)} 
      />
      
      <div 
        className={`fixed right-0 top-0 h-full w-80 border-l z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          activeTheme.panel
        } ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-current/10">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Compass size={16} />
            <span>Table of Contents</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className={`rounded-lg p-1.5 transition-colors ${activeTheme.btnInactive}`}>
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-80px)] space-y-2">
          {tableOfContents.length > 0 ? (
            tableOfContents.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  scrollToHeading(item.text)
                  setSidebarOpen(false)
                }}
                style={{ paddingLeft: `${(item.level - 1) * 0.8}rem` }}
                className={`block w-full text-left text-xs py-1.5 transition-colors leading-relaxed font-medium ${activeTheme.textMuted}`}
              >
                {item.text}
              </button>
            ))
          ) : (
            <p className="opacity-50 text-xs italic">No headings indexed.</p>
          )}
        </div>
      </div>

      {/* Floating Bottom Dock */}
      <div 
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl shadow-2xl border transition-all duration-500 ease-in-out ${
          isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        } bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border-white/10 text-white`}
      >
        <div 
          className={`absolute bottom-full right-0 mb-3 p-4 rounded-2xl shadow-2xl border w-[260px] transition-all duration-200 origin-bottom-right ${
            activeTheme.panel
          } ${isSettingsOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
        >
          <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${activeTheme.textMuted}`}>Theme</h4>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {[ 
              { mode: 'light', icon: Sun, label: 'Light' }, 
              { mode: 'dark', icon: Moon, label: 'Dark' }, 
              { mode: 'sepia', icon: Coffee, label: 'Sepia' }, 
              { mode: 'chatgpt', icon: Bot, label: 'AI' }
            ].map(({ mode, icon: Icon, label }) => (
              <button 
                key={mode}
                onClick={() => setReadMode(mode)} 
                className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border text-[10px] font-medium ${
                  readMode === mode ? activeTheme.btnActive : activeTheme.btnInactive
                }`} 
                title={label}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${activeTheme.textMuted}`}>Font</h4>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {[
              { style: 'font-sans', label: 'Sans' },
              { style: 'font-serif', label: 'Serif' },
              { style: 'font-mono', label: 'Mono' }
            ].map(({ style, label }) => (
              <button 
                key={style}
                onClick={() => setFontFamily(style)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${style} ${
                  fontFamily === style ? activeTheme.btnActive : activeTheme.btnInactive
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button 
            onClick={toggleFocusMode}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-all border ${
              isFocusMode ? activeTheme.btnActive : activeTheme.btnInactive
            }`}
          >
            {isFocusMode ? <><Minimize size={14} /> Exit Zen Mode</> : <><Maximize size={14} /> Zen Mode</>}
          </button>
        </div>

        <button 
          onClick={scrollToTop} 
          className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white" 
          title="Scroll to Top"
        >
          <ArrowUp size={17} />
        </button>

        {tableOfContents.length > 0 && (
          <button 
            onClick={toggleSidebar} 
            className={`p-2.5 rounded-xl transition-all ${
              isSidebarOpen ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle Outline"
          >
            <Menu size={17} />
          </button>
        )}

        <button 
          onClick={toggleSettings} 
          className={`p-2.5 rounded-xl transition-all ${
            isSettingsOpen ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title="Reading Settings"
        >
          <Settings size={17} />
        </button>

        <button 
          onClick={scrollToBottom} 
          className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white" 
          title="Scroll to Bottom"
        >
          <ArrowDown size={17} />
        </button>
      </div>

    </div>
  )
}