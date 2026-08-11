# Orbital Ops

React + TypeScript dashboard for the ISS Kruger-60 mission control.

## Commands

- `npm run dev` — Start the development server.
- `npm run validate` — Must pass before any task is considered complete.

## Architecture

The project follows a layered architecture.

components
↓
hooks
↓
domain
↓
api
↓
external systems

Rules:

- Components render UI.
- Hooks manage state and side effects.
- Domain contains business logic.
- API communicates with external systems.
- Dependencies flow downward only.

## Conventions

- **Single source of truth:** One owner per concern—types, logic, constants, config.
- **No duplication:** Reuse before creating. If it exists, extend it.
- **Validation required:** All external data (APIs, JSON, browser APIs) enters validated.
- **Strict TypeScript:** No `any`, no assertions, imports before types—model the domain.
- **Components render only:** Business logic → domain; state coordination → hooks; UI → components.
- **Review before finishing:** Check for duplication, test coverage, missing validation.

## Skills

Use `.claude/skills/new-widget/SKILL.md` to scaffold dashboard widgets with typed data hooks, pure domain logic, and colocated tests.
