import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserTree, buildTree, createNode, deleteNode, getNode } from '../lib/notes.js'
import FileTree from '../components/FileTree.jsx'
import NoteEditor from '../components/NoteEditor.jsx'
import { 
  FileText, 
  PanelLeft, 
  Plus, 
  ListCollapse, 
  FolderPlus, 
  FilePlus, 
  Layers,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeNode, setActiveNode] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isDragging, setIsDragging] = useState(false)
  const [collapseTrigger, setCollapseTrigger] = useState(0)

  // Modal States
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    parentId: null,
    type: 'file', // 'file' | 'folder'
    name: ''
  })

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    node: null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const containerRef = useRef(null)
  const createInputRef = useRef(null)

  const refresh = useCallback(async () => {
    const list = await getUserTree(user.uid)
    setNodes(list)
    setLoading(false)
    if (activeId) {
      const fresh = list.find((n) => n.id === activeId)
      if (fresh) setActiveNode(fresh)
    }
  }, [user.uid, activeId])

  useEffect(() => { refresh() }, [user.uid, refresh])

  // Focus input automatically when create modal opens
  useEffect(() => {
    if (createModal.isOpen) {
      setTimeout(() => createInputRef.current?.focus(), 50)
    }
  }, [createModal.isOpen])

  // Sidebar drag resizer logic
  useEffect(() => {
    const handleMove = (clientX) => {
      if (!isDragging || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      
      let newWidth = clientX - containerRect.left
      newWidth = Math.max(200, Math.min(480, newWidth))
      setSidebarWidth(newWidth)
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

  // Modal Triggers
  const openCreateModal = (parentId = null, type = 'file') => {
    setCreateModal({
      isOpen: true,
      parentId,
      type,
      name: type === 'folder' ? 'New Folder' : 'Untitled Note'
    })
  }

  const closeCreateModal = () => {
    setCreateModal({ isOpen: false, parentId: null, type: 'file', name: '' })
  }

  const openDeleteModal = (node) => {
    setDeleteModal({ isOpen: true, node })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, node: null })
  }

  // Modal Action Handlers
  async function handleConfirmCreate(e) {
    e?.preventDefault()
    const trimmedName = createModal.name.trim()
    if (!trimmedName || isSubmitting) return

    try {
      setIsSubmitting(true)
      const id = await createNode({
        ownerId: user.uid,
        parentId: createModal.parentId,
        type: createModal.type,
        name: trimmedName
      })
      await refresh()
      
      if (createModal.type === 'file') {
        const node = await getNode(id)
        setActiveId(id)
        setActiveNode(node)
      }
      closeCreateModal()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteModal.node || isSubmitting) return

    try {
      setIsSubmitting(true)
      await deleteNode(deleteModal.node.id, nodes)
      if (activeId === deleteModal.node.id) {
        setActiveId(null)
        setActiveNode(null)
      }
      await refresh()
      closeDeleteModal()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSelect(node) {
    setActiveId(node.id)
    setActiveNode(node)
  }

  const tree = buildTree(nodes) || []
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)

  return (
    <div 
      ref={containerRef}
      className="w-full h-[calc(100vh-57px)] flex relative bg-[#090a0f] text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200" 
    >
      {/* Sliding Sidebar */}
      <aside 
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }} 
        className={`flex-shrink-0 h-full bg-[#0d0f17]/90 backdrop-blur-xl border-r border-white/[0.06] relative overflow-hidden flex flex-col z-10 ${
          isDragging ? '' : 'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
      >
        <div style={{ width: `${sidebarWidth}px` }} className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-3.5 h-12 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
                <Layers size={14} strokeWidth={2.5} />
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 select-none">
                Workspace
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-zinc-400">
              <button 
                onClick={() => openCreateModal(null, 'file')}
                className="p-1.5 rounded-md hover:text-zinc-100 hover:bg-white/[0.06] transition-all active:scale-95"
                title="New File at Root"
              >
                <FilePlus size={15} strokeWidth={1.8} />
              </button>
              <button 
                onClick={() => openCreateModal(null, 'folder')}
                className="p-1.5 rounded-md hover:text-zinc-100 hover:bg-white/[0.06] transition-all active:scale-95"
                title="New Folder at Root"
              >
                <FolderPlus size={15} strokeWidth={1.8} />
              </button>
              <button 
                onClick={() => setCollapseTrigger(prev => prev + 1)}
                className="p-1.5 rounded-md hover:text-zinc-100 hover:bg-white/[0.06] transition-all active:scale-95"
                title="Collapse All"
              >
                <ListCollapse size={15} strokeWidth={1.8} />
              </button>
              <button 
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:text-zinc-100 hover:bg-white/[0.06] transition-all active:scale-95 ml-0.5"
                title="Toggle Sidebar"
              >
                <PanelLeft size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
          
          {/* Tree Explorer */}
          <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar scroll-smooth">
            {!loading ? (
              <FileTree 
                tree={tree} 
                activeId={activeId} 
                onSelect={handleSelect} 
                onCreate={openCreateModal} 
                onDelete={openDeleteModal} 
                collapseTrigger={collapseTrigger} 
              />
            ) : (
              <div className="flex flex-col gap-2 p-2 animate-pulse">
                <div className="h-6 bg-white/[0.04] rounded-md w-3/4" />
                <div className="h-6 bg-white/[0.04] rounded-md w-1/2 ml-3" />
                <div className="h-6 bg-white/[0.04] rounded-md w-2/3 ml-3" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Modern Drag Handle */}
      {isSidebarOpen && (
        <div 
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="w-2.5 -ml-1 cursor-col-resize flex items-center justify-center relative z-20 group"
        >
          <div className={`w-[2px] h-full transition-all duration-200 ${
            isDragging 
              ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' 
              : 'bg-transparent group-hover:bg-indigo-500/40'
          }`} />
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 h-full min-w-0 overflow-hidden flex flex-col relative bg-[#090a0f]">
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="absolute top-3.5 left-3.5 z-20 p-2 text-zinc-400 hover:text-zinc-100 rounded-lg bg-[#121520]/80 backdrop-blur-md border border-white/[0.08] shadow-lg shadow-black/40 transition-all hover:scale-105 active:scale-95 group"
            title="Open Sidebar"
          >
            <PanelLeft size={17} strokeWidth={2} className="group-hover:text-indigo-400 transition-colors" />
          </button>
        )}

        {activeNode ? (
          <NoteEditor 
            key={activeNode.id} 
            note={activeNode} 
            onChanged={refresh} 
            onToggleSidebar={toggleSidebar} 
          />
        ) : (
          <div className="h-full w-full relative flex flex-col items-center justify-center p-6 select-none overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
              <div className="relative mb-6 group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative p-4 rounded-2xl bg-[#111420] border border-white/[0.08] text-indigo-400 shadow-xl">
                  <FileText size={38} strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-zinc-100 mb-1.5">
                No Document Selected
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Choose a note from your workspace tree on the left, or kick off a new thought instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <button 
                  onClick={() => openCreateModal(null, 'file')}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all active:scale-95"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  New Note
                </button>
                <button 
                  onClick={() => openCreateModal(null, 'folder')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.02] border border-white/[0.08] text-zinc-300 hover:text-zinc-100 text-xs font-medium rounded-lg transition-all active:scale-95"
                >
                  <FolderPlus size={15} strokeWidth={1.8} />
                  New Folder
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-[#0e111a] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/80 overflow-hidden"
            onKeyDown={(e) => { if (e.key === 'Escape') closeCreateModal() }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  {createModal.type === 'folder' ? (
                    <FolderPlus size={18} strokeWidth={2} />
                  ) : (
                    <FilePlus size={18} strokeWidth={2} />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Create New {createModal.type === 'folder' ? 'Folder' : 'File'}
                </h3>
              </div>
              <button 
                onClick={closeCreateModal}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  {createModal.type === 'folder' ? 'Folder Name' : 'File Name'}
                </label>
                <input
                  ref={createInputRef}
                  type="text"
                  value={createModal.name}
                  onChange={(e) => setCreateModal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={createModal.type === 'folder' ? 'e.g. Architecture' : 'e.g. api-design.md'}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.1] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createModal.name.trim() || isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  {isSubmitting ? 'Creating...' : `Create ${createModal.type === 'folder' ? 'Folder' : 'File'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-[#0e111a] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/80 overflow-hidden"
            onKeyDown={(e) => { if (e.key === 'Escape') closeDeleteModal() }}
          >
            <div className="p-5 flex flex-col items-center text-center">
              {/* Alert Badge */}
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
                <AlertTriangle size={24} strokeWidth={2} />
              </div>

              <h3 className="text-base font-semibold text-zinc-100 mb-1">
                Delete {deleteModal.node?.type === 'folder' ? 'Folder' : 'File'}?
              </h3>
              
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Are you sure you want to delete <span className="text-zinc-200 font-medium font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">"{deleteModal.node?.name}"</span>? This action is permanent and cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-zinc-100 text-xs font-medium rounded-lg border border-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all active:scale-95"
                >
                  <Trash2 size={13} strokeWidth={2} />
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}