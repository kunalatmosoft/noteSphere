import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust path to your firebase config

// Fetch all custom libraries for a specific user
export const getUserLibraries = async (uid) => {
  const q = query(collection(db, 'libraries'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Create a new custom section/library
export const createLibrary = async (uid, name) => {
  const libRef = await addDoc(collection(db, 'libraries'), {
    uid,
    name,
    createdAt: serverTimestamp(),
    postCount: 0,
    isPublic: false // default to private
  });
  return { id: libRef.id, name, uid, postCount: 0, isPublic: false};
};

// Fetch posts saved inside a specific custom library
export const getLibraryPosts = async (libraryId) => {
  const q = query(collection(db, `libraries/${libraryId}/posts`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Save an existing post to a custom library
export const savePostToLibrary = async (libraryId, post) => {
  const postRef = doc(db, `libraries/${libraryId}/posts`, post.id);
  await setDoc(postRef, {
    ...post,
    savedAt: serverTimestamp()
  });
};

// Update a custom library's name
export const updateLibraryName = async (libraryId, newName) => {
  const libRef = doc(db, 'libraries', libraryId);
  await updateDoc(libRef, { name: newName });
};

// Delete a custom library entirely
export const deleteLibrary = async (libraryId) => {
  await deleteDoc(doc(db, 'libraries', libraryId));
};

// Remove a specific post from a custom library
export const removePostFromLibrary = async (libraryId, postId) => {
  const postRef = doc(db, `libraries/${libraryId}/posts`, postId);
  await deleteDoc(postRef);
};

// Toggle public/private visibility
export const toggleLibraryVisibility = async (libraryId, isPublic) => {
  const libRef = doc(db, 'libraries', libraryId);
  await updateDoc(libRef, { isPublic });
};

// Fetch all public libraries
export const getPublicLibraries = async () => {
  const q = query(collection(db, 'libraries'), where('isPublic', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};