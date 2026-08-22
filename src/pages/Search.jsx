import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, Heart, Eye } from 'lucide-react';
import { format } from 'date-fns';

import {
  InstantSearch,
  SearchBox,
  Configure,
  Highlight,
  useSearchBox,
  useHits,
  useInstantSearch
} from 'react-instantsearch';
import { searchClient, INDEX_NAME } from '../lib/algolia.js';
import { searchPosts } from '../lib/posts.js';

// Custom SearchBox to match the app's styling
function CustomSearchBox(props) {
  const { query, refine } = useSearchBox(props);
  
  return (
    <form 
      noValidate 
      action="" 
      role="search" 
      className="flex gap-2 mb-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex-1 flex items-center bg-base-900 border border-base-800 rounded-lg px-3 focus-within:border-accent-500 transition-colors">
        <SearchIcon size={16} className="text-base-300" />
        <input
          type="search"
          value={query}
          onChange={(event) => refine(event.currentTarget.value)}
          placeholder="Search posts, tags, or authors…"
          className="w-full bg-transparent px-3 py-3 outline-none text-base-100 placeholder-base-500"
        />
        {query && (
          <button 
            type="button" 
            onClick={() => refine('')}
            className="text-base-400 hover:text-base-200"
          >
            ×
          </button>
        )}
      </div>
      <button 
        type="submit" 
        className="bg-accent-600 hover:bg-accent-700 px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Search
      </button>
    </form>
  );
}

function Hit({ hit }) {
  const navigate = useNavigate();
  
  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/post/${hit.objectID || hit.id}`);
  };

  const date = hit.createdAt 
    ? (typeof hit.createdAt === 'number' ? format(new Date(hit.createdAt), 'MMM d, yyyy') : 
      hit.createdAt.seconds ? format(new Date(hit.createdAt.seconds * 1000), 'MMM d, yyyy') : '') 
    : '';

  return (
    <div 
      onClick={handleCardClick} 
      className="cursor-pointer block bg-base-900 border border-base-800 rounded-xl overflow-hidden hover:border-accent-500 transition-colors relative h-full flex flex-col"
    >
      {hit.cover && <img src={hit.cover} className="w-full h-40 object-cover" alt="Post cover" />}
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-lg leading-snug line-clamp-2">
            {hit._highlightResult ? (
              <Highlight attribute="title" hit={hit} classNames={{ highlighted: 'ais-Highlight-highlighted' }} />
            ) : (
              hit.title
            )}
          </h3>
        </div>

        <p className="text-sm text-base-300 mt-1 line-clamp-2 flex-grow">
          {hit._highlightResult ? (
            <Highlight attribute="content" hit={hit} classNames={{ highlighted: 'ais-Highlight-highlighted' }} />
          ) : (
            hit.content
          )}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {(hit.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] bg-accent-600/20 text-accent-500 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-base-300 pt-3 border-t border-base-800/50">
          <Link to={`/u/${hit.authorUsername || hit.authorId}`} className="hover:text-accent-500 relative z-10 font-medium">
             {hit._highlightResult ? (
               <Highlight attribute="authorName" hit={hit} classNames={{ highlighted: 'ais-Highlight-highlighted' }} />
             ) : (
               hit.authorName
             )}
          </Link>
          <span>{date}</span>
        </div>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-base-300">
          <span className="flex items-center gap-1"><Heart size={12} /> {hit.likeCount || 0}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {hit.views || 0}</span>
        </div>
      </div>
    </div>
  );
}

function FallbackHits({ tag }) {
  const { hits } = useHits();
  const { query } = useSearchBox();
  const { status } = useInstantSearch();
  const [fallbackResults, setFallbackResults] = useState([]);
  const [loadingFallback, setLoadingFallback] = useState(false);

  useEffect(() => {
    let active = true;
    
    // If Algolia yields no hits but we have a query, query Firestore.
    if (hits.length === 0 && (query.length > 0 || tag) && status === 'idle') {
      setLoadingFallback(true);
      searchPosts({ term: query, tag }).then((res) => {
        if (active) {
          setFallbackResults(res);
          setLoadingFallback(false);
        }
      });
    } else {
      setFallbackResults([]);
    }
    
    return () => { active = false; };
  }, [hits.length, query, tag, status]);

  if (status === 'loading' || status === 'stalled') {
    return <div className="text-center text-base-400 mt-10 animate-pulse">Searching...</div>;
  }

  if (hits.length > 0) {
    return (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {hits.map(hit => <Hit key={hit.objectID} hit={hit} />)}
      </div>
    );
  }

  if (loadingFallback) {
    return <div className="text-center text-base-400 mt-10 animate-pulse">Searching deep content...</div>;
  }

  if (fallbackResults.length > 0) {
    return (
      <>
        <div className="mb-4 text-amber-500 text-sm p-3 bg-amber-500/10 rounded-lg">
          No matches in titles/tags. Showing deep content matches from NoteSphere Advanced Search:
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {fallbackResults.map(post => <Hit key={post.id} hit={post} />)}
        </div>
      </>
    );
  }

  if ((query.length > 0 || tag) && hits.length === 0 && fallbackResults.length === 0) {
    return <div className="text-center text-base-400 mt-10">No results found.</div>;
  }

  // If no query and no hits, maybe just show initial state
  return null;
}

export default function Search() {
  const [params] = useSearchParams();
  const initialQuery = params.get('q') || '';
  const tag = params.get('tag') || '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <InstantSearch searchClient={searchClient} indexName={INDEX_NAME}>
        <Configure query={initialQuery} filters={tag ? `tags:"${tag}"` : ''} />
        
        <CustomSearchBox />
        
        {tag && <p className="text-base-300 mb-4">Showing posts tagged <span className="text-accent-500">#{tag}</span></p>}
        
        <FallbackHits tag={tag} />
      </InstantSearch>
    </div>
  );
}
