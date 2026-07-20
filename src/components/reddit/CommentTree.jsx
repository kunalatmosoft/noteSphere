// src/components/reddit/CommentTree.jsx
import React, { useState, useEffect } from 'react';
import { 
  getPostCommentsTree, 
  addComment, 
  handleCommentVote, 
  editComment, 
  deleteComment 
} from '../../lib/reddit';
import { ArrowBigUp, ArrowBigDown, Edit2, Trash2 } from 'lucide-react';

function CommentNode({ comment, currentUser, postId, depth = 0 }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  // Vote State
  const [score, setScore] = useState(comment.score || 0);
  const [userVote, setUserVote] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // Authorization check
  const isOwner = currentUser?.uid === comment.authorId;

  useEffect(() => {
    if (currentUser) {
      if (comment.upvotes?.includes(currentUser.uid)) setUserVote('up');
      else if (comment.downvotes?.includes(currentUser.uid)) setUserVote('down');
      else setUserVote(null);
    }
    setScore(comment.score || 0);
  }, [currentUser, comment]);

  const onVote = async (type) => {
    if (!currentUser) return;
    let newScore = score;
    let newVote = type;

    if (type === 'up') {
      if (userVote === 'up') { newScore -= 1; newVote = null; } 
      else { newScore += userVote === 'down' ? 2 : 1; }
    } else {
      if (userVote === 'down') { newScore += 1; newVote = null; } 
      else { newScore -= userVote === 'up' ? 2 : 1; }
    }

    setScore(newScore);
    setUserVote(newVote);
    await handleCommentVote(comment.id, currentUser.uid, type === 'up' ? 'upvote' : 'downvote');
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    await addComment({
      postId,
      parentId: comment.id,
      content: replyContent,
      author: currentUser
    });
    setIsReplying(false);
    setReplyContent('');
    window.location.reload(); // Simple reload to show new nested reply
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await editComment(comment.id, editContent);
    comment.content = editContent; // Optimistic update
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(comment.id);
      window.location.reload(); // Refresh to remove it from the tree
    }
  };

  return (
    <div className={`flex flex-col mt-4 ${depth > 0 ? 'ml-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800' : ''}`}>
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden">
           {comment.authorPhoto ? <img src={comment.authorPhoto} alt="avatar" className="w-full h-full object-cover" /> : null}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{comment.authorUsername}</span>
              <span className="text-zinc-500">•</span>
              <span className={`font-bold ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-zinc-500'}`}>
                {score} points
              </span>
            </div>

            {/* Owner Controls: Edit & Delete */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(!isEditing)} className="text-zinc-400 hover:text-blue-500 transition p-1">
                  <Edit2 size={12} />
                </button>
                <button onClick={handleDelete} className="text-zinc-400 hover:text-red-500 transition p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
          
          {/* Conditional Rendering: Edit Mode vs View Mode */}
          {isEditing ? (
            <div className="flex flex-col gap-2 mb-2 mt-2">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                rows={2}
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
            <p className="text-sm text-zinc-800 dark:text-zinc-200 mb-2 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <button onClick={() => onVote('up')} className={`transition flex items-center gap-1 ${userVote === 'up' ? 'text-orange-500' : 'hover:text-zinc-900 dark:hover:text-white'}`}>
              <ArrowBigUp size={16} fill={userVote === 'up' ? 'currentColor' : 'none'} /> Upvote
            </button>
            <button onClick={() => onVote('down')} className={`transition flex items-center gap-1 ${userVote === 'down' ? 'text-blue-500' : 'hover:text-zinc-900 dark:hover:text-white'}`}>
              <ArrowBigDown size={16} fill={userVote === 'down' ? 'currentColor' : 'none'} /> Downvote
            </button>
            <button onClick={() => setIsReplying(!isReplying)} className="hover:text-zinc-900 dark:hover:text-white transition font-medium">
              Reply
            </button>
          </div>

          {isReplying && (
            <div className="mt-3 flex flex-col gap-2">
              <textarea 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                placeholder="What are your thoughts?"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsReplying(false)} className="px-3 py-1.5 rounded-full text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-900 dark:text-white">
                  Cancel
                </button>
                <button onClick={handleReplySubmit} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
                  Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} currentUser={currentUser} postId={postId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, currentUser }) {
  const [commentsTree, setCommentsTree] = useState([]);
  const [newComment, setNewComment] = useState(''); // State for new top-level comment

  // Function to load/reload comments
  const loadComments = async () => {
    const tree = await getPostCommentsTree(postId);
    setCommentsTree(tree);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  // Handler for top-level comments
  const handleAddTopLevelComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    
    await addComment({
      postId,
      parentId: null, // null means it attaches directly to the post, not another comment
      content: newComment,
      author: currentUser
    });
    
    setNewComment('');
    await loadComments(); // Reload to show the new comment
  };

  return (
    <div className="max-w-2xl mx-auto w-full mt-6 bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-zinc-100">Comments</h3>
      
      {/* Top-Level Comment Input Box */}
      {currentUser ? (
        <div className="mb-8 flex flex-col gap-2">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
            placeholder="Add a comment..."
            rows={3}
          />
          <div className="flex justify-end">
            <button 
              onClick={handleAddTopLevelComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-md text-sm text-zinc-500 text-center">
          Log in to leave a comment.
        </div>
      )}
      
      {/* Render top level roots */}
      {commentsTree.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-4">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        commentsTree.map(rootComment => (
          <CommentNode 
            key={rootComment.id} 
            comment={rootComment} 
            currentUser={currentUser}
            postId={postId} 
            depth={0} 
          />
        ))
      )}
    </div>
  );
}