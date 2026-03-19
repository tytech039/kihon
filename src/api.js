// API client with JWT auth header injection

const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('kihon_token')
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('kihon_token', token)
  } else {
    localStorage.removeItem('kihon_token')
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    // Token expired or invalid
    setToken(null)
    window.location.href = '/login'
    throw new Error('Authentication required')
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

// Auth
export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Diagnostic
  diagnosticStart: () => request('/diagnostic/start', { method: 'POST' }),
  diagnosticAnswer: (body) => request('/diagnostic/answer', { method: 'POST', body: JSON.stringify(body) }),
  diagnosticResults: (id) => request(`/diagnostic/results/${id}`),

  // Skills
  skillTree: () => request('/skills/tree'),
  skillProgress: () => request('/skills/progress'),

  // Drill
  drillStart: (body = {}) => request('/drill/start', { method: 'POST', body: JSON.stringify(body) }),
  drillAnswer: (body) => request('/drill/answer', { method: 'POST', body: JSON.stringify(body) }),
  drillComplete: (sessionId) => request('/drill/complete', { method: 'POST', body: JSON.stringify({ sessionId }) }),

  // Lessons
  getLesson: (skillId) => request(`/lessons/${skillId}`),

  // Rewards
  rewards: () => request('/rewards'),
  redeem: (rewardId) => request('/rewards/redeem', { method: 'POST', body: JSON.stringify({ rewardId }) }),
}
