import React, { useState, useEffect } from 'react'
import { Folder, FolderOpen, FileText, Plus, FolderPlus, Trash2, Globe, ChevronRight } from 'lucide-react'

function TreeNode({ node, depth, activeId, onSelect, onCreate, onDelete, collapseTrigger }) {
  const [open, setOpen] = useState(false)
  const isFolder = node.type === 'folder'

  // Listens to the collapse button click from the Dashboard
  useEffect(() => {
    if (collapseTrigger > 0) {
      setOpen(false)
    }
  }, [collapseTrigger])

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-all select-none ${
          activeId === node.id 
            ? 'bg-indigo-500/10 text-indigo-300' 
            : 'text-base-300 hover:bg-base-800/50 hover:text-base-100'
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() => (isFolder ? setOpen((o) => !o) : onSelect(node))}
      >
        {isFolder ? (
          <>
            <span className={`text-base-500 transition-transform ${open ? 'rotate-90' : ''}`}>
              <ChevronRight size={14} />
            </span>
            {open ? (
              <FolderOpen size={16} className="text-indigo-400 shrink-0" />
            ) : (
              <Folder size={16} className="text-indigo-400 shrink-0" />
            )}
          </>
        ) : (
          <FileText size={15} className="text-base-400 shrink-0 ml-5" />
        )}
        
        <span className={`truncate flex-1 ${activeId === node.id ? 'font-medium' : ''}`}>
          {node.name}
        </span>
        
        {node.published && !isFolder && (
          <Globe size={13} className="text-emerald-500 shrink-0" />
        )}
        
        {/* Hover Actions */}
        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
          {isFolder && (
            <>
              <button 
                title="New file" 
                onClick={(e) => { e.stopPropagation(); onCreate(node.id, 'file') }} 
                className="p-1 text-base-500 hover:text-indigo-400 transition-colors"
              >
                <Plus size={14} />
              </button>
              <button 
                title="New folder" 
                onClick={(e) => { e.stopPropagation(); onCreate(node.id, 'folder') }} 
                className="p-1 text-base-500 hover:text-indigo-400 transition-colors"
              >
                <FolderPlus size={14} />
              </button>
            </>
          )}
          <button 
            title="Delete" 
            onClick={(e) => { e.stopPropagation(); onDelete(node) }} 
            className="p-1 text-base-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Render Children Recursively */}
      {isFolder && open && node.children && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              activeId={activeId} 
              onSelect={onSelect} 
              onCreate={onCreate} 
              onDelete={onDelete} 
              collapseTrigger={collapseTrigger} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

// FIX: Added tree = [] to prevent undefined .length crashes
export default function FileTree({ tree = [], activeId, onSelect, onCreate, onDelete, collapseTrigger }) {
  return (
    <div className="text-base-100 flex flex-col gap-1 pb-4">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-2 group mt-2">
        <span className="text-[11px] font-bold text-base-500 uppercase tracking-widest">My Notes</span>
        
        {/* Quick Actions (Visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            title="New root file" 
            onClick={() => onCreate(null, 'file')} 
            className="p-1 text-base-400 hover:text-indigo-400 rounded transition-colors"
          >
            <Plus size={16} />
          </button>
          <button 
            title="New root folder" 
            onClick={() => onCreate(null, 'folder')} 
            className="p-1 text-base-400 hover:text-indigo-400 rounded transition-colors"
          >
            <FolderPlus size={15} />
          </button>
        </div>
      </div>
      
      {/* Node List */}
      <div className="px-2 space-y-0.5">
        {tree.length === 0 && (
          <p className="px-4 py-2 text-xs text-base-600 text-center italic">No notes yet. Create one!</p>
        )}
        {tree.map((node) => (
          <TreeNode 
            key={node.id} 
            node={node} 
            depth={0} 
            activeId={activeId} 
            onSelect={onSelect} 
            onCreate={onCreate} 
            onDelete={onDelete} 
            collapseTrigger={collapseTrigger} 
          />
        ))}
      </div>
    </div>
  )
}