import { Router } from 'express'
import { queryOne, queryAll, query } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

// Adaptive question picker for drills
// pinnedSkillId: restrict to a single skill (skill-specific drill from a lesson)
async function pickDrillQuestion(userId, targetDifficulty, answeredIds, pinnedSkillId = null) {
  const excludeClause = answeredIds.length > 0
    ? `AND q.id NOT IN (${answeredIds.map((_, i) => `$${i + 3}`).join(', ')})`
    : ''

  if (pinnedSkillId) {
    const params = [Math.round(targetDifficulty), pinnedSkillId, ...answeredIds]
    const rows = await queryAll(
      `SELECT q.id, q.skill_id, q.difficulty, q.question, q.options
       FROM questions q
       WHERE q.skill_id = $2 ${excludeClause}
       ORDER BY ABS(q.difficulty - $1), RANDOM()
       LIMIT 3`,
      params
    )
    // If all questions for this skill are exhausted, allow repeats
    if (rows.length === 0) {
      const fallback = await queryAll(
        `SELECT id, skill_id, difficulty, question, options
         FROM questions WHERE skill_id = $1
         ORDER BY RANDOM() LIMIT 1`,
        [pinnedSkillId]
      )
      return fallback[0] || null
    }
    return rows[Math.floor(Math.random() * rows.length)]
  }

  // General drill — fetch edges, mastered skills, and all skills in parallel
  const [edges, mastered, allSkills] = await Promise.all([
    queryAll('SELECT from_skill, to_skill FROM skill_edges'),
    queryAll(
      'SELECT skill_id FROM student_skill_progress WHERE user_id = $1 AND mastered = true',
      [userId]
    ),
    queryAll('SELECT id FROM skills'),
  ])

  const masteredIds = mastered.map(m => m.skill_id)

  const prereqMap = {}
  for (const e of edges) {
    if (!prereqMap[e.to_skill]) prereqMap[e.to_skill] = []
    prereqMap[e.to_skill].push(e.from_skill)
  }

  const inProgressSkills = allSkills
    .filter(s => !masteredIds.includes(s.id))
    .filter(s => {
      const prereqs = prereqMap[s.id] || []
      return prereqs.every(p => masteredIds.includes(p))
    })
    .map(s => s.id)

  const params = [Math.round(targetDifficulty), inProgressSkills.length > 0 ? inProgressSkills : allSkills.map(s => s.id), ...answeredIds]

  const rows = await queryAll(
    `SELECT q.id, q.skill_id, q.difficulty, q.question, q.options
     FROM questions q
     WHERE q.skill_id = ANY($2) ${excludeClause}
     ORDER BY ABS(q.difficulty - $1), RANDOM()
     LIMIT 3`,
    params
  )

  if (rows.length === 0) {
    const fallback = await queryAll(
      `SELECT id, skill_id, difficulty, question, options
       FROM questions
       WHERE id NOT IN (${answeredIds.map((_, i) => `$${i + 1}`).join(', ') || "''"})
       ORDER BY RANDOM() LIMIT 1`,
      answeredIds.length > 0 ? answeredIds : []
    )
    return fallback[0] || null
  }

  return rows[Math.floor(Math.random() * rows.length)]
}

// POST /api/drill/start
router.post('/start', requireAuth, async (req, res) => {
  try {
    const { skillId } = req.body

    const session = await queryOne(
      `INSERT INTO drill_sessions (user_id, current_difficulty)
       VALUES ($1, 4.0)
       RETURNING *`,
      [req.user.id]
    )

    const question = await pickDrillQuestion(req.user.id, 4.0, [], skillId || null)

    res.json({
      sessionId: session.id,
      pinnedSkillId: skillId || null,
      question: question ? {
        id: question.id,
        skill: question.skill_id,
        difficulty: question.difficulty,
        question: question.question,
        options: question.options,
      } : null,
    })
  } catch (err) {
    console.error('Drill start error:', err)
    res.status(500).json({ error: 'Failed to start drill' })
  }
})

// POST /api/drill/answer
router.post('/answer', requireAuth, async (req, res) => {
  try {
    const { sessionId, questionId, selectedIndex, pinnedSkillId } = req.body

    // Fetch session and question in parallel
    const [session, question] = await Promise.all([
      queryOne('SELECT * FROM drill_sessions WHERE id = $1 AND user_id = $2', [sessionId, req.user.id]),
      queryOne('SELECT * FROM questions WHERE id = $1', [questionId]),
    ])

    if (!session || session.status !== 'in_progress') {
      return res.status(400).json({ error: 'Invalid or completed session' })
    }
    if (!question) {
      return res.status(400).json({ error: 'Invalid question' })
    }

    const correct = selectedIndex === question.correct_index
    const newStreak = correct ? session.streak + 1 : 0
    const creditsAwarded = correct ? (newStreak >= 3 ? 3 : 2) : 0
    const wrongStreak = correct ? 0 : (session.streak <= 0 ? Math.abs(session.streak) + 1 : 1)
    const newDifficulty = correct
      ? Math.min(8, session.current_difficulty + 0.4)
      : Math.max(1, session.current_difficulty - 0.6)
    const newCount = session.questions_answered + 1
    const newCorrect = session.correct_count + (correct ? 1 : 0)

    // Run all writes in parallel; get skill progress back via RETURNING
    const [, , , progressRow] = await Promise.all([
      query(
        `INSERT INTO drill_answers (session_id, question_id, selected_index, correct, credits_awarded)
         VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, questionId, selectedIndex, correct, creditsAwarded]
      ),
      creditsAwarded > 0
        ? query(
            `INSERT INTO credit_events (user_id, amount, reason, reference_type, reference_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id, creditsAwarded, `Drill answer (${newStreak >= 3 ? 'streak bonus' : 'correct'})`, 'drill_answer', session.id]
          )
        : Promise.resolve(),
      query(
        `UPDATE drill_sessions SET
          current_difficulty = $1,
          questions_answered = $2,
          correct_count = $3,
          streak = $4,
          max_streak = GREATEST(max_streak, $5),
          credits_earned = credits_earned + $6
         WHERE id = $7`,
        [newDifficulty, newCount, newCorrect, correct ? newStreak : -wrongStreak, newStreak, creditsAwarded, sessionId]
      ),
      queryOne(
        `INSERT INTO student_skill_progress (user_id, skill_id, total_attempts, correct_attempts)
         VALUES ($1, $2, 1, $3)
         ON CONFLICT (user_id, skill_id) DO UPDATE SET
           total_attempts = student_skill_progress.total_attempts + 1,
           correct_attempts = student_skill_progress.correct_attempts + $3,
           updated_at = NOW()
         RETURNING total_attempts, correct_attempts, mastered`,
        [req.user.id, question.skill_id, correct ? 1 : 0]
      ),
    ])

    // Determine mastery, fetch answered IDs in parallel
    const shouldMaster = progressRow &&
      progressRow.total_attempts >= 5 &&
      !progressRow.mastered &&
      (progressRow.correct_attempts / progressRow.total_attempts) >= 0.8

    const triggerStruggle = wrongStreak >= 3
    const pickDifficulty = triggerStruggle ? Math.max(1, newDifficulty - 2) : newDifficulty

    const [answered] = await Promise.all([
      queryAll('SELECT question_id FROM drill_answers WHERE session_id = $1', [sessionId]),
      shouldMaster
        ? Promise.all([
            query(
              'UPDATE student_skill_progress SET mastered = true, mastered_at = NOW() WHERE user_id = $1 AND skill_id = $2',
              [req.user.id, question.skill_id]
            ),
            query(
              `INSERT INTO credit_events (user_id, amount, reason, reference_type, reference_id)
               VALUES ($1, 10, $2, 'mastery', $3)`,
              [req.user.id, `Mastered: ${question.skill_id}`, session.id]
            ),
          ])
        : Promise.resolve(),
    ])

    const answeredIds = answered.map(a => a.question_id)
    const next = await pickDrillQuestion(req.user.id, pickDifficulty, answeredIds, pinnedSkillId || null)

    res.json({
      correct,
      explanation: question.explanation,
      creditsAwarded,
      streak: correct ? newStreak : 0,
      triggerStruggle,
      newlyMastered: shouldMaster ? question.skill_id : null,
      nextQuestion: next ? {
        id: next.id,
        skill: next.skill_id,
        difficulty: next.difficulty,
        question: next.question,
        options: next.options,
      } : null,
    })
  } catch (err) {
    console.error('Drill answer error:', err)
    res.status(500).json({ error: 'Failed to process answer' })
  }
})

// POST /api/drill/complete
router.post('/complete', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body

    const session = await queryOne(
      'SELECT * FROM drill_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    await query(
      "UPDATE drill_sessions SET status = 'completed', completed_at = NOW() WHERE id = $1",
      [sessionId]
    )

    // Check milestones
    const milestonesUnlocked = await checkMilestones(req.user.id)

    res.json({
      summary: {
        questionsAnswered: session.questions_answered,
        correctCount: session.correct_count,
        accuracy: session.questions_answered > 0 ? Math.round((session.correct_count / session.questions_answered) * 100) : 0,
        maxStreak: session.max_streak,
        creditsEarned: session.credits_earned,
      },
      milestonesUnlocked,
    })
  } catch (err) {
    console.error('Drill complete error:', err)
    res.status(500).json({ error: 'Failed to complete drill' })
  }
})

// Check and award milestones
async function checkMilestones(userId) {
  const milestones = [
    { id: 'first-drill', check: async () => {
      const r = await queryOne("SELECT COUNT(*) as c FROM drill_sessions WHERE user_id = $1 AND status = 'completed'", [userId])
      return parseInt(r.c) >= 1
    }, credits: 10 },
    { id: 'streak-3', check: async () => {
      const r = await queryOne("SELECT COUNT(*) as c FROM drill_sessions WHERE user_id = $1 AND status = 'completed'", [userId])
      return parseInt(r.c) >= 3
    }, credits: 25 },
    { id: 'master-5', check: async () => {
      const r = await queryOne('SELECT COUNT(*) as c FROM student_skill_progress WHERE user_id = $1 AND mastered = true', [userId])
      return parseInt(r.c) >= 5
    }, credits: 50 },
    { id: 'master-10', check: async () => {
      const r = await queryOne('SELECT COUNT(*) as c FROM student_skill_progress WHERE user_id = $1 AND mastered = true', [userId])
      return parseInt(r.c) >= 10
    }, credits: 100 },
  ]

  const unlocked = []
  for (const m of milestones) {
    const already = await queryOne(
      'SELECT id FROM milestone_completions WHERE user_id = $1 AND milestone_id = $2',
      [userId, m.id]
    )
    if (already) continue

    const met = await m.check()
    if (met) {
      await query(
        'INSERT INTO milestone_completions (user_id, milestone_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, m.id]
      )
      await query(
        `INSERT INTO credit_events (user_id, amount, reason, reference_type)
         VALUES ($1, $2, $3, 'milestone')`,
        [userId, m.credits, `Milestone: ${m.id}`]
      )
      unlocked.push(m.id)
    }
  }

  return unlocked
}

export default router
