import { Router } from 'express'
import { queryOne, queryAll, query } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

const DIAGNOSTIC_QUESTIONS = 15

// Adaptive question picker — server-side, never exposes correct answer before submission
async function pickAdaptiveQuestion(targetDifficulty, answeredIds) {
  const placeholders = answeredIds.length > 0
    ? `AND id NOT IN (${answeredIds.map((_, i) => `$${i + 2}`).join(', ')})`
    : ''

  const params = [targetDifficulty, ...answeredIds]

  const rows = await queryAll(
    `SELECT id, skill_id, difficulty, question, options
     FROM questions
     WHERE TRUE ${placeholders}
     ORDER BY ABS(difficulty - $1)
     LIMIT 3`,
    params
  )

  if (rows.length === 0) return null
  return rows[Math.floor(Math.random() * rows.length)]
}

// POST /api/diagnostic/start
router.post('/start', requireAuth, async (req, res) => {
  try {
    const session = await queryOne(
      `INSERT INTO diagnostic_sessions (user_id, current_difficulty)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, 5.0]
    )

    const question = await pickAdaptiveQuestion(5.0, [])
    if (!question) {
      return res.status(500).json({ error: 'No questions available' })
    }

    res.json({
      sessionId: session.id,
      totalQuestions: DIAGNOSTIC_QUESTIONS,
      questionNumber: 1,
      question: {
        id: question.id,
        skill: question.skill_id,
        difficulty: question.difficulty,
        question: question.question,
        options: question.options,
      }
    })
  } catch (err) {
    console.error('Diagnostic start error:', err)
    res.status(500).json({ error: 'Failed to start diagnostic' })
  }
})

// POST /api/diagnostic/answer
router.post('/answer', requireAuth, async (req, res) => {
  try {
    const { sessionId, questionId, selectedIndex } = req.body

    // Get session
    const session = await queryOne(
      'SELECT * FROM diagnostic_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )

    if (!session || session.status !== 'in_progress') {
      return res.status(400).json({ error: 'Invalid or completed session' })
    }

    // Get question with correct answer
    const question = await queryOne('SELECT * FROM questions WHERE id = $1', [questionId])
    if (!question) {
      return res.status(400).json({ error: 'Invalid question' })
    }

    const correct = selectedIndex === question.correct_index

    // Record answer
    await query(
      `INSERT INTO diagnostic_answers (session_id, question_id, selected_index, correct)
       VALUES ($1, $2, $3, $4)`,
      [sessionId, questionId, selectedIndex, correct]
    )

    // Update session difficulty
    const newDifficulty = correct
      ? Math.min(8, session.current_difficulty + 0.7)
      : Math.max(1, session.current_difficulty - 1)

    const newCount = session.questions_answered + 1
    const newCorrect = session.correct_count + (correct ? 1 : 0)

    await query(
      `UPDATE diagnostic_sessions
       SET current_difficulty = $1, questions_answered = $2, correct_count = $3
       WHERE id = $4`,
      [newDifficulty, newCount, newCorrect, sessionId]
    )

    // Update skill progress
    await query(
      `INSERT INTO student_skill_progress (user_id, skill_id, total_attempts, correct_attempts)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT (user_id, skill_id) DO UPDATE SET
         total_attempts = student_skill_progress.total_attempts + 1,
         correct_attempts = student_skill_progress.correct_attempts + $3,
         updated_at = NOW()`,
      [req.user.id, question.skill_id, correct ? 1 : 0]
    )

    // Check if skill should be mastered
    const progress = await queryOne(
      'SELECT total_attempts, correct_attempts FROM student_skill_progress WHERE user_id = $1 AND skill_id = $2',
      [req.user.id, question.skill_id]
    )
    if (progress && progress.total_attempts >= 5) {
      const accuracy = progress.correct_attempts / progress.total_attempts
      if (accuracy >= 0.8) {
        await query(
          'UPDATE student_skill_progress SET mastered = true, mastered_at = NOW() WHERE user_id = $1 AND skill_id = $2',
          [req.user.id, question.skill_id]
        )
      }
    }

    // Check if done
    if (newCount >= DIAGNOSTIC_QUESTIONS) {
      await query(
        "UPDATE diagnostic_sessions SET status = 'completed', completed_at = NOW() WHERE id = $1",
        [sessionId]
      )

      return res.json({
        correct,
        explanation: question.explanation,
        done: true,
        results: {
          sessionId,
          total: newCount,
          correct: newCorrect,
          accuracy: Math.round((newCorrect / newCount) * 100),
        }
      })
    }

    // Pick next question
    const answered = await queryAll(
      'SELECT question_id FROM diagnostic_answers WHERE session_id = $1',
      [sessionId]
    )
    const answeredIds = answered.map(a => a.question_id)

    const next = await pickAdaptiveQuestion(newDifficulty, answeredIds)

    res.json({
      correct,
      explanation: question.explanation,
      done: false,
      questionNumber: newCount + 1,
      difficulty: Math.round(newDifficulty),
      nextQuestion: next ? {
        id: next.id,
        skill: next.skill_id,
        difficulty: next.difficulty,
        question: next.question,
        options: next.options,
      } : null,
    })
  } catch (err) {
    console.error('Diagnostic answer error:', err)
    res.status(500).json({ error: 'Failed to process answer' })
  }
})

// GET /api/diagnostic/results/:id
router.get('/results/:id', requireAuth, async (req, res) => {
  try {
    const session = await queryOne(
      'SELECT * FROM diagnostic_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const answers = await queryAll(
      `SELECT da.*, q.skill_id, q.difficulty, q.question
       FROM diagnostic_answers da
       JOIN questions q ON q.id = da.question_id
       WHERE da.session_id = $1
       ORDER BY da.answered_at`,
      [req.params.id]
    )

    // Find gap skills
    const wrongBySkill = {}
    for (const a of answers) {
      if (!a.correct) {
        wrongBySkill[a.skill_id] = (wrongBySkill[a.skill_id] || 0) + 1
      }
    }

    res.json({
      session,
      answers,
      gaps: Object.keys(wrongBySkill),
      accuracy: session.questions_answered > 0
        ? Math.round((session.correct_count / session.questions_answered) * 100)
        : 0,
    })
  } catch (err) {
    console.error('Diagnostic results error:', err)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
})

export default router
