import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api'
import './Lesson.css'

// Simple KaTeX-style renderer: converts $...$ and $$...$$ to styled spans
// In production, use react-katex for real rendering
function renderMathContent(text) {
  if (!text) return ''

  // Process block math ($$...$$)
  let html = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return `<div class="math-block">${escapeHtml(math.trim())}</div>`
  })

  // Process inline math ($...$)
  html = html.replace(/\$([^$]+?)\$/g, (_, math) => {
    return `<span class="math-inline">${escapeHtml(math.trim())}</span>`
  })

  // Process markdown headers
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br />')

  // Numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')

  return `<p>${html}</p>`
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function Lesson() {
  const { skillId } = useParams()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLesson(skillId)
        setLesson(data.lesson)
      } catch (err) {
        setError(err.message || 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [skillId])

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="container">
          <motion.div className="lesson-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="lesson-loading-icon">🧠</div>
            <h2>Generating Your Lesson...</h2>
            <p>Our AI tutor is preparing a personalized explanation just for you.</p>
            <div className="progress-track" style={{ maxWidth: 300, margin: '1.5rem auto' }}>
              <motion.div
                className="progress-fill"
                animate={{ width: ['0%', '60%', '90%'] }}
                transition={{ duration: 8, times: [0, 0.6, 1] }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lesson-page">
        <div className="container">
          <div className="lesson-error card">
            <p>⚠️ {error}</p>
            <Link to="/skills" className="btn btn-secondary">Back to Skill Tree</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="lesson-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="lesson-header">
          <Link to="/skills" className="lesson-back">← Skill Tree</Link>
          <div className="lesson-meta">
            {lesson?.type === 'ai_generated' && <span className="badge badge-info">🧠 AI Generated</span>}
            {lesson?.type === 'placeholder' && <span className="badge badge-warning">📝 Built-in</span>}
          </div>
        </div>

        <div className="lesson-content card">
          <div
            className="lesson-body"
            dangerouslySetInnerHTML={{ __html: renderMathContent(lesson?.content || '') }}
          />
        </div>

        <div className="lesson-actions">
          <Link to={`/drill?skill=${skillId}`} className="btn btn-primary btn-lg">
            Practice This Skill ⚡
          </Link>
          <Link to="/skills" className="btn btn-secondary">
            Back to Skill Tree
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
