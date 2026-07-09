# FocusFlow Agent Instructions

## Project Context

FocusFlow is an existing partially completed full-stack application.

The repository contains:

- `Backend/` — Python backend application
- `Backend/app/api/` — API routes
- `Backend/app/core/` — core configuration and shared infrastructure
- `Backend/app/db/` — database layer
- `Backend/app/models/` — database/domain models
- `Backend/app/schemas/` — validation and API schemas
- `Backend/app/services/` — business logic and service layer
- `Backend/app/main.py` — backend application entry point
- `Backend/dev.db` — local development database
- `frontend/focusflow-hub/` — primary frontend application using Vite and TypeScript
- `dockerfile` — container configuration

This is not a greenfield project. Preserve existing working behavior.

---

## Primary Development Rules

1. Read relevant existing code before modifying anything.
2. Do not rewrite working modules without a demonstrated reason.
3. Preserve the current architecture unless a change is explicitly approved.
4. Prefer incremental changes over large rewrites.
5. Reuse existing utilities, services, schemas, components, and patterns.
6. Avoid duplicate logic.
7. Follow existing naming conventions and code style.
8. Keep changes scoped to the requested task.
9. Do not silently change API contracts.
10. Do not silently change database schemas.

---

## Mandatory Workflow Before Coding

For every non-trivial task:

1. Inspect relevant files.
2. Trace the current implementation.
3. Identify affected frontend and backend components.
4. Identify API and database impact.
5. Identify regression risks.
6. Produce a concise implementation plan.

For major architectural changes, wait for explicit approval before implementation.

---

## Backend Rules

When modifying the backend:

- Preserve separation between API routes, schemas, models, services, and database logic.
- Keep route handlers thin where practical.
- Put business logic in the appropriate service layer.
- Reuse existing schemas and models.
- Validate request and response structures.
- Preserve existing API compatibility unless explicitly asked otherwise.
- Do not modify `Backend/dev.db` directly unless the task explicitly requires database changes.
- Do not introduce new dependencies without explaining why they are needed.

---

## Frontend Rules

The primary frontend appears to be:

`frontend/focusflow-hub/`

When modifying the frontend:

- Inspect existing components before creating new ones.
- Reuse existing UI patterns.
- Preserve TypeScript type safety.
- Avoid unnecessary `any`.
- Preserve existing routing and state-management patterns.
- Do not duplicate API client logic.
- Keep components focused and maintainable.
- Maintain responsive behavior.

---

## Package Structure Safety

The repository currently contains package files at both:

- `frontend/package.json`
- `frontend/focusflow-hub/package.json`

Do not delete, merge, move, or rewrite these package boundaries until their purpose has been investigated and verified.

---

## Git Safety

- Current development branch: `antigravity-dev`
- Never force push.
- Never rewrite Git history.
- Never commit secrets.
- Never commit `.env` files.
- Never switch to or modify `main` unless explicitly instructed.
- Do not create commits unless explicitly requested.
- Before completing a task, inspect the Git diff.

---

## Security Rules

- Never expose API keys, passwords, tokens, or credentials.
- Never print secret environment-variable values.
- Do not commit secrets.
- Do not weaken authentication or authorization for convenience.
- Flag potential security issues when discovered.

---

## Dependency Rules

Before adding a dependency:

1. Check whether the project already has an equivalent dependency.
2. Explain why the new dependency is necessary.
3. Prefer maintained and minimal dependencies.
4. Do not perform broad dependency upgrades unless explicitly requested.

---

## Verification After Changes

After implementation:

1. Run relevant backend tests if available.
2. Run relevant frontend tests if available.
3. Run linting if configured.
4. Run type checking if configured.
5. Check for obvious regressions.
6. Inspect `git diff`.
7. Summarize exactly which files changed.
8. Report unresolved issues.

Never claim a command or test passed unless it was actually executed successfully.

---

## Agent Communication

Clearly distinguish:

- verified facts
- assumptions
- recommendations
- unresolved questions

If uncertain, inspect the repository instead of guessing.

Do not claim that a feature exists unless verified in code.

Do not claim that a bug is fixed unless the relevant behavior was tested.