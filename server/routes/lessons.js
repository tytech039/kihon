import { Router } from 'express'
import { queryOne } from '../db.js'
import { requireAuth } from '../auth.js'
import { generateLesson } from '../lessonGenerator.js'

const router = Router()

// GET /api/lessons/:skillId
router.get('/:skillId', requireAuth, async (req, res) => {
  try {
    const { skillId } = req.params

    // Check if skill exists
    const skill = await queryOne('SELECT * FROM skills WHERE id = $1', [skillId])
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' })
    }

    // Check for cached lesson
    let lesson = await queryOne(
      'SELECT * FROM lessons WHERE skill_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [skillId]
    )

    // Generate if not cached
    if (!lesson) {
      try {
        lesson = await generateLesson(skill)
      } catch (err) {
        console.error('Lesson generation error:', err)
        // Return a basic fallback lesson
        return res.json({
          lesson: {
            skill_id: skillId,
            type: 'fallback',
            title: `Learning: ${skill.label}`,
            content: getFallbackContent(skill),
            difficulty_level: skill.grade_level,
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

function getFallbackContent(skill) {
  return `# ${skill.label}\n\nThis lesson is being generated. Please check back shortly.\n\n**Grade Level:** ${skill.grade_level}\n\nIn the meantime, try practicing this skill in a 7 Minute Drill!`
}

export default router
