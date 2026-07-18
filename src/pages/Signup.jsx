import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, name)
      navigate('/notes')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required placeholder="Full name" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 outline-none focus:border-accent-500"
        />
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 outline-none focus:border-accent-500"
        />
        <input
          type="password" required placeholder="Password (min 6 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 outline-none focus:border-accent-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-accent-600 hover:bg-accent-700 rounded-lg py-2 font-medium">
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      <div className="my-4 text-center text-base-300 text-sm">or</div>
      <button
        onClick={() => loginWithGoogle().then(() => navigate('/notes'))}
        className="w-full border border-base-800 hover:bg-base-900 rounded-lg py-2"
      >
        Continue with Google
      </button>
      <p className="text-sm text-base-300 mt-6">
        Already have an account? <Link to="/login" className="text-accent-500">Log in</Link>
      </p>
    </div>
  )
}
