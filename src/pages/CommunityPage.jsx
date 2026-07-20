import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase'; 
import { RedditFeed } from '../components/reddit/RedditFeed';
import { createRedditPost } from '../lib/reddit';
import { Search, Globe, User, X } from 'lucide-react'; // Removed unused icons

export default function CommunityPage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Post Creation State
  const [isPosting, setIsPosting] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCommunity, setNewPostCommunity] = useState(communityId || '');
  
  // Search & Refresh State
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Added to smoothly reload the feed

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

  useEffect(() => {
    setNewPostCommunity(communityId || '');
  }, [communityId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const finalCommunity = newPostCommunity.trim() || 'general';
    
    if (!currentUser || !newPostTitle.trim()) return;

    try {
      // Wait for Firebase to finish creating the post
      await createRedditPost({
        communityId: finalCommunity.toLowerCase(),
        communityName: finalCommunity.toLowerCase(),
        title: newPostTitle,
        content: newPostContent,
        author: currentUser,
      });

      // Clear the form
      setNewPostTitle('');
      setNewPostContent('');
      setIsPosting(false);
      
      // Navigate or smoothly refresh the feed
      if (!communityId || communityId.toLowerCase() !== finalCommunity.toLowerCase()) {
        navigate(`/r/${finalCommunity.toLowerCase()}`);
      } else {
        // This forces the RedditFeed component to remount and fetch the new post without a hard reload
        setRefreshKey(prev => prev + 1); 
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200/50 dark:bg-[#030303] py-6 px-4">
      <div className="max-w-[960px] mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Main Content Column */}
        <div className="flex-1 w-full max-w-2xl mx-auto md:mx-0">
          
          {/* Reddit-Style Community Header */}
          {communityId ? (
            <div className="bg-white dark:bg-[#1A1A1B] rounded-md overflow-hidden mb-4 border border-zinc-300 dark:border-zinc-800 shadow-sm">
              <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
              <div className="px-4 sm:px-6 pb-4 relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-[#1A1A1B] rounded-full border-4 border-white dark:border-[#1A1A1B] flex items-center justify-center -mt-8 sm:-mt-10 mb-2 overflow-hidden shadow-sm">
                  <Globe size={40} className="text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  r/{communityId}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  r/{communityId} • Community updates and discussions.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Home</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your personalized front page.</p>
            </div>
          )}

          {/* Quick Post Trigger Bar (Reddit Style) */}
          {!isPosting && currentUser && (
            <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1B] p-2.5 rounded-md border border-zinc-300 dark:border-zinc-800 mb-4 shadow-sm">
              <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-zinc-400" />
                )}
              </div>
              <input 
                type="text" 
                placeholder="Create Post" 
                onClick={() => setIsPosting(true)}
                readOnly
                className="flex-1 bg-zinc-100 dark:bg-[#272729] border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-[#1A1A1B] hover:border-blue-500 dark:hover:border-zinc-500 rounded-md py-2 px-4 cursor-text transition-colors text-sm text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>
          )}

          {/* Expanded Post Creator Form */}
          {isPosting && (
            <div className="bg-white dark:bg-[#1A1A1B] rounded-md border border-zinc-300 dark:border-zinc-800 mb-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Create a post</h2>
                <button onClick={() => setIsPosting(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-4 flex flex-col gap-4">
                
                {/* Community Selector */}
                {!communityId && (
                  <div className="w-full sm:w-64 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text"
                      placeholder="Choose a community"
                      value={newPostCommunity}
                      onChange={(e) => setNewPostCommunity(e.target.value.replace(/\s+/g, ''))}
                      className="w-full bg-white dark:bg-[#1A1A1B] border border-zinc-300 dark:border-zinc-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-white"
                      required
                    />
                  </div>
                )}

                <input 
                  type="text"
                  placeholder="Title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md p-2.5 text-sm font-medium focus:border-zinc-900 dark:focus:border-zinc-100 outline-none text-zinc-900 dark:text-zinc-100 transition-colors mt-2"
                  required
                />
                
                <textarea 
                  placeholder="Text (optional)"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-md p-3 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 outline-none text-zinc-900 dark:text-zinc-100 resize-y min-h-[140px] transition-colors"
                />
                
                <div className="flex justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                  <button 
                    type="submit" 
                    disabled={!newPostTitle.trim() || (!communityId && !newPostCommunity.trim())}
                    className="px-6 py-1.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* The Feed Component - Added refreshKey to force component to reload smoothly */}
          <RedditFeed key={refreshKey} communityId={communityId} currentUser={currentUser} searchQuery={searchQuery} />
        </div>

        {/* Right Sidebar (Reddit Style Desktop Sidebar) */}
        <div className="hidden md:block w-[312px] shrink-0">
          
          {/* Global Search integrated into the Sidebar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${communityId ? `r/${communityId}` : 'NotesPhere'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#272729] border border-transparent hover:border-blue-500 rounded-full py-2 pl-10 pr-4 text-sm focus:bg-white dark:focus:bg-[#1A1A1B] focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 transition-colors shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-[#1A1A1B] rounded-md border border-zinc-300 dark:border-zinc-800 shadow-sm p-3">
            <div className="flex flex-col gap-2">
              <div className="h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-sm -mx-3 -mt-3 mb-2 relative"></div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                {communityId ? `About r/${communityId}` : 'Home'}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                {communityId 
                  ? `Welcome to r/${communityId}. Check the rules, share your thoughts, and connect with the community.` 
                  : 'Your personal NotesPhere frontpage. Come here to check in with your favorite communities.'}
              </p>
              
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                {!isPosting && (
                   <button 
                     onClick={() => setIsPosting(true)}
                     className="w-full py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition"
                   >
                     Create Post
                   </button>
                )}
                {communityId && (
                   <button className="w-full py-2 mt-2 bg-transparent text-blue-600 border border-blue-600 rounded-full text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                     Join Community
                   </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer links placeholder */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500 px-2">
            <span className="hover:underline cursor-pointer">User Agreement</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Content Policy</span>
            <span className="hover:underline cursor-pointer">Moderator Code of Conduct</span>
            <span className="w-full mt-2 border-t border-zinc-300 dark:border-zinc-800 pt-2">NotesPhere Inc © 2026. All rights reserved</span>
          </div>
        </div>

      </div>
    </div>
  );
}