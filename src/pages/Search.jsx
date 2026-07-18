import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchPosts } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { Search as SearchIcon } from 'lucide-react'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') || '')
  const tag = params.get('tag') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { runSearch() }, [tag])

  async function runSearch(e) {
    e?.preventDefault()
    setLoading(true)
    setParams(term ? { q: term } : (tag ? { tag } : {}))
    const res = await searchPosts({ term, tag })
    setResults(res)
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <form onSubmit={runSearch} className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center bg-base-900 border border-base-800 rounded-lg px-3">
          <SearchIcon size={16} className="text-base-300" />
          <input
            value={term} onChange={(e) => setTerm(e.target.value)}
            placeholder="Search posts, tags, or authors…"
            className="w-full bg-transparent px-2 py-2 outline-none"
          />
        </div>
        <button className="bg-accent-600 hover:bg-accent-700 px-4 rounded-lg font-medium">Search</button>
      </form>
      {tag && <p className="text-base-300 mb-4">Showing posts tagged <span className="text-accent-500">#{tag}</span></p>}
      {loading ? <p className="text-base-300">Searching…</p> : (
        results.length === 0 ? <p className="text-base-300">No results found.</p> : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )
      )}
    </div>
  )
}
