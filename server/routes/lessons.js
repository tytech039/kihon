import { Router } from 'express'
import { queryOne } from '../db.js'
import { requireAuth } from '../auth.js'
import { generateLesson } from '../lessonGenerator.js'

const router = Router()

function gradeBand(grade) {
  if (grade <= 3) return 1
  if (grade <= 6) return 2
  if (grade <= 8) return 3
  return 4
}

// GET /api/lessons/:skillId
router.get('/:skillId', requireAuth, async (req, res) => {
  try {
    const { skillId } = req.params

    // Fetch skill and user grade in parallel
    const [skill, userRow] = await Promise.all([
      queryOne('SELECT * FROM skills WHERE id = $1', [skillId]),
      queryOne('SELECT grade_level FROM users WHERE id = $1', [req.user.id]),
    ])

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' })
    }

    const userGrade = userRow?.grade_level || skill.grade_level
    const band = gradeBand(userGrade)

    // Check for cached lesson for this skill + grade band
    let lesson = await queryOne(
      'SELECT * FROM lessons WHERE skill_id = $1 AND difficulty_level = $2 ORDER BY generated_at DESC LIMIT 1',
      [skillId, band]
    )

    if (!lesson) {
      try {
        lesson = await generateLesson(skill, userGrade)
      } catch (err) {
        console.error('Lesson generation error:', err)
        return res.json({
          lesson: {
            skill_id: skillId,
            type: 'fallback',
            title: `Learning: ${skill.label}`,
            content: `# ${skill.label}\n\nThis lesson is being generated. Please check back shortly.\n\nIn the meantime, try practicing this skill in a **7 Minute Drill**!`,
            difficulty_level: band,
          }
        })
      }
    }

    res.json({ lesson })
  } catch (err) {
    console.error('Lessons error:', err)
    res.status(500).json({ error: 'Failed to fetch lesson' })
  }
})

export default router
