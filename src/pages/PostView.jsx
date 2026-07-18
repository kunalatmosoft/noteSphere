import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, incrementView, toggleLike } from '../lib/posts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Heart, Eye, Download, FileDown } from 'lucide-react'
import { format } from 'date-fns'

export default function PostView() {
  const { postId } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    (async () => {
      const p = await getPost(postId)
      setPost(p)
      if (p) {
        incrementView(postId)
        setLiked(user ? (p.likes || []).includes(user.uid) : false)
      }
    })()
  }, [postId])

  async function handleLike() {
    if (!user || !post) return
    await toggleLike(post.id, user.uid, liked)
    setLiked(!liked)
    setPost((prev) => ({ ...prev, likeCount: (prev.likeCount || 0) + (liked ? -1 : 1) }))
  }

  if (!post) return <p className="text-center mt-10 text-base-300">Loading…</p>

  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {post.cover && <img src={post.cover} className="w-full max-h-80 object-cover rounded-2xl mb-6" />}
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
  )
}
