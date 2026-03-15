import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pickAdaptiveQuestion } from '../data/questions'
import './Diagnostic.css'

const TOTAL_QUESTIONS = 15

export default function Diagnostic() {
    const navigate = useNavigate()
    const [phase, setPhase] = useState('intro') // intro | quiz | results
    const [currentQ, setCurrentQ] = useState(null)
    const [questionNum, setQuestionNum] = useState(0)
    const [difficulty, setDifficulty] = useState(5) // Start at grade 5
    const [answeredIds, setAnsweredIds] = useState([])
    const [selected, setSelected] = useState(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [results, setResults] = useState({ correct: 0, total: 0, history: [] })

    const startQuiz = useCallback(() => {
        const first = pickAdaptiveQuestion(5, [])
        setCurrentQ(first)
        setQuestionNum(1)
        setPhase('quiz')
    }, [])

    const handleAnswer = useCallback((optionIndex) => {
        if (showFeedback) return
        setSelected(optionIndex)
        setShowFeedback(true)

        const isCorrect = optionIndex === currentQ.correct
        const newHistory = [...results.history, {
            question: currentQ,
            selectedAnswer: optionIndex,
            correct: isCorrect,
        }]

        const newResults = {
            correct: results.correct + (isCorrect ? 1 : 0),
            total: results.total + 1,
            history: newHistory,
        }
        setResults(newResults)

        // Adjust difficulty: go harder if right, easier if wrong
        const newDifficulty = isCorrect
            ? Math.min(8, difficulty + 0.7)
            : Math.max(1, difficulty - 1)
        setDifficulty(newDifficulty)

        const newAnswered = [...answeredIds, currentQ.id]
        setAnsweredIds(newAnswered)

        setTimeout(() => {
            if (questionNum >= TOTAL_QUESTIONS) {
                setPhase('results')
            } else {
                const next = pickAdaptiveQuestion(newDifficulty, newAnswered)
                setCurrentQ(next)
                setQuestionNum(prev => prev + 1)
                setSelected(null)
                setShowFeedback(false)
            }
        }, 1500)
    }, [showFeedback, currentQ, results, difficulty, answeredIds, questionNum])

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
                        You'll answer {TOTAL_QUESTIONS} math questions. They'll start around grade level and
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
        const pct = Math.round((results.correct / results.total) * 100)
        const avgDifficulty = results.history.reduce((sum, h) => sum + h.question.difficulty, 0) / results.total
        const level =
            avgDifficulty <= 2 ? 'Early Elementary' :
                avgDifficulty <= 4 ? 'Upper Elementary' :
                    avgDifficulty <= 6 ? 'Middle School' : 'High School'

        // Find skill gaps
        const wrongBySkill = {}
        results.history.filter(h => !h.correct).forEach(h => {
            wrongBySkill[h.question.skill] = (wrongBySkill[h.question.skill] || 0) + 1
        })
        const gapSkills = Object.keys(wrongBySkill)

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

                    {gapSkills.length > 0 && (
                        <div className="results-gaps">
                            <h3>Areas to Strengthen</h3>
                            <div className="gap-tags">
                                {gapSkills.map(skill => (
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

            {/* Progress */}
            <div className="quiz-progress">
                <div className="quiz-progress-bar">
                    <motion.div
                        className="quiz-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(questionNum / TOTAL_QUESTIONS) * 100}%` }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>
                <span className="quiz-progress-text">
                    {questionNum} / {TOTAL_QUESTIONS}
                </span>
            </div>

            {/* Question */}
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
                                    if (showFeedback && i === currentQ.correct) className += ' correct'
                                    else if (showFeedback && i === selected && i !== currentQ.correct) className += ' wrong'
                                    else if (selected === i) className += ' selected'

                                    return (
                                        <motion.button
                                            key={i}
                                            className={className}
                                            onClick={() => handleAnswer(i)}
                                            whileHover={!showFeedback ? { scale: 1.02 } : {}}
                                            whileTap={!showFeedback ? { scale: 0.98 } : {}}
                                        >
                                            <span className="option-letter">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span className="option-text">{opt}</span>
                                            {showFeedback && i === currentQ.correct && (
                                                <span className="option-icon">✓</span>
                                            )}
                                            {showFeedback && i === selected && i !== currentQ.correct && (
                                                <span className="option-icon">✗</span>
                                            )}
                                        </motion.button>
                                    )
                                })}
                            </div>

                            {showFeedback && (
                                <motion.div
                                    className={`quiz-feedback ${selected === currentQ.correct ? 'feedback-correct' : 'feedback-wrong'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p>{currentQ.explanation}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
