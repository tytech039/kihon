import { Router } from 'express'
import { queryOne, queryAll, query } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

// Milestone definitions (shared with frontend)
const milestoneDefinitions = [
  { id: 'first-drill', title: 'First Steps', description: 'Complete your first 7-minute drill', icon: '🎯', drillsRequired: 1, conceptsRequired: 0, reward: '10 Gold Credits' },
  { id: 'streak-3', title: 'Getting Warmed Up', description: 'Complete 3 drills', icon: '🔥', drillsRequired: 3, conceptsRequired: 0, reward: '25 Gold Credits' },
  { id: 'master-5', title: 'Foundation Builder', description: 'Master 5 concepts', icon: '🧱', drillsRequired: 0, conceptsRequired: 5, reward: 'Kihon Sticker Pack' },
  { id: 'master-10', title: 'Knowledge Climber', description: 'Master 10 concepts', icon: '🧗', drillsRequired: 0, conceptsRequired: 10, reward: '1 Month Free Subscription' },
  { id: 'grade-level', title: 'Grade Level Hero', description: 'Reach your grade level in any subject', icon: '🏆', drillsRequired: 0, conceptsRequired: 0, reward: 'Kihon Backpack', special: true },
]

const shopItems = [
  { id: 'sticker-pack', title: 'Sticker Pack', description: 'A set of Kihon math stickers', icon: '✨', cost: 50, category: 'physical' },
  { id: 'notebook', title: 'Kihon Notebook', description: 'Premium notebook with graph paper', icon: '📓', cost: 150, category: 'physical' },
  { id: 'backpack', title: 'Kihon Backpack', description: 'Show everyone you mastered the basics', icon: '🎒', cost: 500, category: 'physical' },
  { id: 'sub-1mo', title: '1 Month Free', description: 'One month of Kihon Standard — earned by you', icon: '🗓️', cost: 200, category: 'subscription' },
  { id: 'sub-3mo', title: '3 Months Free', description: 'Three months of Kihon Standard', icon: '📅', cost: 500, category: 'subscription' },
  { id: 'game-30', title: '30 Min Game Time', description: 'Play your favorite games after practice', icon: '🎮', cost: 30, category: 'digital' },
  { id: 'game-60', title: '60 Min Game Time', description: 'An hour of well-earned fun', icon: '🕹️', cost: 50, category: 'digital' },
]

// GET /api/rewards
router.get('/', requireAuth, async (req, res) => {
  try {
    // Credit balance
    const balance = await queryOne(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM credit_events WHERE user_id = $1',
      [req.user.id]
    )

    // Earned milestones
    const earned = await queryAll(
      'SELECT milestone_id, completed_at FROM milestone_completions WHERE user_id = $1',
      [req.user.id]
    )
    const earnedIds = earned.map(e => e.milestone_id)

    // Student stats for milestone progress
    const drillCount = await queryOne(
      "SELECT COUNT(*) AS c FROM drill_sessions WHERE user_id = $1 AND status = 'completed'",
      [req.user.id]
    )
    const masteredCount = await queryOne(
      'SELECT COUNT(*) AS c FROM student_skill_progress WHERE user_id = $1 AND mastered = true',
      [req.user.id]
    )

    // Redemption history
    const redemptions = await queryAll(
      'SELECT reward_id, credits_spent, redeemed_at FROM reward_redemptions WHERE user_id = $1 ORDER BY redeemed_at DESC',
      [req.user.id]
    )

    res.json({
      credits: parseInt(balance.balance),
      milestones: milestoneDefinitions.map(m => ({
        ...m,
        earned: earnedIds.includes(m.id),
      })),
      shop: shopItems,
      stats: {
        drillsCompleted: parseInt(drillCount.c),
        conceptsMastered: parseInt(masteredCount.c),
      },
      redemptions,
    })
  } catch (err) {
    console.error('Rewards error:', err)
    res.status(500).json({ error: 'Failed to fetch rewards' })
  }
})

// POST /api/rewards/redeem
router.post('/redeem', requireAuth, async (req, res) => {
  try {
    const { rewardId } = req.body

    const item = shopItems.find(i => i.id === rewardId)
    if (!item) {
      return res.status(400).json({ error: 'Invalid reward' })
    }

    // Check balance
    const balance = await queryOne(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM credit_events WHERE user_id = $1',
      [req.user.id]
    )

    if (parseInt(balance.balance) < item.cost) {
      return res.status(400).json({ error: 'Insufficient credits' })
    }

    // Record redemption
    await query(
      'INSERT INTO reward_redemptions (user_id, reward_id, credits_spent) VALUES ($1, $2, $3)',
      [req.user.id, rewardId, item.cost]
    )

    // Deduct credits
    await query(
      `INSERT INTO credit_events (user_id, amount, reason, reference_type)
       VALUES ($1, $2, $3, 'redemption')`,
      [req.user.id, -item.cost, `Redeemed: ${item.title}`]
    )

    const newBalance = await queryOne(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM credit_events WHERE user_id = $1',
      [req.user.id]
    )

    res.json({
      success: true,
      item: item.title,
      newBalance: parseInt(newBalance.balance),
    })
  } catch (err) {
    console.error('Redeem error:', err)
    res.status(500).json({ error: 'Redemption failed' })
  }
})

export default router
