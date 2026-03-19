import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Diagnostic from './pages/Diagnostic'
import Dashboard from './pages/Dashboard'
import SkillTree from './pages/SkillTree'
import Drill from './pages/Drill'
import Rewards from './pages/Rewards'
import Lesson from './pages/Lesson'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const location = useLocation()
  const { user } = useAuth()

  // Hide navbar on landing, login, diagnostic, drill
  const hideNav = ['/', '/login', '/diagnostic', '/drill'].includes(location.pathname)

  return (
    <>
      {!hideNav && user && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnostic" element={<ProtectedRoute><Diagnostic /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><SkillTree /></ProtectedRoute>} />
          <Route path="/drill" element={<ProtectedRoute><Drill /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/lesson/:skillId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
