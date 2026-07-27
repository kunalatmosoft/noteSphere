import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserTree, buildTree, createNode, deleteNode, getNode } from '../lib/notes.js'
import FileTree from '../components/FileTree.jsx'
import NoteEditor from '../components/NoteEditor.jsx'
import { 
  FileText, 
  PanelLeft,
  Plus,
  ListCollapse 
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
  
  const containerRef = useRef(null)

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

  useEffect(() => {
    const handleMove = (clientX) => {
      if (!isDragging || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      
      let newWidth = clientX - containerRect.left
      newWidth = Math.max(180, Math.min(450, newWidth))
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

  async function handleCreate(parentId, type) {
    const name = window.prompt(type === 'folder' ? 'Folder name' : 'File name', type === 'folder' ? 'New Folder' : 'Untitled')
    if (!name) return
    const id = await createNode({ ownerId: user.uid, parentId, type, name })
    await refresh()
    if (type === 'file') {
      const node = await getNode(id)
      setActiveId(id); setActiveNode(node)
    }
  }

  async function handleDelete(node) {
    if (!window.confirm(`Delete "${node.name}"? This cannot be undone.`)) return
    await deleteNode(node.id, nodes)
    if (activeId === node.id) { setActiveId(null); setActiveNode(null) }
    await refresh()
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
      // CRITICAL FIX: Changed min-h to a strict h-[calc...] to prevent the whole page from scrolling
      className="w-full h-[calc(100vh-57px)] flex relative bg-[#0e0e0e] overflow-hidden" 
    >
      {/* Sliding FileTree Sidebar */}
      <aside 
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }} 
        className={`flex-shrink-0 h-full bg-[#121212] border-r border-base-800/60 relative overflow-hidden ${isDragging ? '' : 'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'}`}
      >
        <div style={{ width: `${sidebarWidth}px` }} className="h-full flex flex-col">
          {/* Sidebar Header (Static) */}
          <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-base-800/60 h-[53px]">
            <span className="text-xs font-bold text-base-500 uppercase tracking-wider pl-2 select-none">
              Explorer
            </span>
            
            <div className="flex items-center gap-0.5">
              <button 
                onClick={() => setCollapseTrigger(prev => prev + 1)}
                className="p-1.5 text-base-400 hover:text-indigo-400 rounded-md hover:bg-indigo-500/10 transition-colors active:scale-95"
                title="Collapse All Folders"
              >
                <ListCollapse size={16} strokeWidth={2} />
              </button>
              
              <button 
                onClick={toggleSidebar}
                className="p-1.5 text-base-400 hover:text-indigo-400 rounded-md hover:bg-indigo-500/10 transition-colors active:scale-95"
                title="Close Sidebar"
              >
                <PanelLeft size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
          
          {/* Sidebar Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {!loading && (
              <FileTree 
                tree={tree} 
                activeId={activeId} 
                onSelect={handleSelect} 
                onCreate={handleCreate} 
                onDelete={handleDelete}
                collapseTrigger={collapseTrigger} 
              />
            )}
          </div>
        </div>
      </aside>

      {/* Drag Resizer Handle */}
      {isSidebarOpen && (
        <div 
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="w-2 -ml-1 cursor-col-resize flex items-center justify-center relative z-20 group hover:bg-indigo-500/10 transition-colors"
        >
          <div className={`w-[1px] h-full transition-colors ${isDragging ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-500/50'}`} />
        </div>
      )}

      {/* Main Editor Area */}
      <main className="flex-1 h-full min-w-0 overflow-hidden flex flex-col relative bg-[#0e0e0e]">
        {!isSidebarOpen && !activeNode && (
          <button 
            onClick={toggleSidebar}
            className="absolute top-3 left-3 z-10 p-2 text-base-400 hover:text-indigo-400 rounded-md hover:bg-indigo-500/10 bg-[#121212] border border-base-800 shadow-sm transition-all active:scale-95"
            title="Open Sidebar"
          >
            <PanelLeft size={20} strokeWidth={1.5} />
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
          <div className="h-full w-full overflow-y-auto flex flex-col items-center justify-center text-base-400 gap-5 bg-[#0e0e0e]">
            <div className="p-5 rounded-2xl bg-[#121212] border border-base-800 shadow-sm">
              <FileText size={48} className="text-base-600" strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base-100 font-medium text-lg">No file selected</h3>
              <p className="text-sm">Select a note from the sidebar or create a new one.</p>
            </div>
            
            <button 
              onClick={() => handleCreate(null, 'file')}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} /> New File
            </button>
          </div>
        )}
      </main>
    </div>
  )
}