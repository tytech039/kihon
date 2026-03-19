import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// Generate JWT for a user
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// Middleware: require authentication
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Optional auth — sets req.user if token present, but doesn't require it
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.slice(7)
      req.user = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      // ignore invalid tokens for optional auth
    }
  }
  next()
}
