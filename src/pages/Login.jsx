import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ email: '', password: '', name: '', gradeLevel: 5 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        navigate('/dashboard')
      } else {
        if (!form.name) {
          setError('Name is required')
          setLoading(false)
          return
        }
        await register(form.email, form.password, form.name, form.gradeLevel)
        navigate('/diagnostic')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-logo">
          <span className="login-logo-icon">基</span>
          <span className="login-logo-text">Kihon</span>
        </div>

        <h1>{mode === 'login' ? 'Welcome back' : 'Get started'}</h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to continue your learning path.'
            : 'Create an account to find your starting point.'}
        </p>

        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="grade">Grade Level</label>
              <select
                id="grade"
                value={form.gradeLevel}
                onChange={e => setForm({ ...form, gradeLevel: parseInt(e.target.value) })}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => { setMode('register'); setError('') }}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => { setMode('login'); setError('') }}>Sign in</button></p>
          )}
        </div>

        <Link to="/" className="login-back">← Back to home</Link>
      </motion.div>
    </div>
  )
}
