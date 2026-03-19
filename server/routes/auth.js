import { Router } from 'express'
import bcrypt from 'bcrypt'
import { queryOne, queryAll } from '../db.js'
import { generateToken, requireAuth } from '../auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, gradeLevel } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    // Check if user already exists
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await queryOne(
      `INSERT INTO users (email, password_hash, name, grade_level)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, grade_level, role, created_at`,
      [email, passwordHash, name, gradeLevel || 5]
    )

    const token = generateToken(user)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await queryOne(
      'SELECT id, email, name, grade_level, role, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const { password_hash, ...userData } = user
    const token = generateToken(userData)
    res.json({ token, user: userData })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me — get current user + stats
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await queryOne(
      'SELECT id, email, name, grade_level, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get stats
    const skillStats = await queryOne(
      `SELECT
        COUNT(*) FILTER (WHERE mastered = true) as mastered_count,
        COUNT(*) as tracked_count
       FROM student_skill_progress WHERE user_id = $1`,
      [req.user.id]
    )

    const creditBalance = await queryOne(
      'SELECT COALESCE(SUM(amount), 0) as balance FROM credit_events WHERE user_id = $1',
      [req.user.id]
    )

    const drillStats = await queryOne(
      `SELECT COUNT(*) as total_drills,
              COALESCE(SUM(questions_answered), 0) as total_questions,
              COALESCE(SUM(correct_count), 0) as total_correct
       FROM drill_sessions WHERE user_id = $1 AND status = 'completed'`,
      [req.user.id]
    )

    const milestones = await queryAll(
      'SELECT milestone_id FROM milestone_completions WHERE user_id = $1',
      [req.user.id]
    )

    res.json({
      user,
      stats: {
        conceptsMastered: parseInt(skillStats?.mastered_count || 0),
        creditBalance: parseInt(creditBalance?.balance || 0),
        drillsCompleted: parseInt(drillStats?.total_drills || 0),
        totalQuestions: parseInt(drillStats?.total_questions || 0),
        totalCorrect: parseInt(drillStats?.total_correct || 0),
        milestonesEarned: milestones.map(m => m.milestone_id),
      }
    })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

export default router
