import React, { useEffect, useState, useRef } from 'react'
import { 
  Image as ImageIcon, Globe, EyeOff, Download, FileDown, 
  Save, X, CheckCircle2, PanelLeft, Settings2 
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer.jsx'
import { updateNode } from '../lib/notes.js'
import { publishNote, unpublishPost, updatePublishedPost } from '../lib/posts.js'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function NoteEditor({ note, onChanged, onToggleSidebar }) {
  const { profile } = useAuth()
  const [name, setName] = useState(note.name)
  const [content, setContent] = useState(note.content)
  const [tagsInput, setTagsInput] = useState((note.tags || []).join(', '))
  const [cover, setCover] = useState(note.cover || '')
  
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState('split') // split | edit | preview
  const [isMobile, setIsMobile] = useState(false)
  const [showMeta, setShowMeta] = useState(false) 
  
  const [editorWidth, setEditorWidth] = useState(50) 
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setName(note.name); setContent(note.content); setTagsInput((note.tags || []).join(', ')); setCover(note.cover || '')
  }, [note.id])

  useEffect(() => {
    const t = setTimeout(() => { handleSave(false) }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, content, tagsInput, cover])

  useEffect(() => {
    const handleMove = (clientX) => {
      if (!isDragging || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      let newWidthPercentage = ((clientX - containerRect.left) / containerRect.width) * 100
      newWidthPercentage = Math.max(15, Math.min(85, newWidthPercentage)) 
      setEditorWidth(newWidthPercentage)
    }

    const handleMouseMove = (e) => handleMove(e.clientX)
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX)

    const handleUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = ''
      document.body.style.touchAction = ''
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('mouseup', handleUp)
      document.addEventListener('touchend', handleUp)
      
      document.body.style.userSelect = 'none'
      document.body.style.touchAction = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchend', handleUp)
    }
  }, [isDragging])

  async function handleSave(showState = true) {
    if (showState) setSaving(true)
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    await updateNode(note.id, { name, content, tags, cover })
    if (note.published && note.publishedPostId) {
      await updatePublishedPost(note.publishedPostId, { title: name, content, tags, cover })
    }
    if (showState) { 
      setTimeout(() => setSaving(false), 800) 
      onChanged?.() 
    }
  }

  async function uploadCoverImage(uid, file) {
    console.log(`Uploading file ${file.name} for user ${uid}`);
    return "https://via.placeholder.com/1600x900.png?text=Cover+Uploaded"; 
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    const url = await uploadCoverImage(profile.uid, file)
    setCover(url)
    setBusy(false)
  }

  async function handlePublish() {
    setBusy(true)
    await handleSave(false)
    await publishNote({ note: { ...note, name, content, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean), cover }, author: profile })
    setBusy(false)
    onChanged?.()
  }

  async function handleUnpublish() {
    setBusy(true)
    await unpublishPost(note.publishedPostId, note.id)
    setBusy(false)
    onChanged?.()
  }

  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
  const activeView = (isMobile && view === 'split') ? 'edit' : view
  const availableViews = isMobile ? ['edit', 'preview'] : ['edit', 'split', 'preview']

  return (
    <div className="flex flex-col h-full bg-[#121212] text-base-100 md:rounded-lg overflow-hidden border border-base-900 shadow-2xl font-sans">
      
      {/* --- TOP HEADER: Title & Core Actions --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 py-3 bg-[#181818] border-b border-base-800/80 z-20">
        
        <div className="flex items-center gap-2 flex-1 w-full">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-base-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft size={20} strokeWidth={1.5} />
          </button>
          
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-xl font-medium tracking-tight outline-none placeholder-base-600 text-base-100 focus:text-white transition-colors min-w-0"
            placeholder="Untitled note"
          />

          <button 
            onClick={() => setShowMeta(!showMeta)}
            className="sm:hidden p-1.5 rounded-md text-base-400 hover:text-indigo-400 hover:bg-indigo-500/10"
          >
            <Settings2 size={18} />
          </button>
        </div>
        
        {/* Actions Toolbar */}
        <div className="flex items-center justify-between lg:justify-end gap-3 overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
          
          {saving && (
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          
          <div className="flex items-center gap-2">
            {/* MANUAL SAVE BUTTON */}
            <button 
              onClick={() => handleSave(true)} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all active:scale-95"
              title="Save Note"
            >
              <Save size={14} strokeWidth={2} /> <span className="hidden sm:inline">Save</span>
            </button>

            {/* Export Actions (Colorful Hovers) */}
            <div className="flex items-center gap-0.5 bg-[#0e0e0e] rounded-md p-0.5 border border-base-800">
              <button 
                onClick={() => downloadMarkdown(name, content)} 
                className="p-1.5 text-base-400 hover:text-violet-400 hover:bg-violet-500/20 rounded transition-colors active:scale-95" 
                title="Download Markdown"
              >
                <Download size={16} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => downloadPDF('note-preview-content', name)} 
                className="p-1.5 text-base-400 hover:text-cyan-400 hover:bg-cyan-500/20 rounded transition-colors active:scale-95" 
                title="Download PDF"
              >
                <FileDown size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-[#0e0e0e] rounded-md p-0.5 text-xs font-bold border border-base-800">
            {availableViews.map((v) => (
              <button 
                key={v} 
                onClick={() => setView(v)} 
                className={`px-3 py-1.5 rounded-[4px] capitalize transition-all ${
                  activeView === v 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                    : 'text-base-500 hover:text-base-200 hover:bg-base-800/50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-base-800 hidden sm:block"></div>

          {/* Publish / Unpublish (Vibrant Gradients) */}
          <div className="flex-shrink-0">
            {note.published ? (
              <button 
                disabled={busy} 
                onClick={handleUnpublish} 
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <EyeOff size={14} strokeWidth={2} /> Unpublish
              </button>
            ) : (
              <button 
                disabled={busy} 
                onClick={handlePublish} 
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:from-emerald-400 hover:to-teal-300 border border-emerald-400/50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50"
              >
                <Globe size={14} strokeWidth={2} /> Publish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- SECONDARY HEADER: Metadata --- */}
      <div className={`${(isMobile && !showMeta) ? 'hidden' : 'flex'} flex-wrap items-center gap-3 px-4 py-2 bg-[#121212] border-b border-base-800/50`}>
        <div className="flex items-center bg-[#1a1a1a] border border-base-800 rounded-md focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all w-full sm:w-64">
          <input
            value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add tags..."
            className="w-full bg-transparent px-3 py-1.5 text-xs outline-none placeholder-base-600 text-base-200"
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="text-[10px] font-mono font-semibold tracking-wide bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
              #{t}
            </span>
          ))}
        </div>

        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-base-400 hover:text-pink-400 hover:bg-pink-500/10 transition-colors px-2 py-1.5 rounded-md ml-auto sm:ml-0 active:scale-95">
          <ImageIcon size={14} /> 
          <span>Cover</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </label>
        
        {cover && (
          <div className="flex items-center gap-2 bg-[#1a1a1a] pr-1 rounded-md border border-base-800 overflow-hidden">
            <img src={cover} className="w-6 h-6 object-cover" alt="Cover preview" />
            <button 
              onClick={() => setCover('')} 
              className="text-base-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors p-1 rounded"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* --- MAIN EDITOR / PREVIEW AREA --- */}
      <div ref={containerRef} className="flex-1 overflow-hidden flex relative bg-[#0e0e0e]">
        
        {(activeView === 'edit' || activeView === 'split') && (
          <div 
            style={{ 
              width: activeView === 'split' ? `${editorWidth}%` : '100%',
              pointerEvents: isDragging ? 'none' : 'auto'
            }} 
            className="h-full flex-shrink-0 flex flex-col"
          >
            <textarea
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none bg-transparent outline-none p-6 font-mono text-[14px] leading-[1.6] text-base-200 placeholder-base-700 custom-scrollbar selection:bg-indigo-500/30"
              placeholder="Start writing..."
              spellCheck="false"
            />
          </div>
        )}

        {activeView === 'split' && (
          <div 
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            className="w-2 -ml-1 cursor-col-resize flex items-center justify-center relative z-10 group"
          >
            <div className={`w-[1px] h-full transition-colors ${isDragging ? 'bg-indigo-500' : 'bg-base-800 group-hover:bg-indigo-500/50'}`} />
          </div>
        )}

        {(activeView === 'preview' || activeView === 'split') && (
          <div 
            style={{ 
              width: activeView === 'split' ? `${100 - editorWidth}%` : '100%',
              pointerEvents: isDragging ? 'none' : 'auto' 
            }}
            className={`h-full overflow-y-auto p-8 custom-scrollbar ${activeView === 'split' ? 'bg-[#121212]' : 'bg-[#0e0e0e]'}`}
          >
            <div className="max-w-3xl mx-auto">
              {cover && (
                <img 
                 src={cover} 
                 className="w-full h-32 md:h-64 object-cover rounded-lg mb-8 shadow-sm border border-base-900" 
                 alt="Cover" 
               />
              )}
              <div id="note-preview-content" className="prose prose-invert prose-sm md:prose-base max-w-none prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-base-800 prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}