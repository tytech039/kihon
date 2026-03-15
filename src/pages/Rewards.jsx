import { useState } from 'react'
import { motion } from 'framer-motion'
import { milestones, rewardShop, demoRewardState } from '../data/rewards'
import './Rewards.css'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }),
}

export default function Rewards() {
    const [activeTab, setActiveTab] = useState('milestones')
    const [selectedReward, setSelectedReward] = useState(null)

    const tabs = [
        { id: 'milestones', label: 'Milestones', icon: '🏆' },
        { id: 'shop', label: 'Reward Shop', icon: '🛍️' },
    ]

    return (
        <motion.div
            className="rewards-page"
            initial="hidden"
            animate="visible"
        >
            <div className="container">
                {/* Header */}
                <motion.div className="rewards-header" custom={0} variants={fadeUp}>
                    <div>
                        <h1>Rewards</h1>
                        <p>Earn credits through practice, unlock real rewards through effort.</p>
                    </div>
                    <div className="credits-display">
                        <span className="credits-display-icon">💰</span>
                        <div>
                            <span className="credits-display-amount">{demoRewardState.credits}</span>
                            <span className="credits-display-label">Gold Credits</span>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div className="rewards-tabs" custom={1} variants={fadeUp}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`rewards-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Milestones */}
                {activeTab === 'milestones' && (
                    <motion.div className="milestones-grid" custom={2} variants={fadeUp}>
                        {milestones.map((m, i) => {
                            const isEarned = demoRewardState.milestonesEarned.includes(m.id)
                            let progress = 0
                            let progressLabel = ''

                            if (m.conceptsRequired) {
                                progress = Math.min(100, (demoRewardState.conceptsMastered / m.conceptsRequired) * 100)
                                progressLabel = `${demoRewardState.conceptsMastered} / ${m.conceptsRequired} concepts`
                            } else if (m.drillsRequired) {
                                progress = Math.min(100, (demoRewardState.drillsCompleted / m.drillsRequired) * 100)
                                progressLabel = `${Math.min(demoRewardState.drillsCompleted, m.drillsRequired)} / ${m.drillsRequired} drills`
                            }

                            if (isEarned) {
                                progress = 100
                                progressLabel = 'Completed!'
                            }

                            return (
                                <motion.div
                                    key={m.id}
                                    className={`milestone-card card ${isEarned ? 'earned' : ''} ${m.special ? 'special' : ''}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <div className="milestone-card-icon">{m.icon}</div>
                                    <h3>{m.title}</h3>
                                    <p className="milestone-card-desc">{m.description}</p>

                                    <div className="milestone-card-progress">
                                        <div className="progress-track">
                                            <motion.div
                                                className={`progress-fill ${isEarned ? 'earned' : ''}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                                            />
                                        </div>
                                        <span className="milestone-progress-label">{progressLabel}</span>
                                    </div>

                                    <div className="milestone-card-reward">
                                        <span className="reward-badge">{isEarned ? '✓ Earned' : m.reward}</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                {/* Shop */}
                {activeTab === 'shop' && (
                    <motion.div className="shop-grid" custom={2} variants={fadeUp}>
                        {rewardShop.map((item, i) => {
                            const canAfford = demoRewardState.credits >= item.cost

                            return (
                                <motion.div
                                    key={item.id}
                                    className={`shop-card card ${!canAfford ? 'shop-card-locked' : ''}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    onClick={() => canAfford && setSelectedReward(item.id === selectedReward ? null : item.id)}
                                >
                                    <div className="shop-card-icon">{item.icon}</div>
                                    <h3>{item.title}</h3>
                                    <p className="shop-card-desc">{item.description}</p>
                                    <div className="shop-card-price">
                                        <span className="shop-price-amount">💰 {item.cost}</span>
                                        {!canAfford && (
                                            <span className="shop-price-need">Need {item.cost - demoRewardState.credits} more</span>
                                        )}
                                    </div>
                                    {canAfford && (
                                        <button className={`btn btn-sm ${selectedReward === item.id ? 'btn-primary' : 'btn-secondary'}`}>
                                            {selectedReward === item.id ? 'Confirm Redeem' : 'Redeem'}
                                        </button>
                                    )}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                {/* How it works */}
                <motion.div className="earn-info card" custom={3} variants={fadeUp}>
                    <h3>How to Earn Credits</h3>
                    <div className="earn-grid">
                        <div className="earn-item">
                            <span className="earn-item-icon">⚡</span>
                            <div>
                                <strong>Complete Drills</strong>
                                <p>+2 credits per correct answer, +3 on a 3+ streak</p>
                            </div>
                        </div>
                        <div className="earn-item">
                            <span className="earn-item-icon">🎯</span>
                            <div>
                                <strong>Master Concepts</strong>
                                <p>+10 credits for each concept mastered</p>
                            </div>
                        </div>
                        <div className="earn-item">
                            <span className="earn-item-icon">🏆</span>
                            <div>
                                <strong>Hit Milestones</strong>
                                <p>Bonus credits for reaching major milestones</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
