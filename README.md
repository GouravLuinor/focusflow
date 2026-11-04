# FocusFlow — Adaptive Workflow & Execution Platform

[![Backend CI](https://github.com/GouravLuinor/focusflow/actions/workflows/backend.yml/badge.svg)](https://github.com/GouravLuinor/focusflow/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/GouravLuinor/focusflow/actions/workflows/frontend.yml/badge.svg)](https://github.com/GouravLuinor/focusflow/actions/workflows/frontend.yml)

A full-stack, neuro-inclusive workflow execution platform that converts high-level goals into persistent, dependency-aware task graphs, dynamically schedules executable work based on deadlines and constraints, and adapts to user execution rhythms.

**Crafted with the Japanese Paper & Sumi Ink ("Wabi-Sabi Editorial") design philosophy for ADHD, Autism, and Dyslexia.**

---

## 🎯 What FocusFlow Does

FocusFlow answers one question: **"What should I work on right now?"**

Unlike traditional todo apps that overwhelm users with unstructured lists, FocusFlow:
- **Computes Executability:** Only surfaces tasks whose prerequisites and dependencies are met (`A → B → C`).
- **Ranks Dynamically:** Uses multi-factor priority scoring (deadlines, unlock value, postponement penalty, and effort fit).
- **Explains Decisions:** Provides transparent, human-readable rationale for every recommendation.
- **Calibrates Estimates:** Automatically learns and adjusts planned duration multipliers from actual execution history.
- **Sensory Focus Sanctuary:** Delivers procedural ambient soundscapes and single-task focus environments.

---

## 🎋 Aesthetic & Design Philosophy: Japanese Paper & Sumi Ink

FocusFlow features an anti-slop, sensory-ergonomic design system:
- **Canvas:** Warm Washi Paper `#F4F0EA` (Light) / Smoked Ink `#121214` (Dark) — zero glare, zero visual vibration.
- **Primary CTA:** Japanese Lacquer Vermilion `#D34E24` (Light) / Ember Vermilion `#E05D34` (Dark) — high salience for ADHD task initiation without panic.
- **Typography:** Lexend & Plus Jakarta Sans with full **OpenDyslexic** toggle support.
- **Clean Token Engine:** HSL CSS variables with zero brute-force CSS overrides.

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────┐
│              React 18 + Vite + TypeScript                │
│    Wabi-Sabi Sumi Ink Tokens · Framer Motion · Recharts   │
│    Web Audio API Sound Synth · TanStack Query · Tailwind │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    FastAPI Backend                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │   Auth   │ │  Goals   │ │  Tasks   │ │  Scheduler  │  │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Voice & Telemetry Layer               │  │
│  │     Faster-Whisper (Local) · Gemini (Optional)     │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │PostgreSQL│  │  Redis   │  │  Alembic │
    │ 16+ JSONB│  │ (Cache)  │  │(Migrates)│
    └──────────┘  └──────────┘  └──────────┘
```

---

## ✨ Key Capabilities

### 🧠 Dependency-Aware Workflow Engine
- Tasks can depend on other tasks (`A → B → C`).
- **DFS cycle detection** — prevents circular dependency locks and self-loops.
- **Executable task computation** — unblocked tasks are immediately actionable.
- **Workflow Order & Graph View** — toggle between structured lists and visual topological graphs.

### 📊 Adaptive Priority Scheduler
- Priority scoring combines 6 weighted factors:
  - Deadline urgency · User priority · Dependency unlock value
  - Overdue penalty · Postponement penalty · Available effort fit
- **Explainable recommendations** with transparent reasoning.
- **Schedule Blocks** with persistent timeline slots and manual block scheduling.

### 🎧 Procedural Sensory Regulation Audio
- Built-in, zero-bandwidth browser sound synthesizer in Focus Mode:
  - 🎋 **Bamboo Temple Stream:** Gentle water resonance.
  - 🌧️ **Washi Paper Rain:** Pink noise acoustic shield.
  - 🤎 **Deep Brown Noise:** Brownian speech-masking for ADHD focus.
  - 🎧 **40Hz Binaural Beats:** Gamma wave cognitive flow frequency.

### 🎤 Voice Input with Faster-Whisper
- Local voice transcription via **Faster-Whisper** (`POST /voice/transcribe`).
- Speak tasks naturally to bypass typing friction during executive dysfunction.
- Regex and AI parsers extract task titles, estimated duration, priority, and deadlines.

### ⏱ Execution Tracking & State Machine
- Execution sessions (`/sessions`) track started, paused, and completed durations.
- Persistent `Task.status` column (`TODO`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CANCELLED`) kept in sync with task completion.
- **Adaptive duration calibration:** Calculates estimation accuracy ratios to adjust future timelines.

### ♿ Neuro-Inclusive Modes
- **ADHD Mode:** Single-task focus slate, 25m momentum blocks, hidden secondary columns, calm elapsed timers.
- **Autism Mode:** Explicit dependency badges, structured subtask checklists, predictable multi-day week timelines.
- **Dyslexia Mode:** OpenDyslexic typography, relaxed line spacing, high-distinction borders.

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose (for PostgreSQL & Redis)
- Python 3.11+
- Node.js 20+

### 2. Start Supporting Services
```bash
docker compose up -d
```

### 3. Start Backend
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 4. Start Frontend
```bash
cd frontend/focusflow-hub
npm install
npm run dev -- --port 8080
```

Open `http://localhost:8080` in your browser.

---

## 🧪 Testing & Verification

### Backend Unit & Integration Tests
```bash
cd Backend
pytest tests/ -v
python test_api.py
```

### Frontend TypeScript Check & Build
```bash
cd frontend/focusflow-hub
npx tsc --noEmit
npm run build
```

### End-to-End Playwright Audit
```bash
cd frontend/focusflow-hub
npx playwright test tests/e2e/comprehensive-audit.spec.ts --reporter=list
```

---

## 📄 License
MIT
