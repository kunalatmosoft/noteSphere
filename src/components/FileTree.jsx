import React, { useState } from 'react'
import { Folder, FolderOpen, FileText, Plus, FolderPlus, Trash2, Globe } from 'lucide-react'

function TreeNode({ node, depth, activeId, onSelect, onCreate, onDelete }) {
  const [open, setOpen] = useState(true)
  const isFolder = node.type === 'folder'

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm hover:bg-base-800 ${
          activeId === node.id ? 'bg-base-800' : ''
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() => (isFolder ? setOpen((o) => !o) : onSelect(node))}
      >
        {isFolder ? (
          open ? <FolderOpen size={15} className="text-accent-500 shrink-0" /> : <Folder size={15} className="text-accent-500 shrink-0" />
        ) : (
          <FileText size={15} className="text-base-300 shrink-0" />
        )}
        <span className="truncate flex-1">{node.name}</span>
        {node.published && <Globe size={12} className="text-emerald-400 shrink-0" />}
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          {isFolder && (
            <>
              <button title="New file" onClick={(e) => { e.stopPropagation(); onCreate(node.id, 'file') }} className="p-0.5 hover:text-accent-500">
                <Plus size={13} />
              </button>
              <button title="New folder" onClick={(e) => { e.stopPropagation(); onCreate(node.id, 'folder') }} className="p-0.5 hover:text-accent-500">
                <FolderPlus size={13} />
              </button>
            </>
          )}
          <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(node) }} className="p-0.5 hover:text-red-400">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {isFolder && open && node.children.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} activeId={activeId} onSelect={onSelect} onCreate={onCreate} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default function FileTree({ tree, activeId, onSelect, onCreate, onDelete }) {
  return (
    <div className="text-base-100">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-xs uppercase tracking-wider text-base-300 font-semibold">My Notes</span>
        <div className="flex items-center gap-1">
          <button title="New file at root" onClick={() => onCreate(null, 'file')} className="p-1 hover:bg-base-800 rounded">
            <Plus size={14} />
          </button>
          <button title="New folder at root" onClick={() => onCreate(null, 'folder')} className="p-1 hover:bg-base-800 rounded">
            <FolderPlus size={14} />
          </button>
        </div>
      </div>
      {tree.length === 0 && <p className="px-3 text-xs text-base-300">No notes yet. Create one!</p>}
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} activeId={activeId} onSelect={onSelect} onCreate={onCreate} onDelete={onDelete} />
      ))}
    </div>
  )
}
