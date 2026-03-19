# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (client + server concurrently)
npm run dev

# Client only
npm run dev:client

# Server only (with auto-reload)
npm run dev:server

# Production build
npm run build

# Production server
npm run start

# Seed the database
npm run seed
```

No linting or test scripts are configured yet.

## Architecture

Kihon is a full-stack adaptive math learning platform. The frontend is React/Vite; the backend is Express/Node.js with PostgreSQL. Claude AI generates lesson content on demand.

**Dev proxy:** Vite proxies `/api/*` to `http://localhost:3001`, so during development both client and server can run on different ports while sharing the same origin.

### Frontend (`src/`)

- **`api.js`** — Centralized fetch client that injects `Authorization: Bearer <token>` from localStorage (`kihon_token`) on every request and handles 401 by clearing auth state.
- **`context/AuthContext.jsx`** — Auth state (user, stats, login/register/logout). Reads token from localStorage on mount and populates user state.
- **`App.jsx`** — React Router with a `ProtectedRoute` wrapper; unauthenticated users are redirected to `/login`.
- **`pages/`** — One file per route: Landing, Login, Diagnostic, Dashboard, SkillTree, Drill, Lesson, Rewards.

### Backend (`server/`)

| File | Purpose |
|------|---------|
| `index.js` | Express app entry, mounts all routes under `/api`, serves static build in production |
| `db.js` | PostgreSQL pool; exposes `query()`, `queryOne()`, `queryAll()`, `transaction()` |
| `auth.js` | JWT sign/verify (30-day expiry); `requireAuth` middleware |
| `lessonGenerator.js` | Calls Claude API (`claude-sonnet-4-20250514`) to generate KaTeX+Markdown lessons; caches result in DB; falls back to built-in content if API key is absent |
| `schema.sql` | Full database schema |
| `seed.js` | Seeds skills, questions, and milestones |
| `routes/` | `auth`, `diagnostic`, `skills`, `drill`, `lessons`, `rewards` |

### Key Data Flows

**Auth:** JWT stored in `localStorage` → injected by `api.js` → validated by `requireAuth` middleware. Token payload: `{ id, email, role }`.

**Diagnostic:** Adaptive placement test that adjusts difficulty based on correct/incorrect streaks, then unlocks a personalized skill tree.

**Drill:** 7-minute timed session. Backend picks questions from in-progress skills, adjusts difficulty based on correctness streaks, awards credits on completion.

**Lesson:** `GET /api/lessons/:skillId` — backend checks DB for cached lesson; if absent, calls Claude API and caches the result before returning.

**Skill Tree:** Skills have prerequisite edges stored in `skill_edges`. The tree is laid out using `x`/`y` coordinates stored in the `skills` table.

## Environment

Copy `.env.example` to `.env`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/kihon
JWT_SECRET=<random string>
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
```

`NODE_ENV=production` causes the Express server to serve the Vite build from `dist/`.
