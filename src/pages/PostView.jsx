import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, incrementView, toggleLike } from '../lib/posts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useReaderStore } from '../store/useReaderStore.js' // <-- Import the store
import { 
  Heart, Eye, Download, FileDown, ArrowUp, ArrowDown, 
  List, X, Settings, Sun, Moon, Coffee, Bot, Maximize, Minimize 
} from 'lucide-react'
import { format } from 'date-fns'

export default function PostView() {
  const { postId } = useParams()
  const { user } = useAuth()
  
  // Extract state and actions from Zustand store
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

  // Fetch Post
  useEffect(() => {
    // Reset state on mount or when postId changes so we don't flash old data
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

  // Handle Fullscreen "ESC" key press syncing
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFocusMode(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [setFocusMode])

  // Toggle Focus/Fullscreen Mode
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
      console.error("Fullscreen API error:", err)
      setFocusMode(!isFocusMode) 
    }
  }

  async function handleLike() {
    if (!user || !post) return
    await toggleLike(post.id, user.uid, liked)
    setLiked(!liked)
    // Update the post like count in Zustand
    setPost({ ...post, likeCount: (post.likeCount || 0) + (liked ? -1 : 1) })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  if (!post) return <p className="text-center mt-10 text-base-300">Loading…</p>

  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''

  const themes = {
    light: {
      app: 'bg-white text-slate-900',
      panel: 'bg-gray-50 border-gray-200 shadow-2xl',
      textMuted: 'text-gray-500 hover:text-gray-900',
      btnActive: 'bg-blue-600 text-white shadow-md scale-105',
      btnInactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300'
    },
    dark: {
      app: 'bg-slate-900 text-slate-100',
      panel: 'bg-slate-800 border-slate-700 shadow-2xl',
      textMuted: 'text-slate-400 hover:text-slate-100',
      btnActive: 'bg-accent-600 text-white shadow-md scale-105',
      btnInactive: 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
    },
    sepia: {
      app: 'bg-[#f4ecd8] text-[#5b4636]',
      panel: 'bg-[#eadaaf] border-[#d4c4a8] shadow-2xl',
      textMuted: 'text-[#8c735d] hover:text-[#433020]',
      btnActive: 'bg-[#8c735d] text-white shadow-md scale-105',
      btnInactive: 'bg-[#e5d8bc] text-[#5b4636] hover:bg-[#d4c4a8] border-[#d4c4a8]'
    },
    chatgpt: {
      app: 'bg-[#212121] text-[#ececf1]',
      panel: 'bg-[#2f2f3a] border-[#565869] shadow-2xl',
      textMuted: 'text-[#c5c5d2] hover:text-white',
      btnActive: 'bg-[#10a37f] text-white shadow-md scale-105',
      btnInactive: 'bg-[#343541] text-[#ececf1] hover:bg-[#444654] border-[#565869]'
    }
  }

  const activeTheme = themes[readMode]

  const getProseClass = () => {
    if (readMode === 'dark') return 'prose-invert'
    if (readMode === 'sepia') return 'prose-sepia'
    if (readMode === 'chatgpt') return 'prose-chatgpt'
    return ''
  }

  return (
    <div className={`relative min-h-screen overflow-x-hidden transition-colors duration-500 ${activeTheme.app} ${fontFamily} text-base md:text-lg`}>
      
      {/* Mobile Backdrop */}
      {(isSidebarOpen || isSettingsOpen) && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => { setSidebarOpen(false); setSettingsOpen(false) }} 
        />
      )}

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-500 ease-in-out ${isSidebarOpen && !isFocusMode ? 'md:pr-72' : ''}`}>
        <div className={`mx-auto px-4 py-12 transition-all duration-700 ease-in-out ${isFocusMode ? 'max-w-5xl py-16 md:py-24' : 'max-w-3xl'}`}>
          
          {/* Metadata & Distractions */}
          <div className={`transition-all duration-500 overflow-hidden ${isFocusMode ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
            {post.cover && (
              <img 
                src={post.cover} 
                className="w-full max-h-[400px] object-cover rounded-3xl mb-8 shadow-md" 
                alt="Cover" 
              />
            )}
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">{post.title}</h1>
            
            <div className={`flex items-center justify-between opacity-75 mb-6 border-b border-current/10 pb-4 font-medium text-sm md:text-base ${activeTheme.textMuted}`}>
              <Link to={`/u/${post.authorUsername}`} className="transition-colors font-bold">
                by {post.authorName}
              </Link>
              <span>{date}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {(post.tags || []).map((t) => (
                <Link key={t} to={`/search?tag=${t}`} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${activeTheme.btnInactive}`}>
                  #{t}
                </Link>
              ))}
            </div>
            
            <div className={`flex flex-wrap items-center gap-6 mb-10 font-medium opacity-80 text-sm ${activeTheme.textMuted}`}>
              <button onClick={handleLike} className={`flex items-center gap-2 hover:scale-105 transition-transform ${liked ? 'text-red-500' : ''}`}>
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} className={liked ? 'animate-pulse' : ''} /> 
                {post.likeCount || 0}
              </button>
              <span className="flex items-center gap-2"><Eye size={20} /> {post.views || 0} views</span>
              <button onClick={() => downloadMarkdown(post.title, post.content)} className="flex items-center gap-2 transition-colors">
                <Download size={20} /> .md
              </button>
              <button onClick={() => downloadPDF('post-content', post.title)} className="flex items-center gap-2 transition-colors">
                <FileDown size={20} /> .pdf
              </button>
            </div>
          </div>

          {isFocusMode && (
             <h1 className="text-4xl md:text-5xl font-extrabold mb-10 leading-tight tracking-tight text-center">{post.title}</h1>
          )}
          
          <div className={`prose-wrapper max-w-none transition-colors duration-500 ${getProseClass()}`}>
            <MarkdownRenderer id="post-content" content={post.content} />
          </div>

        </div>
      </div>

      {/* Slidable Right Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-72 border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${activeTheme.panel} ${isSidebarOpen && !isFocusMode ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 flex items-center justify-between border-b border-current/10">
          <h2 className="font-bold text-lg">Post Overview</h2>
          <button onClick={() => setSidebarOpen(false)} className={`rounded-full p-2 transition-colors ${activeTheme.btnInactive}`}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-70px)]">
          <h3 className={`text-xs font-bold mb-4 uppercase tracking-widest ${activeTheme.textMuted}`}>Table of Contents</h3>
          {tableOfContents.length > 0 ? (
            <ul className="space-y-3">
              {tableOfContents.map((item, index) => (
                <li 
                  key={index} 
                  style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                  className={`cursor-pointer transition-colors line-clamp-2 text-sm font-medium ${activeTheme.textMuted}`}
                  title={item.text}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-60 italic text-sm">No headings found.</p>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={`fixed bottom-6 z-40 flex flex-col gap-3 transition-all duration-300 ease-in-out ${isSidebarOpen && !isFocusMode ? 'right-6 md:right-[19.5rem]' : 'right-6'}`}>
        
        <div className={`absolute bottom-[100%] right-0 mb-4 p-5 rounded-2xl shadow-2xl border w-[280px] transition-all duration-200 origin-bottom-right ${activeTheme.panel} ${isSettingsOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${activeTheme.textMuted}`}>Reading Theme</h4>
          <div className="flex gap-2 mb-6">
            {[ 
              { mode: 'light', icon: Sun }, 
              { mode: 'dark', icon: Moon }, 
              { mode: 'sepia', icon: Coffee }, 
              { mode: 'chatgpt', icon: Bot }
            ].map(({ mode, icon: Icon }) => (
              <button 
                key={mode}
                onClick={() => setReadMode(mode)} 
                className={`flex-1 p-2.5 rounded-lg flex justify-center transition-all border ${readMode === mode ? activeTheme.btnActive : activeTheme.btnInactive}`} 
                title={mode.toUpperCase()}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${activeTheme.textMuted}`}>Typography</h4>
          <div className="flex gap-2 mb-6">
            {[
              { style: 'font-sans', label: 'Sans' },
              { style: 'font-serif', label: 'Serif' },
              { style: 'font-mono', label: 'Mono' }
            ].map(({ style, label }) => (
              <button 
                key={style}
                onClick={() => setFontFamily(style)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${style} ${fontFamily === style ? activeTheme.btnActive : activeTheme.btnInactive}`}
              >
                {label}
              </button>
            ))}
          </div>

          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${activeTheme.textMuted}`}>Experience</h4>
          <button 
            onClick={toggleFocusMode}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all border ${isFocusMode ? activeTheme.btnActive : activeTheme.btnInactive} hover:!bg-accent-500 hover:!text-white hover:!border-accent-500`}
          >
            {isFocusMode ? (
              <><Minimize size={16} /> Exit Focus Mode</>
            ) : (
              <><Maximize size={16} /> Enter Focus Mode</>
            )}
          </button>
        </div>

        <button 
          onClick={scrollToTop} 
          className={`p-3 rounded-full shadow-lg border transition-all hover:scale-105 focus:outline-none ${activeTheme.btnInactive}`} 
          title="Scroll to Top"
        >
          <ArrowUp size={22} />
        </button>

        {!isFocusMode && (
          <button 
            onClick={toggleSidebar} 
            className={`p-3 rounded-full shadow-lg border transition-all hover:scale-105 focus:outline-none ${isSidebarOpen ? activeTheme.btnActive : activeTheme.btnInactive}`}
            title="Toggle Table of Contents"
          >
            <List size={22} />
          </button>
        )}
        
        <button 
          onClick={toggleSettings} 
          className={`p-3 rounded-full shadow-lg border transition-all hover:scale-105 focus:outline-none ${isSettingsOpen ? activeTheme.btnActive : activeTheme.btnInactive}`}
          title="Reading Settings"
        >
          <Settings size={22} className={isSettingsOpen ? 'animate-spin-slow' : ''} />
        </button>

        <button 
          onClick={scrollToBottom} 
          className={`p-3 rounded-full shadow-lg border transition-all hover:scale-105 focus:outline-none ${activeTheme.btnInactive}`} 
          title="Scroll to Bottom"
        >
          <ArrowDown size={22} />
        </button>

      </div>
    </div>
  )
}