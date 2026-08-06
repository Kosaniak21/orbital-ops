---
name: architecture
description: Use proactively whenever adding features, creating modules, moving code, introducing new files, hooks, components or services. Apply to maintain clear architecture, single responsibility, module boundaries and a single source of truth across the project.
---

# Philosophy

Architecture should reduce complexity, not hide it.

Every file, module and function should have one clear responsibility.

A feature should fit naturally into the existing architecture without introducing duplication or breaking module boundaries.

Prefer extending existing systems over creating parallel implementations.

---

# Single Source of Truth

Every concept has exactly one owner.

Examples include:

- business rules
- configuration
- constants
- formatting
- validation
- retry logic
- status calculation
- permission logic

If changing one business rule requires editing multiple unrelated files, the architecture is incorrect.

---

# Separation of Responsibilities

Each layer has one responsibility.

Components render UI.

Hooks coordinate state and side effects.

Domain contains business logic.

API communicates with external systems.

Utilities contain generic reusable helpers.

Do not mix responsibilities between layers.

---

# Dependency Direction

Dependencies always point downward.

Components

↓

Hooks

↓

Domain

↓

API

Lower layers must never depend on higher layers.

Avoid circular dependencies.

---

# Module Design

A module should solve one problem.

Do not group unrelated functionality because it is convenient.

Related code should stay together.

Unrelated code should live in separate modules.

---

# Business Logic

Business rules belong to the domain layer.

Business logic should not exist inside:

- React components
- API clients
- utility functions
- configuration files

Domain logic should be reusable without React or browser APIs.

---

# Reuse Before Creating

Before writing new code ask:

- Does this already exist?
- Can it be extended?
- Can it be generalized?
- Can the existing implementation support this use case?

Never duplicate behavior simply because modifying existing code appears harder.

---

# Components

Components should focus on rendering.

Avoid components responsible for:

- fetching data
- business decisions
- data transformation
- formatting
- permission checks

Move those concerns into the appropriate layer.

---

# Constants

Operational values should exist once.

Never duplicate:

- thresholds
- polling intervals
- timeout values
- retry limits
- colors with business meaning
- feature flags

Every important constant has one owner.

---

# Dead Code

Unused code increases maintenance cost.

Do not keep:

- unused exports
- unused utilities
- legacy components
- commented implementations
- backup code

Version control preserves history.

The repository should contain only active code.

---

# File Organization

Files should be organized by responsibility, not convenience.

Avoid dumping unrelated helpers into large utility files.

Prefer cohesive modules over generic folders.

Keep related types, logic and tests close together.

---

# Complexity

Prefer many small focused modules over one large module.

If a file requires scrolling through unrelated responsibilities, split it.

Complexity should grow by composition, not accumulation.

---

# Decision Process

Before creating a new module ask:

1. Does this responsibility already exist?
2. Can an existing module be extended?
3. Does this introduce duplicated logic?
4. Is the ownership clear?
5. Does this belong to another layer?
6. Will another developer know where to find this?

Only then create a new module.

---

# Success Criteria

A task is complete only if:

- responsibilities remain separated
- duplicated logic was not introduced
- every business rule has one owner
- dependency direction remains correct
- no dead code was created
- module boundaries remain clear

---

# Review Checklist

Before completing work verify:

- No duplicated business logic
- No duplicated constants
- No circular dependencies
- No dead code
- No unused exports
- No mixed responsibilities
- No business logic inside UI
- No configuration duplication
- Every module has one responsibility
- Architecture remains consistent