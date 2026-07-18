// Personal notes data layer: hierarchical folder/file structure (VS Code style)
// Firestore collection: "notes"
// Document shape:
// {
//   ownerId, parentId (null = root), type: 'folder' | 'file',
//   name, tags: string[], cover: string (url), content: string (markdown),
//   published: bool, publishedPostId: string|null,
//   createdAt, updatedAt
// }
import {
  collection, addDoc, doc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, serverTimestamp, getDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const notesCol = collection(db, 'notes')

export async function createNode({ ownerId, parentId = null, type, name, tags = [], cover = '', content = '' }) {
  const ref = await addDoc(notesCol, {
    ownerId, parentId, type, name, tags, cover, content,
    published: false, publishedPostId: null,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserTree(ownerId) {
  const q = query(notesCol, where('ownerId', '==', ownerId), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getNode(id) {
  const snap = await getDoc(doc(db, 'notes', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateNode(id, data) {
  await updateDoc(doc(db, 'notes', id), { ...data, updatedAt: serverTimestamp() })
}

export async function renameNode(id, name) {
  return updateNode(id, { name })
}

export async function deleteNode(id, allNodes) {
  // recursively delete children (folders)
  const children = allNodes.filter((n) => n.parentId === id)
  for (const child of children) {
    await deleteNode(child.id, allNodes)
  }
  await deleteDoc(doc(db, 'notes', id))
}

export function buildTree(nodes) {
  const map = {}
  nodes.forEach((n) => (map[n.id] = { ...n, children: [] }))
  const roots = []
  nodes.forEach((n) => {
    if (n.parentId && map[n.parentId]) {
      map[n.parentId].children.push(map[n.id])
    } else {
      roots.push(map[n.id])
    }
  })
  const sortFn = (a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  }
  const sortRec = (arr) => {
    arr.sort(sortFn)
    arr.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)
  return roots
}
