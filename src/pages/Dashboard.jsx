import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserTree, buildTree, createNode, deleteNode, getNode } from '../lib/notes.js'
import FileTree from '../components/FileTree.jsx'
import NoteEditor from '../components/NoteEditor.jsx'
import { FileText } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeNode, setActiveNode] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const list = await getUserTree(user.uid)
    setNodes(list)
    setLoading(false)
    if (activeId) {
      const fresh = list.find((n) => n.id === activeId)
      if (fresh) setActiveNode(fresh)
    }
  }, [user.uid, activeId])

  useEffect(() => { refresh() }, [user.uid])

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
    <div className="max-w-7xl mx-auto grid" style={{ gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 57px)' }}>
      <aside className="border-r border-base-800 overflow-y-auto py-2">
        {!loading && <FileTree tree={tree} activeId={activeId} onSelect={handleSelect} onCreate={handleCreate} onDelete={handleDelete} />}
      </aside>
      <main className="overflow-hidden">
        {activeNode ? (
          <NoteEditor key={activeNode.id} note={activeNode} onChanged={refresh} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-base-300 gap-3">
            <FileText size={40} />
            <p>Select a note or create a new file to start writing.</p>
          </div>
        )}
      </main>
    </div>
  )
}
