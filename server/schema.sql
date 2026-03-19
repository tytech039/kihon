-- Kihon Database Schema

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  grade_level INT NOT NULL DEFAULT 5,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill nodes
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  grade_level INT NOT NULL,
  x INT NOT NULL DEFAULT 0,
  y INT NOT NULL DEFAULT 0
);

-- Skill prerequisite edges
CREATE TABLE IF NOT EXISTS skill_edges (
  id SERIAL PRIMARY KEY,
  from_skill TEXT REFERENCES skills(id) ON DELETE CASCADE,
  to_skill TEXT REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(from_skill, to_skill)
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  difficulty INT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT NOT NULL
);

-- AI-generated lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'ai_generated',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty_level INT,
  video_url TEXT,
  model_used TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_skill ON lessons(skill_id);

-- Student skill progress
CREATE TABLE IF NOT EXISTS student_skill_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  total_attempts INT NOT NULL DEFAULT 0,
  correct_attempts INT NOT NULL DEFAULT 0,
  mastered BOOLEAN NOT NULL DEFAULT FALSE,
  mastered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Diagnostic sessions
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_difficulty REAL NOT NULL DEFAULT 5.0,
  questions_answered INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Diagnostic answers
CREATE TABLE IF NOT EXISTS diagnostic_answers (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id),
  selected_index INT NOT NULL,
  correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drill sessions
CREATE TABLE IF NOT EXISTS drill_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_difficulty REAL NOT NULL DEFAULT 4.0,
  questions_answered INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  max_streak INT NOT NULL DEFAULT 0,
  credits_earned INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Drill answers
CREATE TABLE IF NOT EXISTS drill_answers (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES drill_sessions(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id),
  selected_index INT NOT NULL,
  correct BOOLEAN NOT NULL,
  credits_awarded INT NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit events (event-sourced balance)
CREATE TABLE IF NOT EXISTS credit_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_user ON credit_events(user_id);

-- Milestone completions
CREATE TABLE IF NOT EXISTS milestone_completions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- Reward redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  credits_spent INT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);
