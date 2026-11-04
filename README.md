<div align="center">

<img src="docs/images/landing.png" alt="FocusFlow landing page" width="100%" />

# FocusFlow

### An adaptive execution engine that answers one question: *"What should I work on right now?"*

FocusFlow turns a vague goal into a **dependency-aware task graph** with Gemini, ranks only the work that is actually unblocked using an **explainable 6-factor scoring engine**, and learns how long things *really* take from your execution history. It's designed from the ground up for ADHD, autistic and dyslexic users.

[![Backend CI](https://github.com/GouravLuinor/focusflow/actions/workflows/backend.yml/badge.svg)](https://github.com/GouravLuinor/focusflow/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/GouravLuinor/focusflow/actions/workflows/frontend.yml/badge.svg)](https://github.com/GouravLuinor/focusflow/actions/workflows/frontend.yml)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-5.4-37814A?logo=celery&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?logo=googlegemini&logoColor=white)

[Features](#-what-it-does) · [Screenshots](#-a-tour) · [Architecture](#-architecture) · [Engineering deep dive](#-engineering-deep-dive) · [Quick start](#-quick-start) · [API](#-api-surface) · [Testing](#-testing)

</div>

---

## 💡 The problem

Most to-do apps are flat lists. For someone with executive-function challenges, a list of 30 items doesn't help you start; it's 30 reasons to freeze. The hard part isn't *storing* tasks. It's deciding **what is possible right now**, **what matters most**, and **how to begin**.

FocusFlow treats that as an engineering problem:

| Question | How FocusFlow answers it |
|---|---|
| *What can I even do?* | Tasks form a **DAG**. Only tasks whose prerequisites are complete are *executable*. |
| *What should I do first?* | A **deterministic, weighted scoring engine** ranks executable tasks and **explains why**. |
| *This goal is too big. Where do I start?* | **Gemini** decomposes a goal into a validated task graph with estimates and dependencies. |
| *How long will this really take?* | An **adaptive estimator** blends your guess with your actual measured session times. |
| *How do I stay with it?* | A single-task **Focus Mode** with step-by-step micro-actions and procedurally generated ambient sound. |

---

## ✨ What it does

- 🧠 **AI goal decomposition.** One click turns *"Ship my portfolio website"* into 9 sequenced tasks with time estimates and 11 dependency edges. It runs as an async Celery job and is validated before anything touches the database.
- 🕸️ **Dependency-aware workflows.** You can view a workflow as a list or as a graph. Edges you add by hand are cycle-checked, so circular dependencies and self-loops are rejected.
- 🪜 **One-click micro-steps.** Any task without steps (such as tasks from AI decomposition) can be broken into 5 small, support-mode-aware steps from Focus Mode.
- 🎯 **Explainable "Next Best Action".** The dashboard surfaces one task, with the reasons it won (*"unlocks 4 tasks · priority: medium"*).
- 📅 **Time-boxed daily plan.** It packs the highest-scoring executable tasks into your available minutes.
- ⏱️ **Execution tracking.** Start, pause, resume, complete or abandon sessions. A validated task state machine keeps status consistent.
- 📈 **Adaptive estimates and insights.** Weekly focus velocity, completion rate, goal distribution, and estimate-vs-actual calibration. Calibration uses only tasks with measured time, so it never reports accuracy it hasn't observed.
- 🗣️ **Natural-language task entry.** *"finish the tax report by tomorrow, it's urgent, about 2 hours"* becomes `{priority: URGENT, estimated_minutes: 120, deadline: <tomorrow>}`. Voice input is transcribed locally with **Faster-Whisper**.
- 🎧 **Procedural soundscapes.** Brown noise, rain, a water stream and 40 Hz binaural beats are synthesized in the browser with the **Web Audio API**. No audio files are downloaded.
- ♿ **Neuro-inclusive modes.** ADHD (momentum and micro-steps), Autism (explicit structure and predictability), Dyslexia (OpenDyslexic, spacing, contrast). There's also light and dark themes, zen mode, and font and spacing controls.

---

## 📸 A tour

> Every screenshot below is from a live run against the real backend and the Gemini API. None are mockups.

<table>
  <tr>
    <td width="50%">
      <img src="docs/images/dashboard.png" alt="Dashboard with next best action and today's plan" />
      <p align="center"><b>Dashboard</b>: an explainable "Next Best Action" plus an auto-generated, time-boxed plan for today.</p>
    </td>
    <td width="50%">
      <img src="docs/images/goal-workflow-graph.png" alt="Gemini-generated dependency graph" />
      <p align="center"><b>Workflow graph</b>: the task DAG Gemini generated from a one-line goal. Root tasks are actionable; everything else waits on its prerequisites.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/images/goal-workflow-list.png" alt="Workflow list view with active task" />
      <p align="center"><b>Workflow list</b>: the first executable task is promoted to <i>active</i>, with explicit <i>Blocked by</i> / <i>Unlocks</i> relationships.</p>
    </td>
    <td width="50%">
      <img src="docs/images/focus-mode.png" alt="Focus mode with AI-generated steps" />
      <p align="center"><b>Focus Mode</b>: one task, a calm elapsed timer, and AI-generated micro-steps to tick off.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/images/dashboard-dark.png" alt="Dark mode dashboard" />
      <p align="center"><b>Dark mode</b>: "Smoked Ink" palette, built on HSL design tokens.</p>
    </td>
    <td width="50%">
      <img src="docs/images/onboarding.png" alt="Onboarding support mode selection" />
      <p align="center"><b>Onboarding</b>: choose a cognitive support mode that changes how AI writes steps and how the UI behaves.</p>
    </td>
  </tr>
</table>

<p align="center">
  <img src="docs/images/mobile-focus-dark.png" alt="Mobile focus mode" width="260" /><br/>
  <sub><b>Fully responsive</b>: Focus Mode at 390 px, with no horizontal scroll.</sub>
</p>

---

## 🏗 Architecture

```mermaid
flowchart LR
    subgraph Client["Browser · React 18 + TypeScript + Vite"]
        UI["Pages & components<br/>(shadcn/Radix, Tailwind tokens)"]
        RQ["TanStack Query<br/>cache + invalidation"]
        AUD["Web Audio synth<br/>(procedural soundscapes)"]
        UI --> RQ
    end

    subgraph API["FastAPI · thin routers"]
        R["Routers<br/>auth · goals · tasks · steps · deps<br/>schedule · sessions · ai · ai-jobs · voice"]
        S["Service layer<br/>business logic"]
        E["Engine (pure functions)<br/>priority · dependency · adaptation · state machine"]
        R --> S --> E
    end

    subgraph Async["Background"]
        W["Celery worker<br/>process_ai_decomposition"]
    end

    RQ -- "REST + JWT" --> R
    S -- "SQLAlchemy" --> PG[("PostgreSQL 16<br/>Alembic migrations")]
    S -- "enqueue job" --> RD[("Redis<br/>broker · result backend · AI cache")]
    RD --> W
    W -- "persist tasks + edges<br/>in one transaction" --> PG
    S -. "step gen · NL parsing" .-> G(["Google Gemini"])
    W -. "goal decomposition" .-> G
    S -. "local STT" .-> FW(["Faster-Whisper"])
```

**Layering is deliberate.** Routers only handle HTTP concerns. Services own business rules and ownership checks. The `app/engine/` package holds **pure, side-effect-free functions** (scoring, graph algorithms, estimation, state transitions) that are unit-tested in isolation from the database and the network.

---

## 🔬 Engineering deep dive

### 1. AI decomposition as a validated async pipeline

LLM output is treated as **untrusted input**. Decomposition never blocks a request thread and never writes unvalidated data.

```mermaid
sequenceDiagram
    autonumber
    participant UI as React (GoalDetail)
    participant API as FastAPI
    participant DB as PostgreSQL
    participant Q as Redis / Celery
    participant W as Worker
    participant G as Gemini

    UI->>API: POST /goals/{id}/ai-decompose
    API->>DB: INSERT ai_job (PENDING)
    API->>Q: process_ai_decomposition.delay(job_id)
    API-->>UI: 202 Accepted {job_id}
    loop every 3s
        UI->>API: GET /ai-jobs/{job_id}
    end
    W->>DB: job → RUNNING
    W->>G: structured JSON prompt
    G-->>W: {"tasks":[{client_id, title, estimated_minutes, depends_on}]}
    W->>W: Pydantic schema + referential checks + cycle detection
    W->>DB: BEGIN · insert tasks · map client_id→id · insert edges · COMMIT
    W->>DB: job → SUCCEEDED (latency_ms, result_metadata)
    UI->>UI: invalidate goal + executable-task queries → re-render
```

- **Schema validation.** `AIDecompositionResponse` (Pydantic) enforces 1–20 tasks, title length, and estimates between 1 and 480 minutes.
- **Semantic validation.** It rejects duplicate `client_id`s, dangling `depends_on` references, self-dependencies, and **any cycle** (DFS with a recursion stack).
- **Atomic persistence.** The model refers to tasks by temporary `client_id`s. The worker `flush()`es to get real IDs, rewrites the edges, and commits once. Any failure rolls back.
- **Observable failure.** Jobs end in `SUCCEEDED` or `FAILED` with a typed `error_code` (`AI_PROVIDER_ERROR`, `PARSE_ERROR`, `VALIDATION_ERROR`, `PERSISTENCE_ERROR`, …) and record `latency_ms`.

### 2. Dependency graph and executability

Tasks and `task_dependencies` form a directed graph, and a task is **executable** when it's incomplete and all its prerequisites are complete. When you add an edge `A depends on B`, the engine temporarily inserts it and runs a DFS to check whether `B` is reachable from `A`. If it is, the edge would close a cycle and the request is rejected. This is **O(V + E) per insert**, which is the right trade-off for interactive edits on small, per-goal graphs.

The same graph drives **unlock value**: a task that unblocks four others is worth more than one that unblocks none.

### 3. Explainable priority scoring

`app/engine/priority.py` is a deterministic, weighted linear model. Each factor returns a `(score, human_reason)` pair, so the UI can show *why* a task was picked instead of acting as a black box.

| Factor | Weight | Signal |
|---|---:|---|
| Deadline urgency | **3.0** | Stepped by proximity: >7d → 1, ≤7d → 2, ≤3d → 3, ≤24h → 4, overdue → 5 + days (capped at 10) |
| Dependency unlock | **2.5** | Downstream tasks unblocked: 0 → 0, 1 → 1.5, 2–3 → 3, 4+ → 5 |
| User priority | **2.0** | LOW 1 · MEDIUM 2 · HIGH 3 · URGENT 4 |
| Overdue penalty | **5.0** | Extra push per day overdue (capped) |
| Postponement penalty | **1.5** | Tasks you keep deferring rise, so they can't silently rot |
| Effort fit | **1.0** | A negative score of −1 per 15 min over your available window (max −5) |

```
score(task) = Σ  weightᵢ · factorᵢ(task)
```

`select_plan()` ranks executable tasks greedily and packs them into the user's available minutes, marking the rest as overflow. That's how *"You have 90 minutes available today"* becomes a concrete plan.

### 4. Adaptive duration estimation

People routinely under- or over-estimate. FocusFlow blends your original estimate with your most recent measured session using an exponentially weighted update:

```
adjusted = α · latest_actual + (1 − α) · user_estimate        (α = 0.6)
```

Confidence scales with sample count (1 → low, 2–3 → medium, 4+ → high), and the Insights page shows average planned vs. actual time.

### 5. A real state machine for task status

Status transitions are validated in code rather than set freely:

```mermaid
stateDiagram-v2
    [*] --> TODO
    TODO --> IN_PROGRESS
    TODO --> COMPLETED
    TODO --> CANCELLED
    IN_PROGRESS --> PAUSED
    IN_PROGRESS --> COMPLETED
    IN_PROGRESS --> CANCELLED
    PAUSED --> IN_PROGRESS
    PAUSED --> COMPLETED
    PAUSED --> CANCELLED
    COMPLETED --> TODO : reopen
    CANCELLED --> TODO : reopen
```

`is_completed` is derived from status on every transition, so the two can never disagree. Invalid moves return a message listing the allowed transitions.

### 6. Resilient AI integration

| Concern | Approach |
|---|---|
| **No key / provider down** | The backend boots without Gemini. Step generation falls back to **support-mode-specific** templates (ADHD / Autism / Dyslexia), and NL parsing returns a clean `503`, so the UI degrades to the local regex parser. |
| **Cost and latency** | Generated steps are cached in **Redis** for 1 h, keyed by `(support_mode, normalized title)`. Redis is optional, and the cache is skipped if it's unreachable. |
| **Event-loop safety** | Blocking Gemini calls in async routes run via `run_in_threadpool`. Heavy decomposition runs off-request in Celery. |
| **Output hygiene** | Parsed fields are coerced and bounded: priority is restricted to an enum, minutes must be between 0 and 1440, and deadlines must be ISO dates. Anything invalid becomes `null` instead of crashing the client. |
| **Untrusted model output** | Every response is parsed and validated against a schema before use, and NL-parsing prompts JSON-encode user text. |
| **Model choice** | It's centralized in one setting (`GEMINI_MODEL`, default `gemini-3.5-flash-lite`) shared by the API, worker, and job records. |

### 7. Frontend engineering

- **TanStack Query** is the single source of server state. Mutations invalidate precise query keys (for example `['tasks','executable']`) instead of refetching the world.
- **Design tokens.** Theming uses HSL CSS variables (a "Washi paper / sumi ink" palette) with light and dark modes, and nothing is hard-coded per component.
- **Accessibility built in.** OpenDyslexic toggle, adjustable font size, line and letter spacing, high contrast, reduced text density, and accessible names across interactive elements.
- **Code splitting.** Routes are lazy-loaded, and heavy views like Insights and charts ship as separate chunks.
- **Zero-asset audio.** `audio-synthesizer.ts` builds brown noise, rain, a stream, and binaural beats from oscillators and noise buffers at runtime.

---

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript 5.8, Vite 5, TanStack Query 5, React Router 6, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Recharts, Zod, React Hook Form |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, python-jose (JWT), passlib/bcrypt |
| **Async and data** | PostgreSQL 16, Redis 7, Celery 5 |
| **AI** | Google Gemini (`google-genai`), Faster-Whisper (local speech-to-text) |
| **Quality** | Pytest, Vitest, Playwright, ESLint, `tsc` type-checking, GitHub Actions CI |
| **Ops** | Docker, Docker Compose |

---

## 🚀 Quick start

**Prerequisites:** Docker, Python 3.11+, Node.js 20+, and optionally a [Gemini API key](https://aistudio.google.com/apikey).

```bash
# 1. Clone and configure
git clone https://github.com/GouravLuinor/focusflow.git && cd focusflow
cp .env.example Backend/.env          # set SECRET_KEY, DATABASE_URL, REDIS_URL, GEMINI_API_KEY

# 2. Infrastructure (Postgres + Redis)
docker compose up -d db redis

# 3. Backend
python -m venv .venv && source .venv/bin/activate
pip install -r Backend/requirements.txt
cd Backend
alembic upgrade head
uvicorn app.main:app --reload --port 8000          # API docs → http://localhost:8000/docs

# 4. Worker (separate terminal, needed for AI goal decomposition)
cd Backend && source ../.venv/bin/activate
celery -A app.core.celery_config worker --loglevel=info

# 5. Frontend (separate terminal)
cd frontend/focusflow-hub
npm install
npm run dev                                         # → http://localhost:8080
```

Or run everything at once with `./start.sh`.

<details>
<summary><b>Environment variables</b></summary>

| Variable | Required | Purpose |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing key (32+ random chars) |
| `DATABASE_URL` | – | Defaults to SQLite (`sqlite:///./dev.db`). Use `postgresql://focusflow:focusflow_dev@localhost:5432/focusflow` with Docker. |
| `REDIS_URL` | – | Defaults to `redis://localhost:6379/0`. Used as the Celery broker and the AI cache. |
| `GEMINI_API_KEY` | – | Enables AI features. Without it, the app runs with deterministic fallbacks. |
| `GEMINI_MODEL` | – | Overrides the model (default `gemini-3.5-flash-lite`) |

`.env` files are gitignored. Never commit real keys.
</details>

---

## 🔌 API surface

The API exposes 39 routes. Interactive OpenAPI docs are at `/docs`.

| Area | Endpoints |
|---|---|
| **Auth** | `POST /auth/signup` · `POST /auth/login` · `GET /auth/me` |
| **Profile** | `POST /profile` · `GET /profile/me` (support mode, onboarding) |
| **Goals** | CRUD `/goals` · `GET /goals/{id}/workflow-order` · `POST /goals/{id}/ai-decompose` → `202` |
| **Tasks** | CRUD `/tasks` · `GET /tasks/executable` · `GET /tasks/{id}/blocking` · `GET /tasks/{id}/estimate` · `GET /tasks/{id}/focus` |
| **Dependencies** | `POST/GET /tasks/{id}/dependencies` (cycle-validated) · `DELETE /tasks/{id}/dependencies/{dep_id}` · `GET /tasks/{id}/dependents` |
| **Steps** | CRUD `/tasks/{id}/steps` · `POST /tasks/{id}/steps/generate` (AI micro-steps for a task without steps) |
| **Scheduling** | `POST /schedule/generate` · CRUD `/schedule/blocks` |
| **Sessions** | `POST /sessions` · `…/pause` · `…/resume` · `…/complete` · `…/abandon` · `GET /sessions/active` · `GET /tasks/{id}/events` |
| **AI** | `POST /ai/generate-steps` · `POST /ai/parse-task` · `GET /ai-jobs/{id}` · `GET /ai-jobs` |
| **Voice** | `POST /voice/transcribe` (Faster-Whisper, size-limited upload) |

---

## 🧪 Testing

| Suite | Scope | Result |
|---|---|---|
| **Backend (pytest)** | Priority engine (45), dependency engine and cycle detection (34), sessions and task APIs (13), voice and AI APIs (13), AI step generation (6) | **111 passing** |
| **Frontend (Vitest)** | API client, deadline parsing, stats aggregation, estimation calibration, app context | **36 passing** |
| **Type-check** | `tsc --noEmit` over the whole app | **0 errors** |
| **E2E (Playwright)** | Full user flows: signup → onboarding → goals → focus | `tests/e2e/` |
| **Live Gemini E2E** | `generate-steps`, `parse-task`, and the full `ai-decompose` → Celery → DAG persistence path against the real API | **All passing** (decomposition ≈ 3.3 s) |

```bash
# Backend
cd Backend && python -m pytest tests/ -v

# Frontend
cd frontend/focusflow-hub
npm test                 # vitest
npx tsc --noEmit -p tsconfig.app.json
npm run lint
npx playwright test
```

CI runs the backend suite against real **PostgreSQL 16 + Redis 7** service containers on every push.

---

## 📁 Project structure

```
focusflow/
├── Backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (thin HTTP layer)
│   │   ├── services/     # Business logic, ownership checks, AI integration
│   │   ├── engine/       # Pure algorithms: priority · dependency · adaptation · state machine
│   │   ├── worker/       # Celery tasks (AI decomposition pipeline)
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic request/response + AI output contracts
│   │   ├── core/         # Config, JWT auth, Celery config
│   │   └── db/           # Engine/session management
│   ├── alembic/          # Versioned migrations
│   └── tests/            # Pytest suites
├── frontend/focusflow-hub/
│   ├── src/
│   │   ├── pages/        # Dashboard, GoalDetail, FocusMode, Insights, Settings, …
│   │   ├── components/   # Goals (graph/list), dashboard, focus, schedule, ui (shadcn)
│   │   ├── hooks/        # Voice input, accessibility, data hooks
│   │   └── lib/          # API client, voice parser, audio synthesizer
│   └── tests/e2e/        # Playwright specs
├── docker-compose.yml    # Postgres · Redis · worker
└── .github/workflows/    # Backend + frontend CI
```

---

## 🗺 Roadmap

- [ ] Learn per-user scoring weights from which recommendations actually get completed
- [ ] Streaming decomposition updates over WebSockets instead of polling
- [ ] Calendar sync for schedule blocks

---

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center"><sub>Built by <a href="https://github.com/GouravLuinor">Gourav Kumar Singh</a> · calm productivity for every kind of mind.</sub></div>
