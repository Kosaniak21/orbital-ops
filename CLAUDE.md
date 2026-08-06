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

- Reuse before creating.
- Every concern has one source of truth.
- Never duplicate logic, types or constants.
- Validate all external data.
- Strict TypeScript is required.
- Keep responsibilities small and focused.
- Review every implementation before completion.

## Skills

Use `.claude/skills/engineering-typescript/SKILL.md`
for TypeScript, domain models and runtime validation.

Use `.claude/skills/engineering-architecture/SKILL.md`
for project structure and module design.

Use `.claude/skills/engineering-react/SKILL.md`
for components, hooks and state management.

Use `.claude/skills/engineering-api/SKILL.md`
for API clients and external integrations.

Always use `.claude/skills/engineering-review/SKILL.md`
before considering a task complete.
