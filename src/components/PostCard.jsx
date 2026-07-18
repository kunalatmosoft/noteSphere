import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function PostCard({ post }) {
  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : ''
  return (
    <Link to={`/post/${post.id}`} className="block bg-base-900 border border-base-800 rounded-xl overflow-hidden hover:border-accent-500 transition-colors">
      {post.cover && <img src={post.cover} className="w-full h-40 object-cover" />}
      <div className="p-4">
        <h3 className="font-bold text-lg leading-snug line-clamp-2">{post.title}</h3>
        <p className="text-sm text-base-300 mt-1 line-clamp-2">{(post.content || '').replace(/[#*`$>_-]/g, '').slice(0, 140)}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {(post.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] bg-accent-600/20 text-accent-500 px-2 py-0.5 rounded-full">#{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-base-300">
          <Link to={`/u/${post.authorUsername}`} className="hover:text-accent-500">{post.authorName}</Link>
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-base-300">
          <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount || 0}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views || 0}</span>
        </div>
      </div>
    </Link>
  )
}
