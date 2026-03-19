import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, stats, logout } = useAuth()

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/skills',    label: 'Skill Tree', icon: '🌳' },
    { to: '/drill',     label: 'Drill',      icon: '⚡' },
    { to: '/rewards',   label: 'Rewards',    icon: '🏆' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar glass">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-logo">基</span>
          <span className="navbar-title">Kihon</span>
        </Link>

        <div className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="navbar-link-icon">{link.icon}</span>
              <span className="navbar-link-label">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <div className="navbar-credits">
            <span className="credits-icon">💰</span>
            <span className="credits-count">{stats?.creditBalance ?? 0}</span>
          </div>
          <div className="navbar-avatar" onClick={handleLogout} title="Sign out">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>
      </div>
    </nav>
  )
}
