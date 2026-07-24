import React, { useEffect, useState } from 'react';
import { getFeed, getTrending } from '../lib/posts.js';
import { 
    getUserLibraries, 
    createLibrary, 
    getLibraryPosts, 
    updateLibraryName, 
    deleteLibrary, 
    removePostFromLibrary,
    toggleLibraryVisibility,
    getPublicLibraries // Ensure this is exported from your lib/library.js
} from '../lib/library.js';
import PostCard from '../components/PostCard.jsx';
import { Link } from 'react-router-dom';
import { TrendingUp, Library, Plus, Globe, Trash2, Edit2, X, Check, Search, Lock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function CustomizedDashboard() {
    const { profile } = useAuth();

    const [activeSection, setActiveSection] = useState('public');

    // Data States
    const [posts, setPosts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [userLibraries, setUserLibraries] = useState([]);
    const [publicLibraries, setPublicLibraries] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [isCreatingLib, setIsCreatingLib] = useState(false);
    const [newLibName, setNewLibName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Advanced Edit States
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');

    // Initial Load: Global data & User/Public libraries
    useEffect(() => {
        const initializeDashboard = async () => {
            setLoading(true);
            const [trendData, feedData, pubLibs] = await Promise.all([
                getTrending(),
                getFeed({ sort: 'recent' }),
                getPublicLibraries()
            ]);

            setTrending(trendData);
            setPosts(feedData);
            setPublicLibraries(pubLibs);

            if (profile?.uid) {
                const libs = await getUserLibraries(profile.uid);
                setUserLibraries(libs);
            }
            setLoading(false);
        };
        initializeDashboard();
    }, [profile]);

    // Handle Section Switching
    useEffect(() => {
        if (loading) return; // Skip initial render conflict

        const fetchSectionData = async () => {
            setLoading(true);
            setIsEditing(false); // Close edit mode if switching tabs
            setSearchQuery(''); // Reset search query when switching sections

            if (activeSection === 'public') {
                setPosts(await getFeed({ sort: 'recent' }));
            } else if (activeSection === 'trending') {
                setPosts(await getFeed({ sort: 'trending' }));
            } else {
                // Fetch posts for the custom selected library
                setPosts(await getLibraryPosts(activeSection));
            }
            setLoading(false);
        };

        fetchSectionData();
    }, [activeSection]);

    // --- CRUD Handlers ---

    const handleCreateLibrary = async (e) => {
        e.preventDefault();
        if (!newLibName.trim() || !profile?.uid) return;

        const newLib = await createLibrary(profile.uid, newLibName);
        setUserLibraries([...userLibraries, newLib]);
        setNewLibName('');
        setIsCreatingLib(false);
        setActiveSection(newLib.id); 
    };

    const handleRenameLibrary = async () => {
        if (!editName.trim() || editName === activeLibInfo?.name) {
            setIsEditing(false);
            return;
        }
        await updateLibraryName(activeSection, editName);
        setUserLibraries(userLibraries.map(lib => 
            lib.id === activeSection ? { ...lib, name: editName } : lib
        ));
        setIsEditing(false);
    };

    const handleDeleteLibrary = async () => {
        if (!window.confirm("Are you sure you want to delete this entire library? This cannot be undone.")) return;
        
        await deleteLibrary(activeSection);
        setUserLibraries(userLibraries.filter(lib => lib.id !== activeSection));
        setActiveSection('public');
    };

    const handleRemovePost = async (postId) => {
        // Optimistic UI update
        setPosts(posts.filter(p => p.id !== postId));
        await removePostFromLibrary(activeSection, postId);
    };

    const handleToggleVisibility = async () => {
        if (!activeLibInfo) return;
        const newStatus = !activeLibInfo.isPublic;
        
        // Optimistic UI Update
        setUserLibraries(userLibraries.map(lib => 
            lib.id === activeSection ? { ...lib, isPublic: newStatus } : lib
        ));
        
        await toggleLibraryVisibility(activeSection, newStatus);
    };

    // --- OWNERSHIP CHECKS ---
    const activeLibInfo = userLibraries.find(l => l.id === activeSection) || publicLibraries.find(l => l.id === activeSection);
    const isCustomLibrary = activeSection !== 'public' && activeSection !== 'trending';
    const isOwner = isCustomLibrary && activeLibInfo?.uid === profile?.uid;

    const communityLibraries = publicLibraries.filter(lib => lib.uid !== profile?.uid);

    // Derived State: Filtered Posts
    const filteredPosts = posts.filter(post => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            post.title?.toLowerCase().includes(q) ||
            post.content?.toLowerCase().includes(q) ||
            post.tags?.some(tag => tag.toLowerCase().includes(q))
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr_300px] gap-6">

            {/* LEFT SIDEBAR: Navigation & Custom Libraries */}
            <aside className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-sm font-bold text-base-400 uppercase tracking-wider mb-3">Discover</h2>
                    <button
                        onClick={() => setActiveSection('public')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === 'public' ? 'bg-base-800 text-white' : 'text-base-300 hover:bg-base-900'}`}
                    >
                        <Globe size={18} /> Global Feed
                    </button>
                    <button
                        onClick={() => setActiveSection('trending')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === 'trending' ? 'bg-base-800 text-white' : 'text-base-300 hover:bg-base-900'}`}
                    >
                        <TrendingUp size={18} /> Top Ranked
                    </button>
                </div>

                {communityLibraries.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-base-800">
                        <h2 className="text-sm font-bold text-base-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Users size={16} /> Community Libraries
                        </h2>
                        {communityLibraries.map(lib => (
                            <button
                                key={lib.id}
                                onClick={() => setActiveSection(lib.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === lib.id ? 'bg-base-800 text-white' : 'text-base-300 hover:bg-base-900'}`}
                            >
                                <Library size={18} className="flex-shrink-0 text-accent-500/70" />
                                <span className="truncate">{lib.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {profile && (
                    <div className="space-y-2 pt-4 border-t border-base-800">
                        <h2 className="text-sm font-bold text-base-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                            My Libraries
                            <button onClick={() => setIsCreatingLib(!isCreatingLib)} className="hover:text-accent-500 transition-colors p-1 rounded hover:bg-base-800">
                                <Plus size={16} />
                            </button>
                        </h2>

                        {isCreatingLib && (
                            <form onSubmit={handleCreateLibrary} className="mb-3">
                                <input
                                    type="text" autoFocus placeholder="Library name..."
                                    className="w-full bg-base-900 border border-base-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-accent-500"
                                    value={newLibName} onChange={(e) => setNewLibName(e.target.value)}
                                    onBlur={() => !newLibName && setIsCreatingLib(false)}
                                />
                            </form>
                        )}

                        {userLibraries.map(lib => (
                            <button
                                key={lib.id}
                                onClick={() => setActiveSection(lib.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === lib.id ? 'bg-base-800 text-white' : 'text-base-300 hover:bg-base-900'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Library size={18} className="flex-shrink-0" />
                                    <span className="truncate">{lib.name}</span>
                                </div>
                                {lib.isPublic && <Globe size={12} className="text-accent-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </aside>

            {/* MAIN CONTENT AREA */}
            <main>
                <div className="flex items-center justify-between mb-4 min-h-[40px]">
                    
                    {/* EDIT MODE UI */}
                    {isEditing && isOwner ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                            <input 
                                autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                                className="bg-base-900 border border-accent-500 rounded-lg px-3 py-1.5 outline-none flex-grow"
                                onKeyDown={(e) => e.key === 'Enter' && handleRenameLibrary()}
                            />
                            <button onClick={handleRenameLibrary} className="p-2 text-green-500 hover:bg-base-800 rounded-lg transition-colors">
                                <Check size={18} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-red-500 hover:bg-base-800 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        // NORMAL HEADER UI
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold capitalize flex items-center gap-3 group">
                                {isCustomLibrary ? activeLibInfo?.name : (activeSection === 'public' ? 'Global Feed' : 'Trending Posts')}
                                
                                {/* ONLY owners can rename */}
                                {isOwner && (
                                    <button 
                                        onClick={() => { setEditName(activeLibInfo?.name); setIsEditing(true); }}
                                        className="opacity-0 group-hover:opacity-100 text-base-400 hover:text-accent-500 transition-opacity p-1"
                                        title="Rename Library"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </h1>

                            {/* ONLY owners can toggle visibility */}
                            {isOwner && !isEditing && (
                                <button
                                    onClick={handleToggleVisibility}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                                        activeLibInfo?.isPublic 
                                        ? 'bg-accent-500/10 text-accent-500 border-accent-500/30 hover:bg-accent-500/20' 
                                        : 'bg-base-800 text-base-400 border-base-700 hover:bg-base-700 hover:text-white'
                                    }`}
                                    title={activeLibInfo?.isPublic ? "Make Private" : "Make Public"}
                                >
                                    {activeLibInfo?.isPublic ? (
                                        <><Globe size={14} /> Public</>
                                    ) : (
                                        <><Lock size={14} /> Private</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ONLY owners can delete */}
                    {isOwner && !isEditing && (
                        <button 
                            onClick={handleDeleteLibrary} 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} /> Delete Library
                        </button>
                    )}
                </div>

                {/* SEARCH BAR */}
                {!loading && posts.length > 0 && (
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-base-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search posts by title, tag, or content..."
                            className="w-full bg-base-900 border border-base-700 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}

                {/* POSTS GRID OR EMPTY STATES */}
                {loading ? (
                    <div className="flex space-x-2 animate-pulse py-8 justify-center">
                        <div className="w-3 h-3 bg-base-700 rounded-full"></div>
                        <div className="w-3 h-3 bg-base-700 rounded-full"></div>
                        <div className="w-3 h-3 bg-base-700 rounded-full"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-base-900/50 rounded-xl border border-base-800 mt-6">
                        <p className="text-base-400 mb-2">Nothing to see here yet.</p>
                        {isOwner && (
                            <p className="text-sm text-base-500">Click "Save to Library" on any post to add it here.</p>
                        )}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-12 bg-base-900/50 rounded-xl border border-base-800">
                        <p className="text-base-400">No posts match "{searchQuery}"</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="text-accent-500 text-sm hover:underline mt-2"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {filteredPosts.map((p) => (
                            <PostCard 
                                key={p.id} 
                                post={p} 
                                userLibraries={userLibraries} 
                                activeLibraryId={isOwner ? activeSection : null}
                                onRemove={handleRemovePost}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* RIGHT ASIDE: Quick Trends */}
            <aside className="hidden xl:block space-y-6">
                <div className="bg-base-900 border border-base-800 rounded-xl p-4 sticky top-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-accent-500" /> Hot Right Now
                    </h3>
                    <ol className="space-y-3">
                        {trending.slice(0, 5).map((p, i) => (
                            <li key={p.id} className="text-sm group">
                                <Link to={`/post/${p.id}`} className="flex gap-3">
                                    <span className="text-base-500 font-medium group-hover:text-accent-500 transition-colors">
                                        0{i + 1}
                                    </span>
                                    <span className="line-clamp-2 text-base-200 group-hover:text-white transition-colors">
                                        {p.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </aside>

        </div>
    );
}