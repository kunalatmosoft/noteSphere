import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, incrementView, toggleLike } from '../lib/posts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Heart, Eye, Download, FileDown, ArrowUp, ArrowDown, List, X } from 'lucide-react'
import { format } from 'date-fns'

export default function PostView() {
  const { postId } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [liked, setLiked] = useState(false)
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tableOfContents, setTableOfContents] = useState([])

  useEffect(() => {
    (async () => {
      const p = await getPost(postId)
      setPost(p)
      if (p) {
        incrementView(postId)
        setLiked(user ? (p.likes || []).includes(user.uid) : false)
        
        // Parse markdown headings for the sidebar overview
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
  }, [postId, user])

  async function handleLike() {
    if (!user || !post) return
    await toggleLike(post.id, user.uid, liked)
    setLiked(!liked)
    setPost((prev) => ({ ...prev, likeCount: (prev.likeCount || 0) + (liked ? -1 : 1) }))
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  if (!post) return <p className="text-center mt-10 text-base-300">Loading…</p>

  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      
      {/* Mobile Backdrop (Closes sidebar when clicking outside on small screens) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Main Content Wrapper - Shrinks/Shifts to prevent being hidden by sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pr-72' : ''}`}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {post.cover && <img src={post.cover} className="w-full max-h-80 object-cover rounded-2xl mb-6" alt="Cover" />}
          
          <h1 className="text-3xl font-extrabold mb-2">{post.title}</h1>
          
          <div className="flex items-center justify-between text-sm text-base-300 mb-4">
            <Link to={`/u/${post.authorUsername}`} className="hover:text-accent-500">by {post.authorName}</Link>
            <span>{date}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {(post.tags || []).map((t) => (
              <Link key={t} to={`/search?tag=${t}`} className="text-xs bg-accent-600/20 text-accent-500 px-2 py-0.5 rounded-full">#{t}</Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-sm text-base-300">
            <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-red-400' : ''}`}>
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {post.likeCount || 0}
            </button>
            <span className="flex items-center gap-1"><Eye size={16} /> {post.views || 0}</span>
            <button onClick={() => downloadMarkdown(post.title, post.content)} className="flex items-center gap-1 hover:text-base-100">
              <Download size={16} /> .md
            </button>
            <button onClick={() => downloadPDF('post-content', post.title)} className="flex items-center gap-1 hover:text-base-100">
              <FileDown size={16} /> .pdf
            </button>
          </div>
          
          <MarkdownRenderer id="post-content" content={post.content} />
        </div>
      </div>

      {/* Slidable Right Sidebar (Table of Contents) */}
      <div 
        className={`fixed right-0 top-0 h-full w-72 bg-base-900 border-l border-base-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-base-800">
          <h2 className="font-bold text-lg text-base-100">Post Overview</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-base-400 hover:text-red-400 transition-colors bg-base-800 rounded p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-70px)]">
          <h3 className="text-sm font-semibold text-base-300 mb-4 uppercase tracking-wider">Table of Contents</h3>
          {tableOfContents.length > 0 ? (
            <ul className="space-y-3">
              {tableOfContents.map((item, index) => (
                <li 
                  key={index} 
                  style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                  className="text-sm text-base-400 hover:text-accent-400 cursor-pointer transition-colors line-clamp-2"
                  title={item.text}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-base-500 italic">No headings found in this post.</p>
          )}
        </div>
      </div>

      {/* Floating Action Buttons (Bottom Right) */}
      <div 
        className={`fixed bottom-6 z-40 flex flex-col gap-3 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'right-6 md:right-[19.5rem]' : 'right-6'}`}
      >
        <button 
          onClick={scrollToTop} 
          className="p-3 bg-base-800 text-base-300 hover:text-base-100 hover:bg-base-700 rounded-full shadow-lg border border-base-700 transition-all focus:outline-none focus:ring-2 focus:ring-accent-500" 
          title="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
        <button 
          onClick={scrollToBottom} 
          className="p-3 bg-base-800 text-base-300 hover:text-base-100 hover:bg-base-700 rounded-full shadow-lg border border-base-700 transition-all focus:outline-none focus:ring-2 focus:ring-accent-500" 
          title="Scroll to Bottom"
        >
          <ArrowDown size={20} />
        </button>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className={`p-3 rounded-full shadow-lg border transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 ${isSidebarOpen ? 'bg-accent-600 text-white border-accent-500 hover:bg-accent-700' : 'bg-base-800 text-base-300 hover:text-base-100 hover:bg-base-700 border-base-700'}`}
          title="Toggle Table of Contents"
        >
          <List size={20} />
        </button>
      </div>

    </div>
  )
}