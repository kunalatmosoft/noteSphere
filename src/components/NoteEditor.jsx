import React, { useEffect, useState } from 'react'
import { Image as ImageIcon, Globe, EyeOff, Download, FileDown, Save, X } from 'lucide-react'
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

  useEffect(() => {
    setName(note.name); setContent(note.content); setTagsInput((note.tags || []).join(', ')); setCover(note.cover || '')
  }, [note.id])

  // autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => { handleSave(false) }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, content, tagsInput, cover])

  async function handleSave(showState = true) {
    if (showState) setSaving(true)
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    await updateNode(note.id, { name, content, tags, cover })
    if (note.published && note.publishedPostId) {
      await updatePublishedPost(note.publishedPostId, { title: name, content, tags, cover })
    }
    if (showState) { setSaving(false); onChanged?.() }
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
    <div className="flex flex-col h-full">
      {/* Metadata bar */}
      <div className="border-b border-base-800 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-xl font-bold outline-none"
            placeholder="Untitled note"
          />
          {saving && <span className="text-xs text-base-300">Saving…</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
            placeholder="tags, comma, separated"
            className="bg-base-900 border border-base-800 rounded-lg px-2 py-1 text-xs w-56 outline-none focus:border-accent-500"
          />
          {tags.map((t) => (
            <span key={t} className="text-[11px] bg-accent-600/20 text-accent-500 px-2 py-0.5 rounded-full">#{t}</span>
          ))}
          <label className="flex items-center gap-1 text-xs cursor-pointer text-base-300 hover:text-base-100">
            <ImageIcon size={14} /> Cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
          {cover && (
            <span className="flex items-center gap-1 text-xs">
              <img src={cover} className="w-6 h-6 rounded object-cover" />
              <button onClick={() => setCover('')}><X size={12} /></button>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex bg-base-900 rounded-lg p-0.5 text-xs">
            {['edit', 'split', 'preview'].map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-2 py-1 rounded-md capitalize ${view === v ? 'bg-base-800' : ''}`}>{v}</button>
            ))}
          </div>
          <button onClick={() => handleSave(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-base-800">
            <Save size={13} /> Save
          </button>
          <button onClick={() => downloadMarkdown(name, content)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-base-800">
            <Download size={13} /> .md
          </button>
          <button onClick={() => downloadPDF('note-preview-content', name)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-base-800">
            <FileDown size={13} /> .pdf
          </button>
          {note.published ? (
            <button disabled={busy} onClick={handleUnpublish} className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-base-800 text-amber-400 ml-auto">
              <EyeOff size={13} /> Unpublish
            </button>
          ) : (
            <button disabled={busy} onClick={handlePublish} className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 ml-auto">
              <Globe size={13} /> Publish
            </button>
          )}
        </div>
      </div>

      {/* Editor / preview */}
      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: view === 'split' ? '1fr 1fr' : '1fr' }}>
        {(view === 'edit' || view === 'split') && (
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            className="h-full resize-none bg-base-950 outline-none p-4 font-mono text-sm leading-relaxed border-r border-base-800"
            placeholder="Write your note in Markdown… supports $inline$ and $$block$$ KaTeX math."
          />
        )}
        {(view === 'preview' || view === 'split') && (
          <div className="h-full overflow-y-auto p-4">
            {cover && <img src={cover} className="w-full max-h-56 object-cover rounded-xl mb-4" />}
            <MarkdownRenderer id="note-preview-content" content={content} />
          </div>
        )}
      </div>
    </div>
  )
}
