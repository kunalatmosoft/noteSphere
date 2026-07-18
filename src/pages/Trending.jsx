import React, { useEffect, useState } from 'react'
import { getTrending } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'

export default function Trending() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setPosts(await getTrending(7, 30))
      setLoading(false)
    })()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Trending posts</h1>
      {loading ? <p className="text-base-300">Loading…</p> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  )
}
