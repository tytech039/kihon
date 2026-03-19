import { Router } from 'express'
import { queryAll } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

// GET /api/skills/tree — full skill tree with edges
router.get('/tree', async (req, res) => {
  try {
    const skills = await queryAll('SELECT id, label, grade_level, x, y FROM skills ORDER BY grade_level, id')
    const edges = await queryAll('SELECT from_skill AS "from", to_skill AS "to" FROM skill_edges')

    res.json({ skills, edges })
  } catch (err) {
    console.error('Skills tree error:', err)
    res.status(500).json({ error: 'Failed to fetch skill tree' })
  }
})

// GET /api/skills/progress — student's mastery state per skill
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const progress = await queryAll(
      `SELECT
         s.id AS skill_id,
         s.label,
         s.grade_level,
         COALESCE(sp.total_attempts, 0) AS total_attempts,
         COALESCE(sp.correct_attempts, 0) AS correct_attempts,
         COALESCE(sp.mastered, false) AS mastered,
         sp.mastered_at
       FROM skills s
       LEFT JOIN student_skill_progress sp ON sp.skill_id = s.id AND sp.user_id = $1
       ORDER BY s.grade_level, s.id`,
      [req.user.id]
    )

    // Determine in-progress skills (prerequisites met but not mastered)
    const masteredIds = progress.filter(p => p.mastered).map(p => p.skill_id)
    const edges = await queryAll('SELECT from_skill, to_skill FROM skill_edges')

    const prereqMap = {}
    for (const e of edges) {
      if (!prereqMap[e.to_skill]) prereqMap[e.to_skill] = []
      prereqMap[e.to_skill].push(e.from_skill)
    }

    const enriched = progress.map(p => {
      const prereqs = prereqMap[p.skill_id] || []
      const prereqsMet = prereqs.every(pid => masteredIds.includes(pid))
      let status = 'locked'
      if (p.mastered) status = 'mastered'
      else if (prereqsMet) status = 'in-progress'

      return { ...p, status, prerequisites: prereqs }
    })

    res.json({ progress: enriched })
  } catch (err) {
    console.error('Skills progress error:', err)
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

export default router
