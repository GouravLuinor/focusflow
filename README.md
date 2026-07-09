---
title: Neurothon Demo
emoji: 🧠
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# FocusFlow — Adaptive Workflow & Execution Platform

A full-stack workflow execution system that converts high-level goals into persistent, dependency-aware workflows, schedules executable work according to constraints, tracks actual execution behavior, and adapts future plans using historical data.

Designed with neuro-inclusive principles for users with ADHD, Autism, and Dyslexia.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, Celery |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Framer Motion |
| **Auth** | JWT (python-jose, bcrypt, passlib) |
| **AI** | Google Gemini (optional, async via Celery workers) |
| **Testing** | Pytest (backend), Vitest + React Testing Library (frontend) |
| **DevOps** | Docker Compose, GitHub Actions |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React + TypeScript                     │
│              shadcn/ui · Tailwind · Framer Motion         │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │   Auth   │ │  Goals   │ │  Tasks   │ │  Scheduler   │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Workflow Engine                          │ │
│  │  Dependency Graph · Cycle Detection · Topological     │ │
│  │  Sort · Priority Scoring · Adaptive Estimation       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │PostgreSQL│  │  Redis   │  │  Celery  │
    │          │  │ (broker) │  │ (worker) │
    └──────────┘  └──────────┘  └────┬─────┘
                                     │
                              ┌──────▼──────┐
                              │   Gemini    │
                              │  (optional) │
                              └─────────────┘
```

---

## Core Features

### Goals & Hierarchical Tasks
- First-class Goal entities with progress tracking
- Arbitrary task nesting via `parent_task_id`
- Status state machine: TODO → IN_PROGRESS → PAUSED → COMPLETED / CANCELLED

### Dependency Graph Engine
- Tasks can depend on other tasks (`task_dependencies` table)
- DFS cycle detection — rejects self-loops, duplicates, and cycles
- Executable task computation (only unblocked tasks are actionable)
- Topological ordering via Kahn's algorithm
- 34 unit tests covering all graph operations

### Adaptive Scheduler
- Priority scoring with 6 weighted factors:
  - Deadline urgency, user priority, dependency unlock value
  - Overdue penalty, postponement penalty, effort fit
- Explainable recommendations ("Recommended because: due in 2 days, unlocks 3 tasks")
- Schedule blocks for persistent execution slots
- Postponement tracking — repeatedly skipped tasks gain attention
- 45 unit tests covering all scoring components

### Execution Tracking
- Execution sessions with start/pause/complete, actual duration measurement
- Immutable task event log for auditability
- Adaptive duration estimation via weighted moving average (α=0.6)
- Focus mode — single-task view for neurodivergent users

### Background Jobs & AI (Optional)
- Redis + Celery for async task processing
- AI decomposition via Google Gemini (`gemini-3.1-flash-lite-preview`)
- Structured output validation with Pydantic + cycle detection
- Core application works fully without AI — only decomposition degrades

### Neuro-Inclusive Design
- Three support modes: ADHD, Autism, Dyslexia
- Lexend font (primary) + OpenDyslexic option
- Single-task focus mode — one action per screen
- No red colors, no countdowns, no notification badges
- Predictable navigation, clear feedback on every action

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Node.js 24+
- Google Gemini API key (optional — only needed for AI decomposition)

### 1. Clone & Setup Environment

```bash
git clone git@github.com:GouravLuinor/focusflow.git
cd focusflow
git checkout antigravity-dev

# Create .env file in Backend/
cp .env.example Backend/.env
# Edit Backend/.env with your SECRET_KEY and optional GEMINI_API_KEY
```

### 2. Start Infrastructure

```bash
docker compose up -d db redis
```

### 3. Setup Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r Backend/requirements.txt
cd Backend

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Start Worker (Optional — for AI features)

```bash
# In a separate terminal, from Backend/
celery -A app.core.celery_config worker --loglevel=info
```

### 5. Setup Frontend

```bash
cd frontend/focusflow-hub
npm ci
npm run dev
```

Open `http://localhost:8080`.

---

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Create account |
| `/auth/login` | POST | Sign in, returns JWT |
| `/auth/me` | GET | Current user info |
| `/goals/` | GET/POST | List or create goals |
| `/goals/{id}` | GET/PUT/DELETE | Goal CRUD |
| `/goals/{id}/ai-decompose` | POST | Trigger AI decomposition (async) |
| `/goals/{id}/workflow-order` | GET | Topologically sorted tasks |
| `/tasks/` | GET/POST | List or create tasks |
| `/tasks/executable` | GET | Tasks with all dependencies met |
| `/tasks/{id}/focus` | GET | Single-task focus view |
| `/tasks/{id}/estimate` | GET | Original vs adapted duration |
| `/tasks/{id}/dependencies` | GET/POST | Manage dependency edges |
| `/schedule/generate` | POST | Generate scored daily plan |
| `/schedule/blocks` | GET/POST | Schedule block CRUD |
| `/sessions/` | GET/POST | Start/list execution sessions |
| `/sessions/{id}/complete` | POST | Complete active session |
| `/ai-jobs/` | GET/POST | AI job status |
| `/ai-jobs/{id}` | GET | Single job status |

---

## Testing

```bash
# Backend tests (79 unit tests)
cd Backend
pytest tests/ -v

# Frontend tests
cd frontend/focusflow-hub
npm test
```

---

## Project Structure

```
focusflow/
├── Backend/
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Auth, security, Celery config
│   │   ├── db/            # Database session
│   │   ├── engine/        # Dependency graph, scheduler, state machine
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── worker/        # Celery tasks
│   ├── alembic/           # Database migrations
│   ├── tests/             # Backend tests
│   └── requirements.txt
├── frontend/focusflow-hub/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── auth/      # AuthCard (shared by login/signup)
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   ├── focus/     # Focus mode components
│   │   │   ├── goals/     # Goal detail + workflow components
│   │   │   ├── layout/    # Sidebar, TopBar, DashboardLayout
│   │   │   ├── schedule/  # Schedule view components
│   │   │   └── ui/        # shadcn/ui primitives
│   │   ├── contexts/      # AppContext (auth, user state)
│   │   ├── lib/           # API utility
│   │   └── pages/         # Page components
│   ├── designs/           # Stitch design references
│   └── package.json
├── docker-compose.yml
├── dockerfile
├── .env.example
└── README.md
```

---

## Design Decisions

### Why a Modular Monolith?
Microservices would add network complexity, distributed transactions, and deployment overhead without clear value for a solo developer project. The backend is organized as a modular monolith — clear service boundaries within a single deployable.

### Why AI is Optional and Bounded
The original hackathon prototype crashed if Gemini was unavailable. The redesigned system treats AI as an optional planning input. Goals, tasks, scheduling, and execution tracking all work without it. AI decomposition runs in background workers and fails gracefully.

### Why PostgreSQL + Alembic
SQLite was used for prototyping. PostgreSQL provides proper concurrency, constraints, and production deployment support. Alembic enables versioned, reversible schema migrations — essential for evolving the data model.

### Why Deterministic Scheduling over ML
The priority scoring engine uses transparent, testable heuristics rather than machine learning. Every recommendation is explainable. ML-based scheduling could be explored later, but the current approach is correct, fast, and debuggable.

### Why Lexend + OpenDyslexic
Lexend is scientifically designed for reading fluency. OpenDyslexic is a specialized font for dyslexia. Both are included as first-class typography options — not buried in accessibility settings.

---

## License

MIT

---

## Acknowledgements

- Original project inspired by Neurathon 2026 — "The Smart Companion"
- UI designs created with Google Stitch
- Icons by Lucide React
- Fonts: Lexend (Google Fonts), OpenDyslexic (Abbie Gonzalez)
