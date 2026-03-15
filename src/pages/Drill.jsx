import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuestionsByDifficulty, pickAdaptiveQuestion } from '../data/questions'
import './Drill.css'

const DRILL_DURATION = 7 * 60 // 7 minutes in seconds

export default function Drill() {
    const navigate = useNavigate()
    const [phase, setPhase] = useState('ready') // ready | drilling | done | struggle
    const [timeLeft, setTimeLeft] = useState(DRILL_DURATION)
    const [currentQ, setCurrentQ] = useState(null)
    const [selected, setSelected] = useState(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [answeredIds, setAnsweredIds] = useState([])
    const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, maxStreak: 0, wrongStreak: 0 })
    const [difficulty, setDifficulty] = useState(4)
    const [showStruggle, setShowStruggle] = useState(false)
    const timerRef = useRef(null)

    // Timer
    useEffect(() => {
        if (phase === 'drilling' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current)
                        setPhase('done')
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timerRef.current)
        }
    }, [phase, timeLeft])

    const startDrill = useCallback(() => {
        const q = pickAdaptiveQuestion(difficulty, [])
        setCurrentQ(q)
        setPhase('drilling')
    }, [difficulty])

    const handleAnswer = useCallback((optionIndex) => {
        if (showFeedback) return
        setSelected(optionIndex)
        setShowFeedback(true)

        const isCorrect = optionIndex === currentQ.correct
        const newStreak = isCorrect ? stats.streak + 1 : 0
        const newWrongStreak = isCorrect ? 0 : stats.wrongStreak + 1
        const creditsEarned = isCorrect ? (newStreak >= 3 ? 3 : 2) : 0

        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
            streak: newStreak,
            maxStreak: Math.max(prev.maxStreak, newStreak),
            wrongStreak: newWrongStreak,
            credits: (prev.credits || 0) + creditsEarned,
        }))

        // Adapt difficulty
        const newDiff = isCorrect
            ? Math.min(8, difficulty + 0.4)
            : Math.max(1, difficulty - 0.6)
        setDifficulty(newDiff)

        const newAnswered = [...answeredIds, currentQ.id]
        setAnsweredIds(newAnswered)

        // Struggle detection: 3 wrong in a row
        if (newWrongStreak >= 3 && !showStruggle) {
            setShowStruggle(true)
            setTimeout(() => {
                setShowStruggle(false)
            }, 5000)
        }

        setTimeout(() => {
            const next = pickAdaptiveQuestion(newDiff, newAnswered)
            if (!next) {
                setPhase('done')
                return
            }
            setCurrentQ(next)
            setSelected(null)
            setShowFeedback(false)
        }, 1200)
    }, [showFeedback, currentQ, stats, difficulty, answeredIds, showStruggle])

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    const pctTime = ((DRILL_DURATION - timeLeft) / DRILL_DURATION) * 100

    // --- Ready Phase ---
    if (phase === 'ready') {
        return (
            <div className="drill-page">
                <div className="drill-bg">
                    <div className="drill-orb drill-orb-1" />
                    <div className="drill-orb drill-orb-2" />
                </div>
                <motion.div
                    className="drill-ready"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="drill-ready-icon">⚡</div>
                    <h1>7 Minute Drill</h1>
                    <p>
                        Fast-paced practice. No narration, no fluff — just math.
                        Questions adapt to your level as you go.
                    </p>
                    <div className="drill-ready-stats">
                        <div className="drill-ready-stat">
                            <span className="drill-ready-stat-val">7:00</span>
                            <span className="drill-ready-stat-label">Duration</span>
                        </div>
                        <div className="drill-ready-stat">
                            <span className="drill-ready-stat-val">∞</span>
                            <span className="drill-ready-stat-label">Questions</span>
                        </div>
                        <div className="drill-ready-stat">
                            <span className="drill-ready-stat-val">+2</span>
                            <span className="drill-ready-stat-label">Credits / Correct</span>
                        </div>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={startDrill}>
                        Start Drill ⚡
                    </button>
                </motion.div>
            </div>
        )
    }

    // --- Done Phase ---
    if (phase === 'done') {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
        const credits = stats.credits || 0

        return (
            <div className="drill-page">
                <div className="drill-bg">
                    <div className="drill-orb drill-orb-1" />
                    <div className="drill-orb drill-orb-2" />
                </div>
                <motion.div
                    className="drill-done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="drill-done-icon">🎉</div>
                    <h1>Drill Complete!</h1>

                    <div className="drill-done-stats">
                        <div className="done-stat">
                            <span className="done-stat-value">{stats.total}</span>
                            <span className="done-stat-label">Questions</span>
                        </div>
                        <div className="done-stat">
                            <span className="done-stat-value">{accuracy}%</span>
                            <span className="done-stat-label">Accuracy</span>
                        </div>
                        <div className="done-stat">
                            <span className="done-stat-value">{stats.maxStreak}</span>
                            <span className="done-stat-label">Best Streak</span>
                        </div>
                        <div className="done-stat highlight">
                            <span className="done-stat-value">+{credits}</span>
                            <span className="done-stat-label">Credits Earned</span>
                        </div>
                    </div>

                    <div className="drill-done-actions">
                        <button className="btn btn-primary btn-lg" onClick={() => {
                            setPhase('ready')
                            setTimeLeft(DRILL_DURATION)
                            setStats({ correct: 0, total: 0, streak: 0, maxStreak: 0, wrongStreak: 0 })
                            setAnsweredIds([])
                            setDifficulty(4)
                        }}>
                            Drill Again ⚡
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // --- Drilling Phase ---
    return (
        <div className="drill-page drilling">
            <div className="drill-bg">
                <div className="drill-orb drill-orb-1" />
                <div className="drill-orb drill-orb-2" />
            </div>

            {/* HUD */}
            <div className="drill-hud">
                <div className="hud-left">
                    <div className="hud-timer">
                        <span className={`timer-display ${timeLeft <= 60 ? 'timer-urgent' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="hud-progress-bar">
                        <motion.div
                            className="hud-progress-fill"
                            animate={{ width: `${pctTime}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                <div className="hud-center">
                    {stats.streak >= 3 && (
                        <motion.div
                            className="streak-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
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

            {/* Struggle detection */}
            <AnimatePresence>
                {showStruggle && (
                    <motion.div
                        className="struggle-banner"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="struggle-content">
                            <span className="struggle-icon">💚</span>
                            <div>
                                <p className="struggle-title">It looks like you're finding this challenging.</p>
                                <p className="struggle-text">
                                    That's okay — we've sent a notification to your teacher so you can get the help you need.
                                    Let's try some easier ones.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Question */}
            <div className="drill-content">
                <AnimatePresence mode="wait">
                    {currentQ && (
                        <motion.div
                            key={currentQ.id + '-' + stats.total}
                            className="drill-question-card"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h2 className="drill-question">{currentQ.question}</h2>

                            <div className="drill-options">
                                {currentQ.options.map((opt, i) => {
                                    let cls = 'drill-option'
                                    if (showFeedback && i === currentQ.correct) cls += ' correct'
                                    else if (showFeedback && i === selected && i !== currentQ.correct) cls += ' wrong'

                                    return (
                                        <motion.button
                                            key={i}
                                            className={cls}
                                            onClick={() => handleAnswer(i)}
                                            whileHover={!showFeedback ? { scale: 1.03 } : {}}
                                            whileTap={!showFeedback ? { scale: 0.97 } : {}}
                                        >
                                            {opt}
                                        </motion.button>
                                    )
                                })}
                            </div>

                            {showFeedback && (
                                <motion.div
                                    className={`drill-feedback ${selected === currentQ.correct ? 'correct' : 'wrong'}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {currentQ.explanation}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
