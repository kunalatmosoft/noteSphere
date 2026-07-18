import React, { useEffect, useState } from 'react'
import { getFeed, getTrending, getAllTags } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { recommendUsers } from '../lib/social.js'

export default function PublicFeed() {
  const { profile } = useAuth()
  const [sort, setSort] = useState('recent')
  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [tags, setTags] = useState([])
  const [recUsers, setRecUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const [feed, trend, tagList] = await Promise.all([getFeed({ sort }), getTrending(), getAllTags()])
      setPosts(feed); setTrending(trend); setTags(tagList)
      if (profile) setRecUsers(await recommendUsers(profile.uid, profile.following || []))
      setLoading(false)
    })()
  }, [sort])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Public Blogs</h1>
          <div className="flex bg-base-900 rounded-lg p-0.5 text-sm">
            <button onClick={() => setSort('recent')} className={`px-3 py-1 rounded-md ${sort === 'recent' ? 'bg-base-800' : ''}`}>Recent</button>
            <button onClick={() => setSort('trending')} className={`px-3 py-1 rounded-md ${sort === 'trending' ? 'bg-base-800' : ''}`}>Top</button>
          </div>
        </div>
        {loading ? (
          <p className="text-base-300">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-base-300">No published posts yet. Publish a note to see it here!</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="bg-base-900 border border-base-800 rounded-xl p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-accent-500" /> Trending now</h3>
          <ol className="space-y-2">
            {trending.slice(0, 6).map((p, i) => (
              <li key={p.id} className="text-sm">
                <Link to={`/post/${p.id}`} className="flex gap-2 hover:text-accent-500">
                  <span className="text-base-300 w-4">{i + 1}</span>
                  <span className="line-clamp-1">{p.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-base-900 border border-base-800 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Popular tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map(([tag, count]) => (
              <Link key={tag} to={`/search?tag=${tag}`} className="text-xs bg-base-800 hover:bg-accent-600/30 hover:text-accent-500 px-2 py-1 rounded-full">
                #{tag} <span className="text-base-300">{count}</span>
              </Link>
            ))}
          </div>
        </div>

        {profile && recUsers.length > 0 && (
          <div className="bg-base-900 border border-base-800 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Suggested authors</h3>
            <div className="space-y-3">
              {recUsers.map((u) => (
                <Link key={u.uid} to={`/u/${u.username}`} className="flex items-center gap-2 text-sm hover:text-accent-500">
                  {u.photoURL ? <img src={u.photoURL} className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 rounded-full bg-base-800" />}
                  <div className="flex-1">
                    <p>{u.displayName}</p>
                    <p className="text-xs text-base-300">{u.followers?.length || 0} followers</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
