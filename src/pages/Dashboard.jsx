import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserTree, buildTree, createNode, deleteNode, getNode } from '../lib/notes.js'
import FileTree from '../components/FileTree.jsx'
import NoteEditor from '../components/NoteEditor.jsx'
import { 
  FileText, 
  Database, 
  SquareTerminal, 
  Bot, 
  Book, 
  Settings, 
  PanelLeft 
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeNode, setActiveNode] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sidebar Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isDragging, setIsDragging] = useState(false)
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

  // Drag-to-resize logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      // Calculate width relative to the inner container (excluding the 64px nav rail)
      let newWidth = e.clientX - containerRect.left - 64 
      
      // Constrain sidebar width (min 150px, max 500px)
      newWidth = Math.max(150, Math.min(500, newWidth))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = '' 
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none' 
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  async function handleCreate(parentId, type) {
    const name = window.prompt(type === 'folder' ? 'Folder name' : 'File name (e.g. My Note.md)', type === 'folder' ? 'New Folder' : 'Untitled.md')
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

  const tree = buildTree(nodes)

  return (
    <div 
      ref={containerRef}
      className="max-w-7xl mx-auto flex relative bg-base-950 overflow-hidden" 
      style={{ height: 'calc(100vh - 57px)' }}
    >

      {/* 2. Sliding FileTree Sidebar */}
      <aside 
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }} 
        className="flex-shrink-0 bg-base-950 border-r border-base-900 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden"
      >
        {/* Inner container maintains width so content doesn't squash during the slide animation */}
        <div style={{ width: `${sidebarWidth}px` }} className="h-full flex flex-col">
          {/* Header area with toggle */}
          <div className="flex items-center justify-between p-3 border-b border-base-900/50">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-base-400 hover:text-base-100 rounded-lg hover:bg-base-900 transition-colors"
            >
              <PanelLeft size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {!loading && (
              <FileTree 
                tree={tree} 
                activeId={activeId} 
                onSelect={handleSelect} 
                onCreate={handleCreate} 
                onDelete={handleDelete} 
              />
            )}
          </div>
        </div>
      </aside>

      {/* 3. Drag Resizer Handle (Only visible when sidebar is open) */}
      {isSidebarOpen && (
        <div 
          onMouseDown={() => setIsDragging(true)}
          className={`w-1 bg-transparent cursor-col-resize flex items-center justify-center absolute z-30 group hover:bg-accent-500/30 transition-colors ${isDragging ? 'bg-accent-500/30' : ''}`}
          style={{ left: `calc(64px + ${sidebarWidth}px - 2px)`, top: 0, bottom: 0 }}
        >
          {/* Visual Handle */}
          <div className="w-1 h-8 bg-base-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* 4. Main Editor Area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-base-900/10 flex flex-col relative">
        {/* Floating toggle button when sidebar is closed */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 z-10 p-2 text-base-400 hover:text-base-100 rounded-lg hover:bg-base-900/80 bg-base-950 border border-base-800 shadow-sm transition-all"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {activeNode ? (
          <NoteEditor key={activeNode.id} note={activeNode} onChanged={refresh} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-base-400 gap-4 bg-base-950">
            <div className="p-4 rounded-2xl bg-base-900 border border-base-800 shadow-sm">
              <FileText size={48} className="opacity-50" />
            </div>
            <p className="text-sm font-medium">Select a note or create a new file to start writing.</p>
          </div>
        )}
      </main>
    </div>
  )
}