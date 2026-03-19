import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import './Drill.css'

const DRILL_DURATION = 7 * 60

export default function Drill() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pinnedSkillId = searchParams.get('skill') || null
  const { refreshStats } = useAuth()
  const [phase, setPhase] = useState('ready')
  const [sessionId, setSessionId] = useState(null)
  const [timeLeft, setTimeLeft] = useState(DRILL_DURATION)
  const [currentQ, setCurrentQ] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(null)
  const [lastExplanation, setLastExplanation] = useState('')
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, maxStreak: 0, credits: 0 })
  const [showStruggle, setShowStruggle] = useState(false)
  const [summary, setSummary] = useState(null)
  const [pinnedSkillLabel, setPinnedSkillLabel] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'drilling' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            completeDrill()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [phase])

  const completeDrill = useCallback(async () => {
    if (!sessionId) return
    try {
      const data = await api.drillComplete(sessionId)
      setSummary(data.summary)
      await refreshStats()
      setPhase('done')
    } catch (err) {
      console.error('Complete drill error:', err)
      setPhase('done')
    }
  }, [sessionId, refreshStats])

  const startDrill = useCallback(async () => {
    try {
      const data = await api.drillStart(pinnedSkillId ? { skillId: pinnedSkillId } : {})
      setSessionId(data.sessionId)
      setCurrentQ(data.question)
      if (data.question?.skill && pinnedSkillId) {
        setPinnedSkillLabel(pinnedSkillId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      }
      setPhase('drilling')
    } catch (err) {
      console.error('Failed to start drill:', err)
    }
  }, [pinnedSkillId])

  const handleAnswer = useCallback(async (optionIndex) => {
    if (showFeedback) return
    setSelected(optionIndex)
    setShowFeedback(true)

    try {
      const data = await api.drillAnswer({
        sessionId,
        questionId: currentQ.id,
        selectedIndex: optionIndex,
        pinnedSkillId: pinnedSkillId || undefined,
      })

      setLastCorrect(data.correct)
      setLastExplanation(data.explanation)

      setStats(prev => ({
        correct: prev.correct + (data.correct ? 1 : 0),
        total: prev.total + 1,
        streak: data.streak,
        maxStreak: Math.max(prev.maxStreak, data.streak),
        credits: prev.credits + (data.creditsAwarded || 0),
      }))

      if (data.triggerStruggle && !showStruggle) {
        setShowStruggle(true)
        setTimeout(() => setShowStruggle(false), 5000)
      }

      setTimeout(() => {
        if (data.nextQuestion) {
          setCurrentQ(data.nextQuestion)
          setSelected(null)
          setShowFeedback(false)
        } else {
          completeDrill()
        }
      }, 1200)
    } catch (err) {
      console.error('Answer error:', err)
      setShowFeedback(false)
      setSelected(null)
    }
  }, [showFeedback, currentQ, sessionId, showStruggle, completeDrill])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const pctTime = ((DRILL_DURATION - timeLeft) / DRILL_DURATION) * 100

  if (phase === 'ready') {
    return (
      <div className="drill-page">
        <div className="drill-bg"><div className="drill-orb drill-orb-1" /><div className="drill-orb drill-orb-2" /></div>
        <motion.div className="drill-ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="drill-ready-icon">⚡</div>
          <h1>7 Minute Drill</h1>
          {pinnedSkillId ? (
            <p>Focused practice on <strong>{pinnedSkillId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>. Questions adapt to your level as you go.</p>
          ) : (
            <p>Fast-paced practice. No narration, no fluff — just math. Questions adapt to your level as you go.</p>
          )}
          <div className="drill-ready-stats">
            <div className="drill-ready-stat"><span className="drill-ready-stat-val">7:00</span><span className="drill-ready-stat-label">Duration</span></div>
            <div className="drill-ready-stat"><span className="drill-ready-stat-val">∞</span><span className="drill-ready-stat-label">Questions</span></div>
            <div className="drill-ready-stat"><span className="drill-ready-stat-val">+2</span><span className="drill-ready-stat-label">Credits / Correct</span></div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startDrill}>Start Drill ⚡</button>
        </motion.div>
      </div>
    )
  }

  if (phase === 'done') {
    const s = summary || stats
    const accuracy = (s.correctCount || s.correct || 0) > 0 && (s.questionsAnswered || s.total || 0) > 0
      ? Math.round(((s.correctCount || s.correct) / (s.questionsAnswered || s.total)) * 100) : 0

    return (
      <div className="drill-page">
        <div className="drill-bg"><div className="drill-orb drill-orb-1" /><div className="drill-orb drill-orb-2" /></div>
        <motion.div className="drill-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="drill-done-icon">🎉</div>
          <h1>Drill Complete!</h1>
          <div className="drill-done-stats">
            <div className="done-stat"><span className="done-stat-value">{s.questionsAnswered || s.total}</span><span className="done-stat-label">Questions</span></div>
            <div className="done-stat"><span className="done-stat-value">{accuracy}%</span><span className="done-stat-label">Accuracy</span></div>
            <div className="done-stat"><span className="done-stat-value">{s.maxStreak || stats.maxStreak}</span><span className="done-stat-label">Best Streak</span></div>
            <div className="done-stat highlight"><span className="done-stat-value">+{s.creditsEarned || stats.credits}</span><span className="done-stat-label">Credits Earned</span></div>
          </div>
          <div className="drill-done-actions">
            <button className="btn btn-primary btn-lg" onClick={() => {
              setPhase('ready')
              setTimeLeft(DRILL_DURATION)
              setStats({ correct: 0, total: 0, streak: 0, maxStreak: 0, credits: 0 })
              setSessionId(null)
              setSummary(null)
            }}>Drill Again ⚡</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="drill-page drilling">
      <div className="drill-bg"><div className="drill-orb drill-orb-1" /><div className="drill-orb drill-orb-2" /></div>

      <div className="drill-hud">
        <div className="hud-left">
          <div className="hud-timer">
            <span className={`timer-display ${timeLeft <= 60 ? 'timer-urgent' : ''}`}>{formatTime(timeLeft)}</span>
          </div>
          <div className="hud-progress-bar">
            <motion.div className="hud-progress-fill" animate={{ width: `${pctTime}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
        <div className="hud-center">
          {stats.streak >= 3 && (
            <motion.div className="streak-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              🔥 {stats.streak} streak!
            </motion.div>
          )}
        </div>
        <div className="hud-right">
          <div className="hud-score">
            <span className="hud-correct">{stats.correct}</span>
            <span className="hud-divider">/</span>
            <span className="hud-total">{stats.total}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStruggle && (
          <motion.div className="struggle-banner" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="struggle-content">
              <span className="struggle-icon">💚</span>
              <div>
                <p className="struggle-title">It looks like you're finding this challenging.</p>
                <p className="struggle-text">That's okay — we've sent a notification to your teacher so you can get the help you need. Let's try some easier ones.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="drill-content">
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div key={currentQ.id + '-' + stats.total} className="drill-question-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <h2 className="drill-question">{currentQ.question}</h2>
              <div className="drill-options">
                {currentQ.options.map((opt, i) => {
                  let cls = 'drill-option'
                  if (showFeedback && lastCorrect && i === selected) cls += ' correct'
                  else if (showFeedback && !lastCorrect && i === selected) cls += ' wrong'
                  return (
                    <motion.button key={i} className={cls} onClick={() => handleAnswer(i)}
                      whileHover={!showFeedback ? { scale: 1.03 } : {}} whileTap={!showFeedback ? { scale: 0.97 } : {}}>
                      {opt}
                    </motion.button>
                  )
                })}
              </div>
              {showFeedback && lastExplanation && (
                <motion.div className={`drill-feedback ${lastCorrect ? 'correct' : 'wrong'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {lastExplanation}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
