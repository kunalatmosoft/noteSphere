import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserByUsername, followUser, unfollowUser, getUserActivity } from '../lib/social.js'
import { getPostsByAuthor } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { formatDistanceToNow } from 'date-fns'

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile, setProfile: setMyProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')

  useEffect(() => {
    (async () => {
      setLoading(true)
      const p = await getUserByUsername(username)
      setProfile(p)
      if (p) {
        setPosts(await getPostsByAuthor(p.uid))
        setActivity(await getUserActivity(p.uid))
      }
      setLoading(false)
    })()
  }, [username])

  const isMe = user && profile && user.uid === profile.uid
  const isFollowing = myProfile && profile && (myProfile.following || []).includes(profile.uid)

  async function handleFollow() {
    if (!user || !profile) return
    if (isFollowing) {
      await unfollowUser(user.uid, profile.uid)
      setMyProfile((p) => ({ ...p, following: p.following.filter((id) => id !== profile.uid) }))
      setProfile((p) => ({ ...p, followers: p.followers.filter((id) => id !== user.uid) }))
    } else {
      await followUser(user.uid, profile.uid)
      setMyProfile((p) => ({ ...p, following: [...(p.following || []), profile.uid] }))
      setProfile((p) => ({ ...p, followers: [...(p.followers || []), user.uid] }))
    }
  }

  if (loading) return <p className="text-center mt-10 text-base-300">Loading…</p>
  if (!profile) return <p className="text-center mt-10 text-base-300">User not found.</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-5">
        {profile.photoURL ? (
          <img src={profile.photoURL} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-base-800 flex items-center justify-center text-2xl font-bold">
            {profile.displayName?.[0]}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          <p className="text-base-300 text-sm">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
          <div className="flex gap-4 mt-2 text-sm">
            <span><b>{posts.length}</b> <span className="text-base-300">posts</span></span>
            <span><b>{profile.followers?.length || 0}</b> <span className="text-base-300">followers</span></span>
            <span><b>{profile.following?.length || 0}</b> <span className="text-base-300">following</span></span>
          </div>
        </div>
        {!isMe && user && (
          <button
            onClick={handleFollow}
            className={`px-4 py-1.5 rounded-lg font-medium text-sm ${isFollowing ? 'bg-base-800' : 'bg-accent-600 hover:bg-accent-700'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-base-800 mt-6 mb-4 text-sm">
        <button onClick={() => setTab('posts')} className={`pb-2 ${tab === 'posts' ? 'border-b-2 border-accent-500 text-accent-500' : 'text-base-300'}`}>Published posts</button>
        <button onClick={() => setTab('activity')} className={`pb-2 ${tab === 'activity' ? 'border-b-2 border-accent-500 text-accent-500' : 'text-base-300'}`}>Activity</button>
      </div>

      {tab === 'posts' ? (
        posts.length === 0 ? <p className="text-base-300">No published posts yet.</p> : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )
      ) : (
        <ul className="space-y-3">
          {activity.length === 0 && <p className="text-base-300">No recent activity.</p>}
          {activity.map((a) => (
            <li key={a.id} className="text-sm text-base-300">
              {a.type === 'publish' && <span>Published <span className="text-base-100">"{a.meta?.title}"</span></span>}
              {a.type === 'follow' && <span>Started following someone new</span>}
              {a.type === 'like' && <span>Liked a post</span>}
              {' — '}{a.createdAt?.toDate ? formatDistanceToNow(a.createdAt.toDate(), { addSuffix: true }) : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
