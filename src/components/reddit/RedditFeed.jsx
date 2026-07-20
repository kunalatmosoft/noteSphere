import React, { useEffect, useState } from 'react';
import { getRedditFeed } from '../../lib/reddit';
import { PostCard } from './PostCard';
import { Flame, Clock } from 'lucide-react';

export function RedditFeed({ communityId, currentUser, searchQuery = '' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('hot');

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const feed = await getRedditFeed({ communityId, sort });
        setPosts(feed);
      } catch (error) {
        console.error("Error loading feed:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [communityId, sort]);

  // Client-side search filter
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (post.title && post.title.toLowerCase().includes(lowerQuery)) ||
      (post.content && post.content.toLowerCase().includes(lowerQuery)) ||
      (post.communityName && post.communityName.toLowerCase().includes(lowerQuery)) ||
      (post.authorUsername && post.authorUsername.toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
      {/* Aesthetic Feed Filters */}
      <div className="flex gap-2 mb-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-fit shadow-sm">
        <button 
          onClick={() => setSort('hot')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
            sort === 'hot' 
              ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' 
              : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-950'
          }`}
        >
          <Flame size={16} /> Hot
        </button>
        <button 
          onClick={() => setSort('new')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
            sort === 'new' 
              ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' 
              : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-950'
          }`}
        >
          <Clock size={16} /> New
        </button>
      </div>

      {/* Post List */}
      {loading ? (
        <div className="text-center p-12 text-zinc-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Loading feed...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4">
          <p className="text-zinc-500 font-medium">
            {searchQuery ? `No results found for "${searchQuery}"` : "No posts found. Be the first to post!"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}