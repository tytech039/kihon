import { useState } from 'react'
import { motion } from 'framer-motion'
import { skillNodes, getEdges, demoMasteredSkills, demoInProgressSkills } from '../data/skillTree'
import './SkillTree.css'

export default function SkillTree() {
    const [selectedNode, setSelectedNode] = useState(null)
    const edges = getEdges()

    const getNodeStatus = (id) => {
        if (demoMasteredSkills.includes(id)) return 'mastered'
        if (demoInProgressSkills.includes(id)) return 'in-progress'
        return 'locked'
    }

    // Calculate SVG viewBox to contain all nodes
    const padding = 60
    const nodeRadius = 32
    const minX = Math.min(...skillNodes.map(n => n.x)) - padding
    const maxX = Math.max(...skillNodes.map(n => n.x)) + padding
    const minY = Math.min(...skillNodes.map(n => n.y)) - padding
    const maxY = Math.max(...skillNodes.map(n => n.y)) + padding
    const width = maxX - minX + nodeRadius * 2
    const height = maxY - minY + nodeRadius * 2

    const selected = selectedNode ? skillNodes.find(n => n.id === selectedNode) : null

    return (
        <motion.div
            className="skill-tree-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="container">
                <div className="skill-tree-header">
                    <div>
                        <h1>Skill Tree</h1>
                        <p>Your math learning path — from foundations to mastery.</p>
                    </div>
                    <div className="skill-tree-legend">
                        <div className="legend-item">
                            <span className="legend-dot mastered" />
                            <span>Mastered</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot in-progress" />
                            <span>In Progress</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot locked" />
                            <span>Locked</span>
                        </div>
                    </div>
                </div>

                <div className="skill-tree-container card">
                    <svg
                        viewBox={`${minX} ${minY} ${width} ${height}`}
                        className="skill-tree-svg"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <linearGradient id="edgeGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--indigo-400)" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="var(--indigo-400)" stopOpacity="0.2" />
                            </linearGradient>
                            <linearGradient id="edgeGradientLocked" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--gray-600)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="var(--gray-600)" stopOpacity="0.1" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <filter id="glowGreen">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Edges */}
                        {edges.map((edge, i) => {
                            const from = skillNodes.find(n => n.id === edge.from)
                            const to = skillNodes.find(n => n.id === edge.to)
                            const fromStatus = getNodeStatus(edge.from)
                            const toStatus = getNodeStatus(edge.to)
                            const isActive = fromStatus === 'mastered'

                            return (
                                <line
                                    key={i}
                                    x1={from.x}
                                    y1={from.y}
                                    x2={to.x}
                                    y2={to.y}
                                    className={`skill-edge ${isActive ? 'active' : 'inactive'}`}
                                    stroke={isActive ? 'url(#edgeGradientActive)' : 'url(#edgeGradientLocked)'}
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                            )
                        })}

                        {/* Nodes */}
                        {skillNodes.map((node) => {
                            const status = getNodeStatus(node.id)
                            const isSelected = selectedNode === node.id

                            return (
                                <g
                                    key={node.id}
                                    className={`skill-node skill-node-${status} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedNode(isSelected ? null : node.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Glow ring for mastered */}
                                    {status === 'mastered' && (
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={nodeRadius + 4}
                                            className="node-glow-ring"
                                            filter="url(#glowGreen)"
                                        />
                                    )}

                                    {/* Pulse ring for in-progress */}
                                    {status === 'in-progress' && (
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={nodeRadius + 4}
                                            className="node-pulse-ring"
                                        />
                                    )}

                                    {/* Main circle */}
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={nodeRadius}
                                        className="node-circle"
                                    />

                                    {/* Icon */}
                                    <text
                                        x={node.x}
                                        y={node.y}
                                        className="node-icon"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="16"
                                    >
                                        {status === 'mastered' ? '✓' :
                                            status === 'in-progress' ? '◉' : '🔒'}
                                    </text>

                                    {/* Label */}
                                    <text
                                        x={node.x}
                                        y={node.y + nodeRadius + 18}
                                        className="node-label"
                                        textAnchor="middle"
                                        fontSize="11"
                                    >
                                        {node.label}
                                    </text>
                                </g>
                            )
                        })}
                    </svg>
                </div>

                {/* Detail Panel */}
                {selected && (
                    <motion.div
                        className="skill-detail card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="skill-detail-header">
                            <div>
                                <h3>{selected.label}</h3>
                                <span className={`badge badge-${getNodeStatus(selected.id) === 'mastered' ? 'success' : getNodeStatus(selected.id) === 'in-progress' ? 'warning' : 'info'}`}>
                                    {getNodeStatus(selected.id).replace('-', ' ')}
                                </span>
                            </div>
                            <span className="skill-grade">Grade {selected.gradeLevel}</span>
                        </div>
                        <div className="skill-detail-prereqs">
                            <span className="prereq-label">Prerequisites:</span>
                            {selected.prerequisites.length === 0 ? (
                                <span className="prereq-none">None (Foundation Skill)</span>
                            ) : (
                                <div className="prereq-tags">
                                    {selected.prerequisites.map(pid => {
                                        const pNode = skillNodes.find(n => n.id === pid)
                                        return (
                                            <span
                                                key={pid}
                                                className={`prereq-tag ${getNodeStatus(pid) === 'mastered' ? 'met' : 'unmet'}`}
                                            >
                                                {getNodeStatus(pid) === 'mastered' ? '✓' : '○'} {pNode?.label}
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
