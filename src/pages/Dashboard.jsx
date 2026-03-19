import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }),
}

export default function Dashboard() {
  const { user, stats } = useAuth()
  const [progress, setProgress] = useState([])
  const [rewards, setRewards] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [progressData, rewardsData] = await Promise.all([
          api.skillProgress(),
          api.rewards(),
        ])
        setProgress(progressData.progress)
        setRewards(rewardsData)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="dashboard-page"><div className="container"><p style={{ textAlign: 'center', padding: '4rem' }}>Loading your dashboard...</p></div></div>
  }

  const totalSkills = progress.length
  const mastered = progress.filter(p => p.status === 'mastered').length
  const inProgress = progress.filter(p => p.status === 'in-progress').length
  const locked = progress.filter(p => p.status === 'locked').length
  const progressPct = totalSkills > 0 ? Math.round((mastered / totalSkills) * 100) : 0
  const creditBalance = stats?.creditBalance ?? rewards?.credits ?? 0
  const drillsCompleted = stats?.drillsCompleted ?? rewards?.stats?.drillsCompleted ?? 0

  // Next skills to work on
  const nextSkills = progress.filter(p => p.status === 'in-progress').slice(0, 3)

  // Next milestones
  const nextMilestones = rewards?.milestones?.filter(m => !m.earned)?.slice(0, 2) || []

  return (
    <motion.div
      className="dashboard-page"
      initial="hidden"
      animate="visible"
    >
      <div className="container">
        <motion.div className="dashboard-header" custom={0} variants={fadeUp}>
          <div>
            <h1>Welcome back, {user?.name || 'Student'} 👋</h1>
            <p className="dashboard-subtitle">Keep building those foundations. You're making real progress.</p>
          </div>
          <Link to="/drill" className="btn btn-primary btn-lg">
            ⚡ Start Drill
          </Link>
        </motion.div>

        <motion.div className="stats-row" custom={1} variants={fadeUp}>
          <div className="stat-card card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{mastered}</div>
            <div className="stat-label">Concepts Mastered</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{drillsCompleted}</div>
            <div className="stat-label">Drills Completed</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{creditBalance}</div>
            <div className="stat-label">Gold Credits</div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{progressPct}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
        </motion.div>

        <div className="dashboard-grid">
          <motion.div className="card progress-card" custom={2} variants={fadeUp}>
            <h3>Skill Progress</h3>
            <div className="progress-chart">
              <div className="progress-ring-container">
                <svg viewBox="0 0 160 160" className="progress-ring-svg">
                  <circle cx="80" cy="80" r="70" className="progress-ring-bg" />
                  <motion.circle
                    cx="80" cy="80" r="70"
                    className="progress-ring-fill"
                    strokeDasharray={`${(progressPct / 100) * 440} 440`}
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${(progressPct / 100) * 440} 440` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="progress-ring-center">
                  <span className="progress-ring-pct">{progressPct}%</span>
                  <span className="progress-ring-label">Complete</span>
                </div>
              </div>
              <div className="progress-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-dot mastered" />
                  <span className="breakdown-label">Mastered</span>
                  <span className="breakdown-value">{mastered}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-dot in-progress" />
                  <span className="breakdown-label">In Progress</span>
                  <span className="breakdown-value">{inProgress}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-dot locked" />
                  <span className="breakdown-label">Locked</span>
                  <span className="breakdown-value">{locked}</span>
                </div>
              </div>
            </div>
            <Link to="/skills" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-md)' }}>
              View Full Skill Tree →
            </Link>
          </motion.div>

          <motion.div className="card next-up-card" custom={3} variants={fadeUp}>
            <h3>Up Next</h3>
            <p className="next-up-desc">Your recommended focus areas based on skill dependencies.</p>
            <div className="next-skills">
              {nextSkills.length > 0 ? nextSkills.map(skill => (
                <div key={skill.skill_id} className="next-skill-item">
                  <div className="next-skill-status">
                    <span className="pulse-dot" />
                  </div>
                  <div className="next-skill-info">
                    <span className="next-skill-name">{skill.label}</span>
                    <span className="next-skill-grade">Grade {skill.grade_level}</span>
                  </div>
                  <Link to={`/lesson/${skill.skill_id}`} className="btn btn-sm btn-secondary">Learn</Link>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Complete your diagnostic to unlock your personalized path.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div className="card milestones-card" custom={4} variants={fadeUp}>
            <h3>Next Milestones</h3>
            {nextMilestones.map(m => {
              let progress = 0
              if (m.conceptsRequired) {
                progress = Math.min(100, (mastered / m.conceptsRequired) * 100)
              } else if (m.drillsRequired) {
                progress = Math.min(100, (drillsCompleted / m.drillsRequired) * 100)
              }

              return (
                <div key={m.id} className="milestone-item">
                  <div className="milestone-icon">{m.icon}</div>
                  <div className="milestone-info">
                    <div className="milestone-header">
                      <span className="milestone-title">{m.title}</span>
                      <span className="milestone-reward">{m.reward}</span>
                    </div>
                    <p className="milestone-desc">{m.description}</p>
                    <div className="progress-track" style={{ marginTop: '0.5rem' }}>
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            <Link to="/rewards" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-md)' }}>
              View All Rewards →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
