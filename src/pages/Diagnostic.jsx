import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import './Diagnostic.css'

export default function Diagnostic() {
  const navigate = useNavigate()
  const { refreshStats } = useAuth()
  const [phase, setPhase] = useState('intro') // intro | quiz | results
  const [sessionId, setSessionId] = useState(null)
  const [currentQ, setCurrentQ] = useState(null)
  const [questionNum, setQuestionNum] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(15)
  const [difficulty, setDifficulty] = useState(5)
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(null)
  const [lastExplanation, setLastExplanation] = useState('')
  const [results, setResults] = useState({ correct: 0, total: 0, gaps: [] })
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const startQuiz = useCallback(async () => {
    try {
      const data = await api.diagnosticStart()
      setSessionId(data.sessionId)
      setTotalQuestions(data.totalQuestions)
      setQuestionNum(data.questionNumber)
      setCurrentQ(data.question)
      setPhase('quiz')
    } catch (err) {
      console.error('Failed to start diagnostic:', err)
    }
  }, [])

  const handleAnswer = useCallback(async (optionIndex) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSelected(optionIndex)
    setShowFeedback(true)

    try {
      const data = await api.diagnosticAnswer({
        sessionId,
        questionId: currentQ.id,
        selectedIndex: optionIndex,
      })

      setLastCorrect(data.correct)
      setLastExplanation(data.explanation)

      if (data.done) {
        setResults({
          correct: data.results.correct,
          total: data.results.total,
          accuracy: data.results.accuracy,
          sessionId: data.results.sessionId,
        })

        setTimeout(async () => {
          try {
            const gapData = await api.diagnosticResults(data.results.sessionId)
            setResults(prev => ({ ...prev, gaps: gapData.gaps }))
          } catch {}
          await refreshStats()
          setPhase('results')
        }, 1500)
      } else {
        if (data.difficulty) setDifficulty(data.difficulty)

        setTimeout(() => {
          setCurrentQ(data.nextQuestion)
          setQuestionNum(data.questionNumber)
          setSelected(null)
          setShowFeedback(false)
          setSubmitting(false)
          submittingRef.current = false
        }, 1500)
      }
    } catch (err) {
      console.error('Failed to submit answer:', err)
      setShowFeedback(false)
      setSelected(null)
      setSubmitting(false)
      submittingRef.current = false
    }
  }, [currentQ, sessionId, refreshStats])

  // --- Intro Phase ---
  if (phase === 'intro') {
    return (
      <div className="diagnostic-page">
        <div className="diagnostic-bg">
          <div className="diagnostic-orb diagnostic-orb-1" />
          <div className="diagnostic-orb diagnostic-orb-2" />
        </div>
        <motion.div
          className="diagnostic-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="intro-icon">🎯</div>
          <h1>Let's Find Your Starting Point</h1>
          <p>
            You'll answer {totalQuestions} math questions. They'll start around grade level and
            adapt as you go — getting harder when you're right, easier when you need it.
          </p>
          <div className="intro-details">
            <div className="intro-detail">
              <span className="intro-detail-icon">⏱️</span>
              <span>Takes about 5 minutes</span>
            </div>
            <div className="intro-detail">
              <span className="intro-detail-icon">🔒</span>
              <span>No grades — just finding where you are</span>
            </div>
            <div className="intro-detail">
              <span className="intro-detail-icon">🎯</span>
              <span>Questions adapt to your level</span>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startQuiz}>
            Begin Assessment
            <span className="btn-arrow">→</span>
          </button>
        </motion.div>
      </div>
    )
  }

  // --- Results Phase ---
  if (phase === 'results') {
    const pct = results.accuracy || 0
    const avgDifficulty = difficulty
    const level =
      avgDifficulty <= 2 ? 'Early Elementary' :
      avgDifficulty <= 4 ? 'Upper Elementary' :
      avgDifficulty <= 6 ? 'Middle School' : 'High School'

    return (
      <div className="diagnostic-page">
        <div className="diagnostic-bg">
          <div className="diagnostic-orb diagnostic-orb-1" />
          <div className="diagnostic-orb diagnostic-orb-2" />
        </div>
        <motion.div
          className="diagnostic-results"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="results-header">
            <div className="results-score-ring">
              <svg viewBox="0 0 120 120" className="score-ring-svg">
                <circle cx="60" cy="60" r="54" className="score-ring-bg" />
                <motion.circle
                  cx="60" cy="60" r="54"
                  className="score-ring-fill"
                  strokeDasharray={`${(pct / 100) * 339} 339`}
                  initial={{ strokeDasharray: '0 339' }}
                  animate={{ strokeDasharray: `${(pct / 100) * 339} 339` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="score-ring-text">
                <span className="score-pct">{pct}%</span>
                <span className="score-label">accuracy</span>
              </div>
            </div>
            <div className="results-summary">
              <h2>Diagnostic Complete</h2>
              <p className="results-level">
                Assessment level: <strong>{level}</strong>
              </p>
              <p className="results-detail">
                {results.correct} of {results.total} correct
              </p>
            </div>
          </div>

          {results.gaps && results.gaps.length > 0 && (
            <div className="results-gaps">
              <h3>Areas to Strengthen</h3>
              <div className="gap-tags">
                {results.gaps.map(skill => (
                  <span key={skill} className="gap-tag">
                    {skill.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="results-message card">
            <p>
              <strong>Great work completing the diagnostic!</strong> Based on your results,
              we've mapped out exactly where your foundations are strong and where there's
              room to build. Your personalized path is ready.
            </p>
          </div>

          <div className="results-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              View Your Dashboard
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/skills')}>
              Explore Skill Tree
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // --- Quiz Phase ---
  return (
    <div className="diagnostic-page">
      <div className="diagnostic-bg">
        <div className="diagnostic-orb diagnostic-orb-1" />
        <div className="diagnostic-orb diagnostic-orb-2" />
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <motion.div
            className="quiz-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(questionNum / totalQuestions) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="quiz-progress-text">
          {questionNum} / {totalQuestions}
        </span>
      </div>

      <div className="quiz-content">
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentQ.id}
              className="quiz-card"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <div className="quiz-difficulty">
                <span className="badge badge-info">
                  Level {Math.round(difficulty)}
                </span>
              </div>

              <h2 className="quiz-question">{currentQ.question}</h2>

              <div className="quiz-options">
                {currentQ.options.map((opt, i) => {
                  let className = 'quiz-option'
                  if (showFeedback && lastCorrect !== null) {
                    if (lastCorrect && i === selected) className += ' correct'
                    else if (!lastCorrect && i === selected) className += ' wrong'
                    // We don't know the correct index from server, only if our answer was correct
                    if (lastCorrect && i === selected) className += ' correct'
                  }

                  return (
                    <motion.button
                      key={i}
                      className={className}
                      onClick={() => handleAnswer(i)}
                      disabled={submitting}
                      whileHover={!submitting ? { scale: 1.02 } : {}}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="option-text">{opt}</span>
                      {showFeedback && lastCorrect && i === selected && (
                        <span className="option-icon">✓</span>
                      )}
                      {showFeedback && !lastCorrect && i === selected && (
                        <span className="option-icon">✗</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {showFeedback && lastExplanation && (
                <motion.div
                  className={`quiz-feedback ${lastCorrect ? 'feedback-correct' : 'feedback-wrong'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>{lastExplanation}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
