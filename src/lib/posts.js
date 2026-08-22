// Public blog posts data layer.
// Firestore collection: "posts"
// {
//   authorId, authorName, authorPhoto, title, content, cover, tags: string[],
//   noteId, createdAt, updatedAt, views: number, likeCount: number, likes: string[] (uids)
// }
import {
  collection, addDoc, doc, updateDoc, getDoc, getDocs, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, increment, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from './firebase'
import { updateNode } from './notes'
import { logActivity } from './social'
import { algoliasearch } from 'algoliasearch'

const algoliaClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_ADMIN_KEY
)
const INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'posts'

const postsCol = collection(db, 'posts')

export async function publishNote({ note, author }) {
  const ref = await addDoc(postsCol, {
    authorId: author.uid,
    authorName: author.displayName,
    authorUsername: author.username,
    authorPhoto: author.photoURL || '',
    title: note.name,
    content: note.content,
    cover: note.cover || '',
    tags: note.tags || [],
    noteId: note.id,
    views: 0,
    likeCount: 0,
    likes: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await updateNode(note.id, { published: true, publishedPostId: ref.id })
  await logActivity({ userId: author.uid, type: 'publish', targetId: ref.id, meta: { title: note.name } })

  // Save to Algolia
  try {
    const algoliaRecord = {
      objectID: ref.id,
      title: note.name,
      content: note.content ? note.content.slice(0, 1500) : '',
      tags: note.tags || [],
      authorName: author.displayName || '',
      authorUsername: author.username || '',
      createdAt: Date.now()
    }
    await algoliaClient.saveObject({
      indexName: INDEX_NAME,
      body: algoliaRecord
    })
    console.log('Post saved to Firestore and Algolia successfully!')
  } catch (error) {
    console.error('Error saving to Algolia:', error)
  }

  return ref.id
}

export async function unpublishPost(postId, noteId) {
  await deleteDoc(doc(db, 'posts', postId))
  if (noteId) await updateNode(noteId, { published: false, publishedPostId: null })

  // Remove from Algolia
  try {
    await algoliaClient.deleteObject({
      indexName: INDEX_NAME,
      objectID: postId
    })
    console.log('Post removed from Algolia successfully!')
  } catch (error) {
    console.error('Error removing from Algolia:', error)
  }
}

export async function updatePublishedPost(postId, data) {
  await updateDoc(doc(db, 'posts', postId), { ...data, updatedAt: serverTimestamp() })

  // Update in Algolia
  try {
    const algoliaUpdate = {
      objectID: postId,
    }
    if (data.title !== undefined) algoliaUpdate.title = data.title;
    if (data.content !== undefined) algoliaUpdate.content = data.content.slice(0, 1500);
    if (data.tags !== undefined) algoliaUpdate.tags = data.tags;

    if (Object.keys(algoliaUpdate).length > 1) {
      await algoliaClient.partialUpdateObject({
        indexName: INDEX_NAME,
        objectID: postId,
        attributesToUpdate: algoliaUpdate
      })
      console.log('Post updated in Algolia successfully!')
    }
  } catch (error) {
    console.error('Error updating in Algolia:', error)
  }
}

export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'posts', postId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function incrementView(postId) {
  await updateDoc(doc(db, 'posts', postId), { views: increment(1) })
}

export async function toggleLike(postId, uid, currentlyLiked) {
  await updateDoc(doc(db, 'posts', postId), {
    likes: currentlyLiked ? arrayRemove(uid) : arrayUnion(uid),
    likeCount: increment(currentlyLiked ? -1 : 1),
  })
}

export async function getFeed({ sort = 'recent', pageLimit = 30 } = {}) {
  const field = sort === 'trending' ? 'likeCount' : 'createdAt'
  const q = query(postsCol, orderBy(field, 'desc'), limit(pageLimit))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getTrending(days = 7, pageLimit = 10) {
  // simple trending score = views + likeCount*3, computed client-side over recent posts
  const q = query(postsCol, orderBy('createdAt', 'desc'), limit(100))
  const snap = await getDocs(q)
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return posts
    .map((p) => ({ ...p, score: (p.views || 0) + (p.likeCount || 0) * 3 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, pageLimit)
}

export async function getPostsByAuthor(authorId) {
  const q = query(postsCol, where('authorId', '==', authorId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function searchPosts({ term = '', tag = '' }) {
  const snap = await getDocs(query(postsCol, orderBy('createdAt', 'desc'), limit(200)))
  let posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  if (tag) posts = posts.filter((p) => (p.tags || []).includes(tag))
  if (term) {
    const t = term.toLowerCase()
    posts = posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(t) ||
        p.content?.toLowerCase().includes(t) ||
        p.authorName?.toLowerCase().includes(t) ||
        (p.tags || []).some((tg) => tg.toLowerCase().includes(t))
    )
  }
  return posts
}

export async function getAllTags() {
  const snap = await getDocs(query(postsCol, limit(300)))
  const counts = {}
  snap.docs.forEach((d) => {
    ;(d.data().tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1))
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}
