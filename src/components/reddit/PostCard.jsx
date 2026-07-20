import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { handleVote, editRedditPost, deleteRedditPost } from '../../lib/reddit';

export function PostCard({ post, currentUser }) {
  const [score, setScore] = useState(post.score || 0);
  const [userVote, setUserVote] = useState(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = currentUser?.uid === post.authorId;

  useEffect(() => {
    if (currentUser) {
      if (post.upvotes?.includes(currentUser.uid)) setUserVote('up');
      else if (post.downvotes?.includes(currentUser.uid)) setUserVote('down');
      else setUserVote(null);
    } else {
      setUserVote(null);
    }
    setScore(post.score || 0);
  }, [currentUser, post]);

  const onVote = async (type) => {
    if (!currentUser) return alert("Please log in to vote!");

    let newScore = score;
    let newVote = type;

    if (type === 'up') {
      if (userVote === 'up') {
        newScore -= 1; newVote = null;
      } else {
        newScore += userVote === 'down' ? 2 : 1;
      }
    } else {
      if (userVote === 'down') {
        newScore += 1; newVote = null;
      } else {
        newScore -= userVote === 'up' ? 2 : 1;
      }
    }

    setScore(newScore);
    setUserVote(newVote);
    await handleVote(post.id, currentUser.uid, type === 'up' ? 'upvote' : 'downvote');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    await editRedditPost(post.id, editTitle, editContent);
    post.title = editTitle; // Optimistic update
    post.content = editContent; // Optimistic update
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deleteRedditPost(post.id);
      window.location.reload(); // Refresh to remove it from feed
    }
  };

  return (
    <div className="flex bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors shadow-sm">
      <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 w-12 shrink-0">
        <button onClick={() => onVote('up')} className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${userVote === 'up' ? 'text-orange-500' : 'text-zinc-500'}`}>
          <ArrowBigUp size={24} fill={userVote === 'up' ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-sm font-bold my-1 ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
          {score}
        </span>
        <button onClick={() => onVote('down')} className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${userVote === 'down' ? 'text-blue-500' : 'text-zinc-500'}`}>
          <ArrowBigDown size={24} fill={userVote === 'down' ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="text-xs text-zinc-500 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {post.communityName && <span className="font-bold text-zinc-900 dark:text-zinc-100">r/{post.communityName}</span>}
            <span>•</span>
            <span>Posted by u/{post.authorUsername}</span>
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(!isEditing)} className="text-zinc-400 hover:text-blue-500 transition p-1">
                <Edit2 size={14} />
              </button>
              <button onClick={handleDelete} className="text-zinc-400 hover:text-red-500 transition p-1">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 mb-4">
            <input 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
            />
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-full text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-900 dark:text-white">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to={`/r/post/${post.id}`} className="block text-lg font-semibold text-zinc-900 dark:text-white mb-2 hover:underline">
              {post.title}
            </Link>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 whitespace-pre-wrap">{post.content}</p>
          </>
        )}

        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 mt-2">
          <Link to={`/r/post/${post.id}`} className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded transition">
            <MessageSquare size={16} />
            {post.commentCount || 0} Comments
          </Link>
        </div>
      </div>
    </div>
  );
}