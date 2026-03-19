import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api'
import './SkillTree.css'

export default function SkillTree() {
  const [skills, setSkills] = useState([])
  const [edges, setEdges] = useState([])
  const [progress, setProgress] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [treeData, progressData] = await Promise.all([
          api.skillTree(),
          api.skillProgress(),
        ])
        setSkills(treeData.skills)
        setEdges(treeData.edges)
        setProgress(progressData.progress)
      } catch (err) {
        console.error('SkillTree load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="skill-tree-page"><div className="container"><p style={{ textAlign: 'center', padding: '4rem' }}>Loading skill tree...</p></div></div>
  }

  const getNodeStatus = (id) => {
    const p = progress.find(p => p.skill_id === id)
    return p?.status || 'locked'
  }

  const getNodeProgress = (id) => {
    return progress.find(p => p.skill_id === id)
  }

  const padding = 60
  const nodeRadius = 32
  const minX = Math.min(...skills.map(n => n.x)) - padding
  const maxX = Math.max(...skills.map(n => n.x)) + padding
  const minY = Math.min(...skills.map(n => n.y)) - padding
  const maxY = Math.max(...skills.map(n => n.y)) + padding
  const width = maxX - minX + nodeRadius * 2
  const height = maxY - minY + nodeRadius * 2

  const selected = selectedNode ? skills.find(n => n.id === selectedNode) : null

  return (
    <motion.div
      className="skill-tree-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="skill-tree-header">
          <div>
            <h1>Skill Tree</h1>
            <p>Your math learning path — from foundations to mastery.</p>
          </div>
          <div className="skill-tree-legend">
            <div className="legend-item">
              <span className="legend-dot mastered" />
              <span>Mastered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot in-progress" />
              <span>In Progress</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot locked" />
              <span>Locked</span>
            </div>
          </div>
        </div>

        <div className="skill-tree-container card">
          <svg
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="skill-tree-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="edgeGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--indigo-400)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--indigo-400)" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="edgeGradientLocked" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--gray-600)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--gray-600)" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glowGreen">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {edges.map((edge, i) => {
              const from = skills.find(n => n.id === edge.from)
              const to = skills.find(n => n.id === edge.to)
              if (!from || !to) return null
              const isActive = getNodeStatus(edge.from) === 'mastered'

              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  className={`skill-edge ${isActive ? 'active' : 'inactive'}`}
                  stroke={isActive ? 'url(#edgeGradientActive)' : 'url(#edgeGradientLocked)'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              )
            })}

            {skills.map((node) => {
              const status = getNodeStatus(node.id)
              const isSelected = selectedNode === node.id

              return (
                <g
                  key={node.id}
                  className={`skill-node skill-node-${status} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {status === 'mastered' && (
                    <circle cx={node.x} cy={node.y} r={nodeRadius + 4} className="node-glow-ring" filter="url(#glowGreen)" />
                  )}
                  {status === 'in-progress' && (
                    <circle cx={node.x} cy={node.y} r={nodeRadius + 4} className="node-pulse-ring" />
                  )}
                  <circle cx={node.x} cy={node.y} r={nodeRadius} className="node-circle" />
                  <text x={node.x} y={node.y} className="node-icon" textAnchor="middle" dominantBaseline="central" fontSize="16">
                    {status === 'mastered' ? '✓' : status === 'in-progress' ? '◉' : '🔒'}
                  </text>
                  <text x={node.x} y={node.y + nodeRadius + 18} className="node-label" textAnchor="middle" fontSize="11">
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {selected && (
          <motion.div
            className="skill-detail card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="skill-detail-header">
              <div>
                <h3>{selected.label}</h3>
                <span className={`badge badge-${getNodeStatus(selected.id) === 'mastered' ? 'success' : getNodeStatus(selected.id) === 'in-progress' ? 'warning' : 'info'}`}>
                  {getNodeStatus(selected.id).replace('-', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span className="skill-grade">Grade {selected.grade_level}</span>
                {getNodeStatus(selected.id) !== 'locked' && (
                  <Link to={`/lesson/${selected.id}`} className="btn btn-sm btn-primary">View Lesson</Link>
                )}
              </div>
            </div>
            {(() => {
              const nodeProgress = getNodeProgress(selected.id)
              if (nodeProgress && nodeProgress.total_attempts > 0) {
                const acc = Math.round((nodeProgress.correct_attempts / nodeProgress.total_attempts) * 100)
                return (
                  <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Accuracy</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{acc}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${acc}%` }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                      {nodeProgress.correct_attempts}/{nodeProgress.total_attempts} correct • {nodeProgress.mastered ? 'Mastered ✓' : `Need ≥80% on 5+ questions`}
                    </p>
                  </div>
                )
              }
              return null
            })()}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
