# Kihon

**Back to basics. Forward to mastery.**

*trykihon.com*

---

## The Problem

Current educational software is fundamentally broken. Products like i-Ready and similar platforms:

- Assume students can't read and force them through slow, unskippable narration before every problem
- Spend roughly 10 minutes narrating for every 1 minute of actual practice
- Resist moving students back to foundational concepts when gaps are identified
- Blame students for struggling ("It appears you are answering questions wrong *on purpose*") instead of adapting
- Prioritize time-on-platform metrics over actual learning outcomes
- Rely on parents to provide instructional help they've long since forgotten

Schools have no incentive to fix this. A fifth grader doing fifth-grade work looks fine on a report. A fifth grader whose diagnostic reveals second-grade literacy is a liability — for the teacher, the principal, the district. So kids get dragged through grade-level content they can't access, gaps compound year after year, and the ACT arrives like a freight train.

Sometimes an Algebra II student needs to go back to long division. No existing product handles that well.

---

## The Solution

Kihon is adaptive learning software built on one core principle: **find the floor, then build up.**

Instead of starting students at grade level and awkwardly trying to ratchet down when things fall apart, Kihon begins with a comprehensive diagnostic that identifies exactly where a student's understanding is solid and where the gaps are — across all core subjects. Then it builds a custom path from wherever they actually are back up to (and beyond) grade level.

The name comes from the Japanese martial arts concept of *kihon* — the practice of fundamentals. A black belt still does kihon. Returning to basics isn't a demotion. It's the path forward.

---

## Core Features

### Diagnostic-First Placement

Every student begins with an adaptive placement assessment. The test starts at grade level and works backward until it finds solid ground in each skill strand. The student doesn't need to know they were just asked a third-grade question — they just answer questions until it's done.

The result is a precise map of every gap. A student might be on track in geometry but need to go back to fractions for anything algebra-related. The path reflects that specificity rather than treating them as uniformly behind.

**Key principle:** Every student takes the diagnostic. Nobody is singled out. "Let's figure out where you are" carries no shame.

### Adaptive Skill Pathing

Based on diagnostic results, Kihon builds a custom learning path for each student that respects skill dependency chains — which concepts build on which. Students work through their actual gaps rather than being held at grade level with slowed pacing.

### Age-Appropriate Motivation

#### Younger Students (Elementary)
- **7 Minute Drill:** Short, focused bursts of practice questions — no thirty-second narration preambles, just do math
- **Instructional Videos:** Paired with drills, with a configurable toggle for video-first or drill-first depending on the learner
- **Game Time Rewards:** Completing practice earns game time that can be used whenever the student is done. Effort is rewarded, not perfection. A kid working through second-grade math still earns their game time

#### Older Students (Middle/High School)
- **Gold Credits:** Earned through concept mastery, tradeable for physical rewards or subscription credits
- **Milestone Rewards:** Reach grade level? Get a free backpack. Master X concepts? Earn Y months free
- **Subscription Credits:** Students can earn their own subscription through effort, giving them ownership of their learning

### Struggle Detection Without Shame

When a student struggles, Kihon doesn't accuse or blame. Instead:

> *"You seem to be struggling at this level. I've sent a notification to your teacher so you can get the help you need."*

This framing puts the software on the student's side. It subtly signals to a disengaged student that their behavior is visible, while simultaneously opening a door for real help for the student who genuinely doesn't understand. The teacher gets actionable information, not a behavioral accusation.

---

## Premium Features

### AI-Assisted Tutoring (Premium / Extended Tier)

Real-time AI tutor that responds to student questions about the content they just watched. The AI knows exactly which video the student viewed, which concept it covers, and what common misconceptions exist.

- Students ask questions like *"I don't get why she flipped the fraction"* and get an immediate, context-aware explanation
- No waiting for a parent who may not remember the material
- No embarrassment asking for help
- Constrained problem domain means high-quality responses without expensive general-purpose AI

**Why this matters:** "Parent involvement" in homework often means transferring frustration from one person to two. A parent who sees their kid independently asking an AI questions about math instead of melting down at the kitchen table will never cancel this subscription.

### AI-Generated Visual Explanations

The AI tutor is equipped with tools to generate:

- Graphs and charts
- Algebraic notation and step-by-step walkthroughs
- Visual concept demonstrations

These generated explanations are cached on first creation, building a content library organically based on actual student demand.

---

## Business Model

### Revenue Tiers

| Tier | Features | Price |
|------|----------|-------|
| **Free** | Diagnostic assessment + limited learning path | Free |
| **Standard** | Full adaptive path + reward system | Subscription |
| **Premium** | Standard + AI-assisted tutoring + visual explanations | Subscription |

### Earned Rewards

- **Physical rewards:** Backpacks, school supplies, and other items for hitting milestones (double as marketing — a kid wearing a Kihon backpack is a walking advertisement)
- **Subscription credits:** Master X concepts, earn Y months free (costs nothing real — just deferred revenue from deeply engaged users who are likely to keep paying)
- **Game time (younger students):** Earned through completing practice sessions

### Reward Economics

Earned free months cost the company zero marginal dollars while driving retention. A student three concepts away from a free month won't stop using the platform. Physical rewards like backpacks are only going to students who succeed — exactly the users whose stories make the best marketing.

---

## Go-to-Market Strategy

### Direct-to-Parent (Primary Channel)

Schools won't buy this initially because honest diagnostics make their students' gaps visible. That's a feature for parents, not a selling point for districts.

**Target audiences:**
- Parents who suspect their kid is behind but can't get a straight answer from the school
- Homeschool families who want honest assessment and adaptive curriculum
- Parents frustrated with existing edtech that wastes their kids' time

**The long game:** Once enough parents see results, schools face pressure from below. Parents show up to conferences saying *"Your curriculum says my kid is on grade level but Kihon found gaps going back three years."* Enough of that and districts buy in to get ahead of it.

### Word-of-Mouth Engine

- Physical rewards (backpacks, etc.) create organic visibility in schools
- Parent-to-parent conversations about real results
- Student success stories

---

## Bootstrapping Strategy

### No VC Required

The cost structure is designed to avoid outside investment entirely. VC money comes with VC expectations — hockey stick growth, rapid scaling, exit pressure. That warps products. Kihon would end up building the same garbage it's trying to replace because a board member wants engagement numbers, and unskippable narration boosts time-on-platform.

### Phase 1: Launch with AI-Generated Content
- No recorded videos needed at launch
- AI generates visual explanations with graphs, notation, and walkthroughs
- First student to hit a concept triggers generation; it gets cached for all subsequent students
- Content library builds itself based on actual demand
- Launch cost: a developer, API calls, hosting

### Phase 2: Data-Driven Video Production
- Usage data reveals which concepts get the most traffic
- Revenue funds human-produced instructional videos starting with highest-demand concepts
- AI content remains as fallback and supplementary material
- Production priority list writes itself from real user data

### Phase 3: Systematic Content Upgrade
- Progressively replace AI-generated explanations with professional videos
- Product improves continuously without ever having a gap in coverage
- AI tutor remains as the interactive layer on top of video content

### Cost Structure

- **Initial costs:** Development, content creation infrastructure
- **Ongoing costs:** Hosting, API calls, physical rewards (minimal)
- **Marginal cost per new user:** Near zero
- **Scaling model:** Software, not tutoring — 100 users and 100,000 users use the same content

---

## Technical Architecture (High Level)

### Core Systems
- **Diagnostic Engine:** Adaptive assessment that maps skill gaps across subjects and grade levels
- **Skill Dependency Graph:** Maps prerequisite relationships between concepts (e.g., long division → polynomial division)
- **Adaptive Pathing Algorithm:** Builds personalized learning paths based on diagnostic results
- **Content Delivery:** Serves cached AI explanations or human-produced videos based on availability
- **AI Tutor:** Context-aware tutoring constrained to current lesson content, equipped with graph/notation generation tools
- **Reward System:** Tracks progress, manages credit economy, handles subscription earning

### Content Pipeline
- AI-generated explanations cached on first request
- Human-produced videos replace AI content as budget allows
- Priority queue for video production driven by usage analytics

---

## Subject Roadmap

### Phase 1: Math
- Clearest skill dependency chains
- Most measurable gap identification
- Strongest parent pain point
- Covers early elementary arithmetic through high school algebra, geometry, and beyond

### Phase 2: Reading / Language Arts
- Literacy gaps compound similarly to math
- Phonics → fluency → comprehension → analysis

### Phase 3: Additional Core Subjects
- Science
- Social studies
- Expand based on demand data

---

## Philosophy

Kihon is built on beliefs that current edtech ignores:

1. **Going backward is not failure.** It's the fastest path forward.
2. **The software should never blame the student.** If a kid is disengaged, that's feedback about the software, not the child.
3. **Honest assessment matters more than comfortable data.** Parents deserve the truth about where their child is.
4. **Practice should be practice.** Not thirty seconds of narration followed by three seconds of clicking.
5. **Motivation should be built in, not bolted on.** Rewards that kids actually want, earned through real effort.
6. **No kid should need a parent who remembers algebra.** The software should handle instruction completely.
7. **Bootstrapping protects integrity.** A product built to tell the truth can't be owned by people who profit from comfortable lies.

---

*Kihon: 基本 — fundamentals, basics, foundation.*
