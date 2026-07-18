import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
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
      await login(email, password)
      navigate('/notes')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Welcome back</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 outline-none focus:border-accent-500"
        />
        <input
          type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 outline-none focus:border-accent-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-accent-600 hover:bg-accent-700 rounded-lg py-2 font-medium">
          {loading ? 'Logging in…' : 'Log in'}
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
        No account? <Link to="/signup" className="text-accent-500">Sign up</Link>
      </p>
    </div>
  )
}
