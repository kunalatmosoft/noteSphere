// Social features: follow/unfollow, activity feed, simple content recommendations.
import {
  collection, addDoc, doc, getDoc, getDocs, updateDoc,
  query, where, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from './firebase'

const usersCol = collection(db, 'users')
const activityCol = collection(db, 'activity')

export async function getUserByUsername(username) {
  const q = query(usersCol, where('username', '==', username), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function followUser(currentUid, targetUid) {
  await updateDoc(doc(db, 'users', currentUid), { following: arrayUnion(targetUid) })
  await updateDoc(doc(db, 'users', targetUid), { followers: arrayUnion(currentUid) })
  await logActivity({ userId: currentUid, type: 'follow', targetId: targetUid })
}

export async function unfollowUser(currentUid, targetUid) {
  await updateDoc(doc(db, 'users', currentUid), { following: arrayRemove(targetUid) })
  await updateDoc(doc(db, 'users', targetUid), { followers: arrayRemove(currentUid) })
}

export async function logActivity({ userId, type, targetId, meta = {} }) {
  await addDoc(activityCol, { userId, type, targetId, meta, createdAt: serverTimestamp() })
}

export async function getUserActivity(userId, pageLimit = 30) {
  const q = query(activityCol, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(pageLimit))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getAllUsers(pageLimit = 50) {
  const snap = await getDocs(query(usersCol, limit(pageLimit)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Very simple recommendation: users you don't follow yet, ranked by follower count,
// plus posts sharing tags with posts you've liked/authored.
export async function recommendUsers(currentUid, following = []) {
  const all = await getAllUsers(100)
  return all
    .filter((u) => u.uid !== currentUid && !following.includes(u.uid))
    .sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0))
    .slice(0, 8)
}

export function recommendPostsByTags(allPosts, seedTags = [], excludeIds = []) {
  if (!seedTags.length) return allPosts.slice(0, 8)
  return allPosts
    .filter((p) => !excludeIds.includes(p.id))
    .map((p) => ({
      ...p,
      relevance: (p.tags || []).filter((t) => seedTags.includes(t)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance || (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 8)
}
