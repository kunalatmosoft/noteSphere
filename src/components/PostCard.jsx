import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, Bookmark, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { savePostToLibrary } from '../lib/library'; // Adjust path if needed

export default function PostCard({ post, userLibraries = [], activeLibraryId = null, onRemove }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedTo, setSavedTo] = useState(null);
  
  const date = post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : '';

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/post/${post.id}`);
  };

  const handleSave = async (e, libraryId) => {
    e.stopPropagation(); 
    await savePostToLibrary(libraryId, post);
    setSavedTo(libraryId);
    setTimeout(() => setShowDropdown(false), 1000);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="cursor-pointer block bg-base-900 border border-base-800 rounded-xl overflow-hidden hover:border-accent-500 transition-colors relative h-full flex flex-col"
    >
      {post.cover && <img src={post.cover} className="w-full h-40 object-cover" alt="Post cover" />}
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-lg leading-snug line-clamp-2">{post.title}</h3>
          
          <div className="relative z-10 flex-shrink-0">
            {/* Condition 1: We are inside a custom library -> Show Remove Button */}
            {activeLibraryId ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(post.id); }}
                className="p-1.5 text-base-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                title="Remove from library"
              >
                <Trash2 size={18} />
              </button>
            ) 
            
            /* Condition 2: We are in Global Feed AND user has libraries -> Show Save Dropdown */
            : userLibraries?.length > 0 ? (
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="p-1.5 text-base-400 hover:text-accent-500 rounded-md hover:bg-base-800 transition-colors"
                  title="Save to Library"
                >
                  <Bookmark size={18} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-base-900 border border-base-700 rounded-lg shadow-xl overflow-hidden py-1 z-20">
                    <div className="px-3 py-2 text-xs font-semibold text-base-500 uppercase tracking-wider border-b border-base-800">
                      Save to...
                    </div>
                    {userLibraries.map(lib => (
                      <button
                        key={lib.id}
                        onClick={(e) => handleSave(e, lib.id)}
                        className="w-full text-left px-4 py-2 text-sm text-base-300 hover:bg-base-800 hover:text-white flex items-center justify-between"
                      >
                        <span className="truncate">{lib.name}</span>
                        {savedTo === lib.id && <Check size={14} className="text-accent-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-sm text-base-300 mt-1 line-clamp-2 flex-grow">
          {(post.content || '').replace(/[#*`$>_-]/g, '').slice(0, 140)}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {(post.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] bg-accent-600/20 text-accent-500 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-base-300 pt-3 border-t border-base-800/50">
          <Link to={`/u/${post.authorUsername}`} className="hover:text-accent-500 relative z-10 font-medium">
            {post.authorName}
          </Link>
          <span>{date}</span>
        </div>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-base-300">
          <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount || 0}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views || 0}</span>
        </div>
      </div>
    </div>
  );
}