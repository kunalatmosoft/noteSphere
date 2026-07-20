import {
  collection, addDoc, doc, updateDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, increment, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from './firebase' 
import { logActivity } from './social' 

const communitiesCol = collection(db, 'communities')
const redditPostsCol = collection(db, 'reddit_posts')
const commentsCol = collection(db, 'comments')

// ==========================================
// 1. COMMUNITIES (SUBREDDITS)
// ==========================================

export async function createCommunity({ name, description, creatorId }) {
  const ref = await addDoc(communitiesCol, {
    name: name.toLowerCase().replace(/\s+/g, ''),
    displayName: name,
    description,
    creatorId,
    memberCount: 1,
    members: [creatorId],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function toggleJoinCommunity(communityId, uid, isMember) {
  await updateDoc(doc(db, 'communities', communityId), {
    members: isMember ? arrayRemove(uid) : arrayUnion(uid),
    memberCount: increment(isMember ? -1 : 1),
  })
}

export async function getCommunity(communityId) {
  const snap = await getDoc(doc(db, 'communities', communityId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ==========================================
// 2. REDDIT POSTS & VOTING (KARMA)
// ==========================================

export async function createRedditPost({ communityId, communityName, title, content, author }) {
  const ref = await addDoc(redditPostsCol, {
    communityId,
    communityName,
    authorId: author.uid,
    authorName: author.displayName,
    authorUsername: author.username,
    authorPhoto: author.photoURL || '',
    title,
    content,
    score: 1,
    upvotes: [author.uid], // Self-upvote on creation
    downvotes: [],
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await logActivity({ 
    userId: author.uid, 
    type: 'reddit_post', 
    targetId: ref.id, 
    meta: { title, communityName } 
  })
  return ref.id
}

export async function handleVote(postId, uid, voteType) {
  const postRef = doc(db, 'reddit_posts', postId)
  const snap = await getDoc(postRef)
  if (!snap.exists()) return

  const { upvotes = [], downvotes = [] } = snap.data()
  const hasUpvoted = upvotes.includes(uid)
  const hasDownvoted = downvotes.includes(uid)

  let scoreChange = 0
  let updates = {}

  if (voteType === 'upvote') {
    if (hasUpvoted) {
      updates.upvotes = arrayRemove(uid)
      scoreChange = -1
    } else {
      updates.upvotes = arrayUnion(uid)
      scoreChange = hasDownvoted ? 2 : 1
      if (hasDownvoted) updates.downvotes = arrayRemove(uid)
    }
  } else if (voteType === 'downvote') {
    if (hasDownvoted) {
      updates.downvotes = arrayRemove(uid)
      scoreChange = 1
    } else {
      updates.downvotes = arrayUnion(uid)
      scoreChange = hasUpvoted ? -2 : -1
      if (hasUpvoted) updates.upvotes = arrayRemove(uid)
    }
  }

  updates.score = increment(scoreChange)
  await updateDoc(postRef, updates)
}

export async function handleCommentVote(commentId, uid, voteType) {
  const commentRef = doc(db, 'comments', commentId)
  const snap = await getDoc(commentRef)
  if (!snap.exists()) return

  const { upvotes = [], downvotes = [] } = snap.data()
  const hasUpvoted = upvotes.includes(uid)
  const hasDownvoted = downvotes.includes(uid)

  let scoreChange = 0
  let updates = {}

  if (voteType === 'upvote') {
    if (hasUpvoted) {
      updates.upvotes = arrayRemove(uid)
      scoreChange = -1
    } else {
      updates.upvotes = arrayUnion(uid)
      scoreChange = hasDownvoted ? 2 : 1
      if (hasDownvoted) updates.downvotes = arrayRemove(uid)
    }
  } else if (voteType === 'downvote') {
    if (hasDownvoted) {
      updates.downvotes = arrayRemove(uid)
      scoreChange = 1
    } else {
      updates.downvotes = arrayUnion(uid)
      scoreChange = hasUpvoted ? -2 : -1
      if (hasUpvoted) updates.upvotes = arrayRemove(uid)
    }
  }

  updates.score = increment(scoreChange)
  await updateDoc(commentRef, updates)
}

export async function getRedditFeed({ communityId = null, sort = 'hot', pageLimit = 30 } = {}) {
  let q = redditPostsCol
  
  if (communityId) {
    q = query(q, where('communityId', '==', communityId))
  }

  const orderByField = sort === 'hot' ? 'score' : 'createdAt'
  q = query(q, orderBy(orderByField, 'desc'), limit(pageLimit))
  
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ==========================================
// 3. NESTED COMMENTS STRUCTURING
// ==========================================

export async function addComment({ postId, parentId = null, content, author }) {
  const ref = await addDoc(commentsCol, {
    postId,
    parentId, // null for top-level comments, commentId for replies
    authorId: author.uid,
    authorName: author.displayName,
    authorUsername: author.username,
    authorPhoto: author.photoURL || '',
    content,
    score: 1,
    upvotes: [author.uid],
    downvotes: [],
    createdAt: serverTimestamp(),
  })

  // Increment comment count on the post
  await updateDoc(doc(db, 'reddit_posts', postId), {
    commentCount: increment(1),
  })

  return ref.id
}

export async function getPostCommentsTree(postId) {
  // Removed the orderBy('createdAt') to prevent the Firebase Index Error
  const q = query(commentsCol, where('postId', '==', postId))
  const snap = await getDocs(q)
  let comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Sort chronologically on the client side instead
  comments.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))

  // Convert flat Firestore array into a nested tree view structure
  const map = {}
  comments.forEach((c) => (map[c.id] = { ...c, replies: [] }))
  const roots = []

  comments.forEach((c) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id])
    } else {
      roots.push(map[c.id])
    }
  })

  // Sort by score descending (highest karma comments at the top)
  const sortRec = (arr) => {
    arr.sort((a, b) => (b.score || 0) - (a.score || 0))
    arr.forEach((c) => sortRec(c.replies))
  }
  sortRec(roots)
  
  return roots
}

// === NEW: Edit & Delete Functions for Posts ===

export async function editRedditPost(postId, newTitle, newContent) {
  await updateDoc(doc(db, 'reddit_posts', postId), {
    title: newTitle,
    content: newContent,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRedditPost(postId) {
  await deleteDoc(doc(db, 'reddit_posts', postId));
}

// === NEW: Edit & Delete Functions for Comments ===

export async function editComment(commentId, newContent) {
  await updateDoc(doc(db, 'comments', commentId), {
    content: newContent,
  });
}

export async function deleteComment(commentId) {
  // Hard delete the comment
  await deleteDoc(doc(db, 'comments', commentId));
}

// Add this under your other community functions in src/lib/reddit.js
export async function getAllCommunities(limitCount = 50) {
  const q = query(collection(db, 'communities'), orderBy('memberCount', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}