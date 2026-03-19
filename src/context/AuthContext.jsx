import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('kihon_token')
    if (token) {
      api.me()
        .then(data => {
          setUser(data.user)
          setStats(data.stats)
        })
        .catch(() => {
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await api.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    // Fetch full stats
    const me = await api.me()
    setStats(me.stats)
    return data
  }

  const register = async (email, password, name, gradeLevel) => {
    const data = await api.register({ email, password, name, gradeLevel })
    setToken(data.token)
    setUser(data.user)
    setStats({ conceptsMastered: 0, creditBalance: 0, drillsCompleted: 0, totalQuestions: 0, totalCorrect: 0, milestonesEarned: [] })
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setStats(null)
  }

  const refreshStats = async () => {
    try {
      const me = await api.me()
      setStats(me.stats)
      return me.stats
    } catch {
      return stats
    }
  }

  return (
    <AuthContext.Provider value={{ user, stats, loading, login, register, logout, refreshStats }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
