import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase'; // Your existing config[cite: 2]
import { PostCard } from '../components/reddit/PostCard';
import { CommentSection } from '../components/reddit/CommentTree';

export default function PostDetailsPage() {
  const { postId } = useParams(); // URL params e.g., /post/:postId
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Authenticate user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          username: user.email?.split('@')[0] || 'user',
          photoURL: user.photoURL
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch the specific post
  useEffect(() => {
    async function loadPost() {
      try {
        const docRef = doc(db, 'reddit_posts', postId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() });
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex justify-center pt-20 text-zinc-500">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center pt-20 text-zinc-500">
        <p className="mb-4">Post not found.</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-2xl mx-auto mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4 inline-block transition"
        >
          &larr; Back to feed
        </button>
        
        {/* Render the post itself */}
        <PostCard post={post} currentUser={currentUser} />
      </div>

      {/* Render the nested comment tree */}
      <CommentSection postId={postId} currentUser={currentUser} />
    </div>
  );
}