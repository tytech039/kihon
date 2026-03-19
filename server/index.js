import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import diagnosticRoutes from './routes/diagnostic.js'
import skillsRoutes from './routes/skills.js'
import drillRoutes from './routes/drill.js'
import lessonsRoutes from './routes/lessons.js'
import rewardsRoutes from './routes/rewards.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/diagnostic', diagnosticRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/drill', drillRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/rewards', rewardsRoutes)

// In production, serve the built React frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`⚡ Kihon server running on http://localhost:${PORT}`)
})
