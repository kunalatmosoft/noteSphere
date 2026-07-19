import React, { useEffect, useState, useRef } from 'react'
import { Image as ImageIcon, Globe, EyeOff, Download, FileDown, Save, X, GripVertical } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer.jsx'
import { updateNode } from '../lib/notes.js'
import { publishNote, unpublishPost, updatePublishedPost } from '../lib/posts.js'
import { downloadMarkdown, downloadPDF } from '../lib/exportUtils.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function NoteEditor({ note, onChanged }) {
  const { profile } = useAuth()
  const [name, setName] = useState(note.name)
  const [content, setContent] = useState(note.content)
  const [tagsInput, setTagsInput] = useState((note.tags || []).join(', '))
  const [cover, setCover] = useState(note.cover || '')
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState('split') // split | edit | preview
  
  // NEW STATE: Manage pane widths
  const [editorWidth, setEditorWidth] = useState(50) // Percentage (50%)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setName(note.name); setContent(note.content); setTagsInput((note.tags || []).join(', ')); setCover(note.cover || '')
  }, [note.id])

  // autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => { handleSave(false) }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, content, tagsInput, cover])

  // NEW EFFECT: Handle Resizing Logic via Mouse Events
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      // Calculate the new width based on mouse position relative to container
      let newWidthPercentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Minimum constraints for usability (e.g., between 20% and 80%)
      newWidthPercentage = Math.max(20, Math.min(80, newWidthPercentage));
      
      setEditorWidth(newWidthPercentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = ''; // Re-enable text selection
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Disable text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  async function handleSave(showState = true) {
    if (showState) setSaving(true)
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    await updateNode(note.id, { name, content, tags, cover })
    if (note.published && note.publishedPostId) {
      await updatePublishedPost(note.publishedPostId, { title: name, content, tags, cover })
    }
    if (showState) { setSaving(false); onChanged?.() }
  }

  // Cover upload placeholder (ensure this exists in your project)
  async function uploadCoverImage(uid, file) {
    // Placeholder function; implementation depends on your storage solution
    console.log(`Uploading file ${file.name} for user ${uid}`);
    return "https://via.placeholder.com/1600x900.png?text=Cover+Uploaded"; // Mock URL
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

  return (
    <div className="flex flex-col h-full bg-base-950 text-base-100 rounded-2xl border border-base-800 overflow-hidden shadow-2xl">
      {/* Modern Metadata bar */}
      <div className="border-b border-base-800 p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder-base-600 focus:text-accent-400 transition-colors"
            placeholder="Untitled note"
          />
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-base-400 animate-pulse">Saving…</span>}
            
            {/* View Toggle */}
            <div className="hidden sm:flex bg-base-900 rounded-lg p-1 text-xs border border-base-800">
              {['edit', 'split', 'preview'].map((v) => (
                <button 
                  key={v} 
                  onClick={() => setView(v)} 
                  className={`px-3 py-1.5 rounded-md capitalize transition-all duration-200 ${
                    view === v ? 'bg-base-700 text-white shadow-sm' : 'text-base-400 hover:text-base-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-base-900 border border-base-800 rounded-lg focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 transition-all overflow-hidden">
            <input
              value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Add tags, comma separated"
              className="bg-transparent px-3 py-1.5 text-xs w-64 outline-none placeholder-base-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="text-[11px] font-medium bg-accent-500/10 text-accent-400 px-2.5 py-1 rounded-full border border-accent-500/20">
                #{t}
              </span>
            ))}
          </div>

          <div className="h-4 w-px bg-base-800 mx-1"></div>

          <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer text-base-400 hover:text-base-200 transition-colors bg-base-900 px-3 py-1.5 rounded-lg border border-base-800 hover:border-base-600">
            <ImageIcon size={14} /> 
            <span>{cover ? 'Change Cover' : 'Add Cover'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
          
          {cover && (
            <div className="flex items-center gap-1.5 bg-base-900 pr-2 rounded-lg border border-base-800 overflow-hidden">
              <img src={cover} className="w-8 h-8 object-cover" alt="Cover preview" />
              <button 
                onClick={() => setCover('')} 
                className="text-base-400 hover:text-rose-400 transition-colors p-1"
                title="Remove cover"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-800/50">
          <button onClick={() => handleSave(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-base-300 hover:bg-base-800 hover:text-base-100 transition-colors">
            <Save size={14} /> Save
          </button>
          <button onClick={() => downloadMarkdown(name, content)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-base-300 hover:bg-base-800 hover:text-base-100 transition-colors">
            <Download size={14} /> .md
          </button>
          <button onClick={() => downloadPDF('note-preview-content', name)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-base-300 hover:bg-base-800 hover:text-base-100 transition-colors">
            <FileDown size={14} /> .pdf
          </button>
          
          <div className="ml-auto">
            {note.published ? (
              <button disabled={busy} onClick={handleUnpublish} className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50">
                <EyeOff size={14} /> Unpublish
              </button>
            ) : (
              <button disabled={busy} onClick={handlePublish} className="flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm disabled:opacity-50">
                <Globe size={14} /> Publish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern, Adjustable Editor / Preview Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden flex relative"
      >
        {/* Editor Pane (Width controlled by state) */}
        {(view === 'edit' || view === 'split') && (
          <div style={{ width: view === 'split' ? `${editorWidth}%` : '100%' }} className="h-full flex-shrink-0">
            <textarea
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full resize-none bg-base-950 outline-none p-6 font-mono text-sm leading-relaxed text-base-300 placeholder-base-700"
              placeholder="Write your note in Markdown… supports $inline$ and $$block$$ KaTeX math."
            />
          </div>
        )}

        {/* --- Resizer Handle (Recreated from image_0.png) --- */}
        {view === 'split' && (
          <div 
            onMouseDown={() => setIsDragging(true)}
            className={`w-px bg-base-800 cursor-col-resize flex items-center justify-center relative group hover:bg-accent-500/20 transition-colors z-10 ${isDragging ? 'bg-accent-500/20' : ''}`}
          >
            {/* Draggable Tab Handle (Centered vertically) */}
            <div 
              className="w-3.5 h-10 bg-base-700 border border-base-600 rounded-full absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 group-hover:bg-accent-400 group-hover:border-accent-500 transition-colors shadow-2xl"
              title="Drag to resize panes"
            />
          </div>
        )}

        {/* Preview Pane (Width controlled by state) */}
        {(view === 'preview' || view === 'split') && (
          <div 
            style={{ width: view === 'split' ? `${100 - editorWidth}%` : '100%' }}
            className="h-full overflow-y-auto p-6 bg-base-900/30 flex-shrink-0"
          >
            <div className="max-w-3xl mx-auto">
              {cover && (
                <img 
               src={cover} 
               className="w-full h-48 md:h-64 object-cover rounded-xl mb-8 shadow-sm border border-base-800" 
               alt="Cover" 
             />
              )}
              <div id="note-preview-content" className="prose prose-invert prose-sm md:prose-base max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}