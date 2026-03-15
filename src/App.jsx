import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Diagnostic from './pages/Diagnostic'
import Dashboard from './pages/Dashboard'
import SkillTree from './pages/SkillTree'
import Drill from './pages/Drill'
import Rewards from './pages/Rewards'

export default function App() {
    const location = useLocation()

    // Hide navbar on landing page and during diagnostic/drill
    const hideNav = ['/', '/diagnostic', '/drill'].includes(location.pathname)

    return (
        <>
            {!hideNav && <Navbar />}
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/diagnostic" element={<Diagnostic />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/skills" element={<SkillTree />} />
                    <Route path="/drill" element={<Drill />} />
                    <Route path="/rewards" element={<Rewards />} />
                </Routes>
            </AnimatePresence>
        </>
    )
}
