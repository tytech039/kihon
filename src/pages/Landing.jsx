import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Landing.css'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }),
}

const features = [
    {
        icon: '🎯',
        title: 'Diagnostic-First',
        desc: 'A smart assessment finds exactly where the gaps are — across every skill, every level.',
    },
    {
        icon: '🌳',
        title: 'Skill Tree Pathing',
        desc: 'A personalized path from where you actually are to where you need to be. No shortcuts, no skips.',
    },
    {
        icon: '⚡',
        title: '7 Minute Drills',
        desc: 'Short, focused practice bursts. No narration, no fluff — just do math.',
    },
    {
        icon: '🧠',
        title: 'AI Tutoring',
        desc: 'Stuck? Ask questions and get instant, context-aware explanations. No waiting, no shame.',
    },
    {
        icon: '🏆',
        title: 'Real Rewards',
        desc: 'Earn credits, unlock milestones, get physical rewards. Effort is rewarded, not perfection.',
    },
    {
        icon: '💚',
        title: 'Never Blame',
        desc: 'Struggling is feedback, not failure. Kihon adapts to you — and notifies your teacher to help.',
    },
]

const problems = [
    { stat: '10 min', label: 'of narration per 1 min of practice' },
    { stat: '73%', label: 'of students have undiagnosed gaps' },
    { stat: '0', label: 'products that go back to basics well' },
]

export default function Landing() {
    return (
        <div className="landing">
            {/* Ambient background */}
            <div className="landing-bg">
                <div className="landing-orb landing-orb-1" />
                <div className="landing-orb landing-orb-2" />
                <div className="landing-orb landing-orb-3" />
            </div>

            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div className="hero-badge badge badge-info" custom={0} variants={fadeUp}>
                            ✦ Adaptive Learning, Rebuilt
                        </motion.div>

                        <motion.h1 className="hero-title" custom={1} variants={fadeUp}>
                            Back to basics.<br />
                            <span className="hero-gradient-text">Forward to mastery.</span>
                        </motion.h1>

                        <motion.p className="hero-subtitle" custom={2} variants={fadeUp}>
                            Kihon finds where understanding breaks down — then builds a path
                            from real foundations to real mastery. No blame, no busywork.
                        </motion.p>

                        <motion.div className="hero-actions" custom={3} variants={fadeUp}>
                            <Link to="/diagnostic" className="btn btn-primary btn-lg">
                                Start Diagnostic
                                <span className="btn-arrow">→</span>
                            </Link>
                            <Link to="/dashboard" className="btn btn-secondary btn-lg">
                                Explore Demo
                            </Link>
                        </motion.div>

                        <motion.div className="hero-stats" custom={4} variants={fadeUp}>
                            {problems.map((p, i) => (
                                <div key={i} className="hero-stat">
                                    <span className="hero-stat-number">{p.stat}</span>
                                    <span className="hero-stat-label">{p.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Problem */}
            <section className="section problem-section">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">
                            Current ed-tech is <span className="text-error">fundamentally broken</span>
                        </h2>
                        <p className="section-subtitle">
                            Products like i-Ready spend 10 minutes narrating for every 1 minute of practice.
                            They blame students for struggling. They resist going back to where gaps actually exist.
                            And schools have no incentive to fix it.
                        </p>
                    </motion.div>

                    <div className="problem-quote">
                        <motion.blockquote
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <p>"It appears you are answering questions wrong <em>on purpose</em>."</p>
                            <cite>— Actual message shown to struggling students by i-Ready</cite>
                        </motion.blockquote>
                    </div>
                </div>
            </section>

            {/* Solution */}
            <section className="section solution-section">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="section-title">
                            Find the floor. <span className="text-accent">Build up.</span>
                        </h2>
                        <p className="section-subtitle">
                            Sometimes an Algebra II student needs to go back to long division.
                            Kihon handles that — without shame, without judgment. A black belt still practices kihon.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="section features-section">
                <div className="container">
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                className="feature-card card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                            >
                                <span className="feature-icon">{f.icon}</span>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="cta-kanji">基本</div>
                        <h2>Fundamentals. Basics. Foundation.</h2>
                        <p>Returning to basics isn't a demotion. It's the path forward.</p>
                        <Link to="/diagnostic" className="btn btn-primary btn-lg">
                            Start Your Diagnostic
                            <span className="btn-arrow">→</span>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-inner">
                        <span className="footer-brand">基 Kihon</span>
                        <span className="footer-copy">© 2026 trykihon.com</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
