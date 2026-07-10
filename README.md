# FocusFlow — Adaptive Workflow & Execution Platform

A full-stack workflow execution system that converts high-level goals into persistent, dependency-aware task graphs, dynamically schedules executable work based on deadlines and constraints, and learns from execution history to improve future plans.

**Designed with neuro-inclusive principles for ADHD, Autism, and Dyslexia.**

---

## 🎯 What FocusFlow Does

FocusFlow answers one question: **"What should I work on right now?"**

Unlike traditional todo apps that dump 50 tasks on you, FocusFlow:
- Understands which tasks are **actually executable** (dependencies met)
- **Ranks** them by deadline urgency, priority, and unlock value
- **Explains** why each task is recommended
- Adapts when your **estimates are wrong**
- Notices when you keep **postponing** something and offers to help

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React 18 + TypeScript                  │
│              shadcn/ui · Tailwind · Recharts              │
│              Framer Motion · TanStack Query               │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │   Auth   │ │  Goals   │ │  Tasks   │ │  Scheduler   │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Voice & AI Layer                          │ │
│  │  Faster-Whisper (local) · Gemini (optional)           │ │
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

## ✨ Key Features

### 🧠 Dependency-Aware Workflow Engine
- Tasks can depend on other tasks (`A → B → C`)
- **DFS cycle detection** — rejects self-loops, duplicates, and circular dependencies
- **Executable task computation** — only unblocked tasks are actionable
- **Topological ordering** via Kahn's algorithm
- **Visual graph builder** — toggle between list and interactive node graph views

### 📊 Adaptive Scheduler
- Priority scoring with 6 weighted factors:
  - Deadline urgency · User priority · Dependency unlock value
  - Overdue penalty · Postponement penalty · Effort fit
- **Explainable recommendations** — every suggestion includes reasons
- Schedule blocks with persistent execution slots
- Postponement tracking with supportive nudges

### ⏱ Execution Tracking & Adaptation
- Execution sessions with start/pause/complete
- Immutable task event log for auditability
- **Adaptive duration estimation** — weighted moving average from history
- Focus Mode — single-task view preserving neuro-inclusive UX

### 🎤 Voice Input with Hybrid Parsing
- **Faster-Whisper** runs locally for transcription (fast, private, free)
- **Regex quick parser** extracts time, priority, and deadlines instantly
- **Optional Gemini enhancement** — parses complex natural language
- "Prepare for DBMS by Friday, about 2 hours daily" → fills all fields

### 🤖 Optional AI Decomposition
- Async background jobs via Celery + Redis
- Structured output validation with Pydantic + cycle detection
- **Core app works fully without AI** — only decomposition degrades

### ♿ Neuro-Inclusive Design
- Three support modes: **ADHD**, **Autism**, **Dyslexia**
- Each mode changes typography, layout density, defaults, and behavior
- OpenDyslexic font option · Lexend primary font
- Single-task focus mode · No red colors · No countdowns
- Dark mode toggle

### 📈 Insights Dashboard
- Weekly completion bar chart
- Focus time distribution donut chart
- Estimation accuracy gauge
- Recent activity timeline

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Node.js 24+
- Google Gemini API key (optional — only for AI features)

### 1. Clone & Setup

```bash
git clone git@github.com:GouravLuinor/focusflow.git
cd focusflow
git checkout antigravity-dev

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
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Start Worker (Optional — for AI features)

```bash
celery -A app.core.celery_config worker --loglevel=info
```

### 5. Setup Frontend

```bash
cd frontend/focusflow-hub
npm ci
npm run dev
```

Open `http://localhost:8080`

---

## 🧪 Testing

```bash
# Backend unit tests (79 tests)
cd Backend
pytest tests/ -v

# Backend API tests (33 tests)
python test_api.py

# Frontend E2E tests (32 tests)
cd frontend/focusflow-hub
npx playwright test tests/e2e/full-flow.spec.ts --reporter=list
```

---

## 📁 Project Structure

```
focusflow/
├── Backend/
│   ├── app/
│   │   ├── api/           # Route handlers (auth, goals, tasks, schedule, voice)
│   │   ├── core/          # Auth, security, Celery config
│   │   ├── db/            # Database session
│   │   ├── engine/        # Dependency graph, scheduler, state machine, adaptation
│   │   ├── models/        # SQLAlchemy models (User, Goal, Task, TaskDependency, etc.)
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── worker/        # Celery tasks (AI decomposition)
│   ├── alembic/           # Database migrations
│   ├── tests/             # Backend tests
│   └── requirements.txt
├── frontend/focusflow-hub/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── auth/      # AuthCard
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   ├── focus/     # Focus Mode components
│   │   │   ├── goals/     # Goal Detail + WorkflowGraph
│   │   │   ├── layout/    # Sidebar, TopBar, DashboardLayout
│   │   │   ├── schedule/  # Schedule components
│   │   │   └── shared/    # VoiceInputButton
│   │   ├── contexts/      # AppContext (auth, accessibility, dark mode)
│   │   ├── hooks/         # useVoiceInput
│   │   ├── lib/           # apiRequest, voiceParser
│   │   └── pages/         # Page components
│   ├── tests/e2e/         # Playwright E2E tests
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🎨 Design Decisions

### Why a Modular Monolith?
Microservices would add complexity without value for a solo developer. The backend is organized as clear service boundaries within a single deployable — easier to debug, test, and deploy.

### Why AI is Optional and Bounded
The original prototype crashed if Gemini was unavailable. Now: core features work without AI. Decomposition runs in background workers. AI is a convenience, not a dependency.

### Why Deterministic Scheduling over ML
The priority engine uses transparent, testable heuristics. Every recommendation is explainable. No black-box ML — users see exactly why a task is suggested.

### Why PostgreSQL + Alembic
SQLite for prototyping, PostgreSQL for production. Alembic enables versioned, reversible migrations — essential for evolving the data model safely.

### Why Local Whisper + Optional Gemini
Voice transcription runs locally (Faster-Whisper tiny model) — fast, private, works offline. Gemini enhances parsing only when the user explicitly opts in.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, Celery |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Framer Motion, Recharts |
| **Voice** | Faster-Whisper (local) + Gemini (optional cloud) |
| **Auth** | JWT (python-jose, bcrypt, passlib) |
| **Testing** | Pytest (backend), Playwright (frontend E2E) |
| **DevOps** | Docker Compose, GitHub Actions |

---

## 📝 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Create account |
| `/auth/login` | POST | Sign in, returns JWT |
| `/auth/me` | GET | Current user info |
| `/goals/` | GET/POST | List or create goals |
| `/goals/{id}/workflow-order` | GET | Topologically sorted tasks |
| `/goals/{id}/ai-decompose` | POST | Trigger AI decomposition (async) |
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
| `/voice/transcribe` | POST | Transcribe audio to text |
| `/ai/parse-task` | POST | Parse natural language to structured task |

---

## 🧪 Test Coverage

| Suite | Tests | Status |
|-------|-------|--------|
| Backend unit (engine) | 79 | ✅ All passing |
| Backend API integration | 33 | ✅ All passing |
| Frontend E2E (Playwright) | 32 | ✅ All passing |
| **Total** | **144** | ✅ |


---

## Acknowledgements

- Original project inspired by Neurathon 2026 — "The Smart Companion"
- UI designs created with Google Stitch
- Icons by Lucide React
- Fonts: Lexend (Google Fonts), OpenDyslexic (Abbie Gonzalez)
- Voice transcription: Faster-Whisper (Guillaume Klein)
