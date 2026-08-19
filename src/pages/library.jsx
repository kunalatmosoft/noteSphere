import React, { useEffect, useState, useRef } from 'react';
import { getFeed, getTrending } from '../lib/posts.js';
import { 
    getUserLibraries, 
    createLibrary, 
    getLibraryPosts, 
    updateLibraryName, 
    deleteLibrary, 
    removePostFromLibrary,
    toggleLibraryVisibility,
    getPublicLibraries
} from '../lib/library.js';
import PostCard from '../components/PostCard.jsx';
import { Link } from 'react-router-dom';
import { 
    TrendingUp, 
    Library, 
    Plus, 
    Globe, 
    Trash2, 
    Edit3, 
    X, 
    Check, 
    Search, 
    Lock, 
    Users, 
    LayoutGrid, 
    List, 
    Share2, 
    Sparkles, 
    ArrowUpRight, 
    BookOpen, 
    Layers, 
    CheckCircle2, 
    AlertTriangle,
    SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Shimmer Skeleton Loaders
const SkeletonCard = ({ viewMode }) => (
    <div className={`bg-[#0d0f17]/60 border border-white/[0.06] rounded-2xl p-4 animate-pulse flex ${viewMode === 'list' ? 'flex-row items-center gap-4 h-24' : 'flex-col justify-between h-[300px]'}`}>
        <div className={`bg-white/[0.04] rounded-xl ${viewMode === 'list' ? 'w-20 h-16 shrink-0' : 'w-full h-36 mb-3'}`} />
        <div className="flex-1 space-y-2.5 w-full">
            <div className="h-4 bg-white/[0.06] rounded-md w-3/4" />
            <div className="h-3 bg-white/[0.03] rounded-md w-full" />
            {viewMode === 'grid' && <div className="h-3 bg-white/[0.03] rounded-md w-1/2" />}
        </div>
    </div>
);

export default function CustomizedDashboard() {
    const { profile } = useAuth();

    const [activeSection, setActiveSection] = useState('public');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Data States
    const [posts, setPosts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [userLibraries, setUserLibraries] = useState([]);
    const [publicLibraries, setPublicLibraries] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedToast, setCopiedToast] = useState(false);
    
    // Modal States
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newLibName, setNewLibName] = useState('');
    const [newLibIsPublic, setNewLibIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Edit Inline State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const editInputRef = useRef(null);

    // Initial Load: Global data & User/Public libraries
    useEffect(() => {
        const initializeDashboard = async () => {
            setLoading(true);
            const [trendData, feedData, pubLibs] = await Promise.all([
                getTrending(),
                getFeed({ sort: 'recent' }),
                getPublicLibraries()
            ]);

            setTrending(trendData || []);
            setPosts(feedData || []);
            setPublicLibraries(pubLibs || []);

            if (profile?.uid) {
                const libs = await getUserLibraries(profile.uid);
                setUserLibraries(libs || []);
            }
            setLoading(false);
        };
        initializeDashboard();
    }, [profile]);

    // Handle Section Switching
    useEffect(() => {
        if (loading) return;

        const fetchSectionData = async () => {
            setLoading(true);
            setIsEditing(false);
            setSearchQuery('');

            if (activeSection === 'public') {
                setPosts(await getFeed({ sort: 'recent' }));
            } else if (activeSection === 'trending') {
                setPosts(await getFeed({ sort: 'trending' }));
            } else {
                setPosts(await getLibraryPosts(activeSection));
            }
            setLoading(false);
        };

        fetchSectionData();
    }, [activeSection]);

    useEffect(() => {
        if (isEditing) editInputRef.current?.focus();
    }, [isEditing]);

    // --- CRUD Handlers ---

    const handleCreateLibrary = async (e) => {
        e.preventDefault();
        if (!newLibName.trim() || !profile?.uid || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const newLib = await createLibrary(profile.uid, newLibName.trim(), newLibIsPublic);
            setUserLibraries(prev => [...prev, newLib]);
            if (newLibIsPublic) setPublicLibraries(prev => [...prev, newLib]);
            
            setNewLibName('');
            setNewLibIsPublic(false);
            setCreateModalOpen(false);
            setActiveSection(newLib.id);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRenameLibrary = async () => {
        const trimmed = editName.trim();
        if (!trimmed || trimmed === activeLibInfo?.name) {
            setIsEditing(false);
            return;
        }
        await updateLibraryName(activeSection, trimmed);
        setUserLibraries(prev => prev.map(lib => 
            lib.id === activeSection ? { ...lib, name: trimmed } : lib
        ));
        setPublicLibraries(prev => prev.map(lib => 
            lib.id === activeSection ? { ...lib, name: trimmed } : lib
        ));
        setIsEditing(false);
    };

    const handleConfirmDelete = async () => {
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            await deleteLibrary(activeSection);
            setUserLibraries(prev => prev.filter(lib => lib.id !== activeSection));
            setPublicLibraries(prev => prev.filter(lib => lib.id !== activeSection));
            setActiveSection('public');
            setDeleteModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemovePost = async (postId) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
        await removePostFromLibrary(activeSection, postId);
    };

    const handleToggleVisibility = async () => {
        if (!activeLibInfo) return;
        const newStatus = !activeLibInfo.isPublic;
        
        setUserLibraries(prev => prev.map(lib => 
            lib.id === activeSection ? { ...lib, isPublic: newStatus } : lib
        ));

        if (newStatus) {
            setPublicLibraries(prev => [...prev, { ...activeLibInfo, isPublic: true }]);
        } else {
            setPublicLibraries(prev => prev.filter(lib => lib.id !== activeSection));
        }
        
        await toggleLibraryVisibility(activeSection, newStatus);
    };

    const handleShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
    };

    // --- Ownership & Info ---
    const activeLibInfo = userLibraries.find(l => l.id === activeSection) || publicLibraries.find(l => l.id === activeSection);
    const isCustomLibrary = activeSection !== 'public' && activeSection !== 'trending';
    const isOwner = isCustomLibrary && activeLibInfo?.uid === profile?.uid;
    const communityLibraries = publicLibraries.filter(lib => lib.uid !== profile?.uid);

    // Filtered Posts
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
        <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[260px_1fr_300px] gap-8">

                    {/* LEFT SIDEBAR: Navigation & Libraries */}
                    <aside className="space-y-6">
                        {/* Feed Navigation */}
                        <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-3 shadow-lg shadow-black/20">
                            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-2">
                                Feeds
                            </h2>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setActiveSection('public')}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        activeSection === 'public' 
                                            ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Globe size={16} /> Global Explorer
                                    </div>
                                    {activeSection === 'public' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                                </button>

                                <button
                                    onClick={() => setActiveSection('trending')}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        activeSection === 'trending' 
                                            ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <TrendingUp size={16} /> Top Ranked
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        Hot
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* User Libraries */}
                        {profile && (
                            <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-3 shadow-lg shadow-black/20">
                                <div className="flex items-center justify-between px-3 py-2 mb-1">
                                    <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers size={13} className="text-indigo-400" /> My Collections
                                    </h2>
                                    <button 
                                        onClick={() => setCreateModalOpen(true)}
                                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                                        title="Create Library"
                                    >
                                        <Plus size={15} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                                    {userLibraries.length === 0 ? (
                                        <p className="text-[11px] text-zinc-500 px-3 py-2 italic">
                                            No collections yet. Click + to create.
                                        </p>
                                    ) : (
                                        userLibraries.map(lib => (
                                            <button
                                                key={lib.id}
                                                onClick={() => setActiveSection(lib.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                                    activeSection === lib.id 
                                                        ? 'bg-white/[0.08] text-indigo-300 font-semibold border border-indigo-500/30' 
                                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <BookOpen size={15} className={activeSection === lib.id ? 'text-indigo-400' : 'text-zinc-500'} />
                                                    <span className="truncate">{lib.name}</span>
                                                </div>
                                                {lib.isPublic ? (
                                                    <Globe size={12} className="text-emerald-400/80 shrink-0" title="Public collection" />
                                                ) : (
                                                    <Lock size={12} className="text-zinc-500 shrink-0" title="Private collection" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Community Curations */}
                        {communityLibraries.length > 0 && (
                            <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-3 shadow-lg shadow-black/20">
                                <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
                                    <Users size={13} className="text-emerald-400" /> Community Stacks
                                </h2>
                                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {communityLibraries.map(lib => (
                                        <button
                                            key={lib.id}
                                            onClick={() => setActiveSection(lib.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                                                activeSection === lib.id 
                                                    ? 'bg-white/[0.08] text-indigo-300 font-semibold border border-indigo-500/30' 
                                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                                            }`}
                                        >
                                            <Library size={15} className="text-emerald-400/70 shrink-0" />
                                            <span className="truncate">{lib.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="min-w-0">
                        {/* Header Banner */}
                        <div className="relative mb-6 p-5 sm:p-6 rounded-2xl bg-[#0d0f17]/80 backdrop-blur-xl border border-white/[0.07] shadow-xl shadow-black/20">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                
                                {/* Title & Inline Edit */}
                                <div className="flex-1 min-w-0">
                                    {isEditing && isOwner ? (
                                        <div className="flex items-center gap-2 max-w-md">
                                            <input 
                                                ref={editInputRef}
                                                type="text" 
                                                value={editName} 
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRenameLibrary()}
                                                className="w-full bg-black/40 border border-indigo-500/80 rounded-xl px-3 py-1.5 text-base font-semibold text-zinc-100 outline-none"
                                            />
                                            <button onClick={handleRenameLibrary} className="p-2 text-emerald-400 hover:bg-white/[0.06] rounded-lg transition-colors">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => setIsEditing(false)} className="p-2 text-rose-400 hover:bg-white/[0.06] rounded-lg transition-colors">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-xl font-bold tracking-tight text-zinc-100 truncate flex items-center gap-2">
                                                {isCustomLibrary ? activeLibInfo?.name : (activeSection === 'public' ? 'Global Feed' : 'Trending Publications')}
                                            </h1>
                                            
                                            {isOwner && (
                                                <button 
                                                    onClick={() => { setEditName(activeLibInfo?.name || ''); setIsEditing(true); }}
                                                    className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] rounded-md transition-colors"
                                                    title="Rename Collection"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Subtitle & Badges */}
                                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                                        <span className="text-xs text-zinc-400">
                                            {posts.length} {posts.length === 1 ? 'article' : 'articles'} in view
                                        </span>

                                        {isCustomLibrary && (
                                            <>
                                                <span className="text-zinc-600">•</span>
                                                <button
                                                    disabled={!isOwner}
                                                    onClick={handleToggleVisibility}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                                                        activeLibInfo?.isPublic 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                            : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60'
                                                    } ${isOwner ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                                                    title={isOwner ? "Toggle Public / Private" : undefined}
                                                >
                                                    {activeLibInfo?.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                                                    {activeLibInfo?.isPublic ? 'Public' : 'Private'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Controls: Actions & View Switcher */}
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    {isCustomLibrary && (
                                        <button 
                                            onClick={handleShareLink}
                                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-all"
                                            title="Share collection link"
                                        >
                                            <Share2 size={15} />
                                        </button>
                                    )}

                                    {isOwner && (
                                        <button 
                                            onClick={() => setDeleteModalOpen(true)}
                                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                                            title="Delete Collection"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}

                                    <div className="flex items-center p-1 bg-black/40 border border-white/[0.06] rounded-xl">
                                        <button 
                                            onClick={() => setViewMode('grid')}
                                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                            title="Grid View"
                                        >
                                            <LayoutGrid size={14} />
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('list')}
                                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                            title="List View"
                                        >
                                            <List size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        {!loading && posts.length > 0 && (
                            <div className="relative mb-6">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Filter by title, tag, or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0d0f17]/60 border border-white/[0.08] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none transition-all"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Posts Rendering Grid / List */}
                        {loading ? (
                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                                {[...Array(4)].map((_, i) => (
                                    <SkeletonCard key={i} viewMode={viewMode} />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl bg-[#0d0f17]/40 border border-white/[0.06]">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Sparkles size={22} strokeWidth={1.75} />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-200 mb-1">No articles found</h3>
                                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                                    {isOwner ? 'Save interesting articles from the global feed into this collection.' : 'There are currently no items available in this section.'}
                                </p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="p-10 text-center rounded-2xl bg-[#0d0f17]/40 border border-white/[0.06]">
                                <p className="text-xs text-zinc-400">No posts match "{searchQuery}"</p>
                                <button 
                                    onClick={() => setSearchQuery('')} 
                                    className="text-xs text-indigo-400 hover:underline mt-2 font-semibold"
                                >
                                    Reset filter
                                </button>
                            </div>
                        ) : (
                            <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                                {filteredPosts.map(p => (
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

                    {/* RIGHT ASIDE: Trending Insights */}
                    <aside className="hidden xl:block space-y-6">
                        <div className="bg-[#0d0f17]/70 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 sticky top-6 shadow-lg shadow-black/20">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.05]">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <TrendingUp size={13} strokeWidth={2.5} />
                                    </span>
                                    Hot Right Now
                                </h3>
                            </div>

                            <ol className="space-y-1">
                                {trending.slice(0, 5).map((p, i) => (
                                    <li key={p.id}>
                                        <Link 
                                            to={`/post/${p.id}`} 
                                            className="group flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-white/[0.04] transition-all"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                <span className={`text-xs font-mono font-bold w-4 ${i === 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                                                    0{i + 1}
                                                </span>
                                                <span className="text-xs font-medium text-zinc-300 group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                    {p.title}
                                                </span>
                                            </div>
                                            <ArrowUpRight size={13} className="text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </aside>

                </div>
            </div>

            {/* CREATE LIBRARY MODAL */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="w-full max-w-md bg-[#0e111a] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
                        onKeyDown={(e) => { if (e.key === 'Escape') setCreateModalOpen(false); }}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                                <Plus size={16} className="text-indigo-400" /> Create Collection
                            </h3>
                            <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-md text-zinc-400 hover:text-zinc-100">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLibrary} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Collection Name
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newLibName}
                                    onChange={(e) => setNewLibName(e.target.value)}
                                    placeholder="e.g. Backend Microservices"
                                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] focus:border-indigo-500/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 outline-none"
                                    required
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={newLibIsPublic} 
                                    onChange={(e) => setNewLibIsPublic(e.target.checked)}
                                    className="rounded border-zinc-700 text-indigo-600 focus:ring-0 w-4 h-4 bg-zinc-900"
                                />
                                <div>
                                    <p className="text-xs font-semibold text-zinc-200">Public Collection</p>
                                    <p className="text-[10px] text-zinc-500">Allow community members to view and discover this collection</p>
                                </div>
                            </label>

                            <div className="flex justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newLibName.trim() || isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-[#0e111a] border border-white/[0.08] rounded-2xl shadow-2xl p-5 text-center">
                        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit mx-auto mb-3">
                            <AlertTriangle size={22} strokeWidth={2} />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Delete Collection?</h3>
                        <p className="text-xs text-zinc-400 mb-5">
                            Are you sure you want to remove <span className="font-semibold text-zinc-200">"{activeLibInfo?.name}"</span>? All saved links inside this collection will be cleared.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 py-2 text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.06]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {copiedToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    Collection link copied to clipboard!
                </div>
            )}
        </div>
    );
}