---
name: react
description: Use proactively whenever creating or modifying React components, hooks or state management. Apply to enforce component responsibilities, state ownership, rendering patterns, hook composition and React best practices.
---

# Philosophy

React is responsible for rendering the UI.

A component should describe what to render, not how the business works.

Business logic belongs outside components whenever possible.

Prefer composition over large components.

---

# Component Responsibility

Every component should have one responsibility.

Components should:

- receive data
- render UI
- emit events

Components should not:

- implement business rules
- communicate directly with APIs
- duplicate formatting logic
- duplicate validation logic

---

# Component Design

Prefer small focused components.

Large components usually indicate multiple responsibilities.

Split components by responsibility, not by line count.

Extract reusable UI instead of copying JSX.

---

# Hooks

Custom hooks coordinate behavior.

Hooks are responsible for:

- state
- side effects
- asynchronous operations
- subscriptions

Hooks should not render UI.

---

# useEffect

Use useEffect only for synchronization with external systems.

Examples:

- HTTP requests
- subscriptions
- timers
- browser APIs

Do not use useEffect for:

- derived state
- filtering
- sorting
- formatting
- calculations

If a value can be computed during render, compute it during render.

---

# State Management

Store the minimum amount of state.

Prefer source data.

Derive everything else.

Do not store derived values.

Avoid duplicate state representing the same information.

---

# State Ownership

State belongs to the lowest common owner.

Do not duplicate the same state across components.

Lift state only when multiple components genuinely need it.

---

# Derived State

Avoid storing values that can be calculated.

Examples include:

- filtered lists
- sorted collections
- formatted values
- totals
- labels
- computed flags

Calculate instead of storing.

---

# Data Flow

Data flows downward.

Events flow upward.

Avoid hidden communication between components.

Keep component interfaces explicit.

---

# Props

Props should be small and meaningful.

Avoid passing unnecessary objects.

Prefer explicit props over generic configuration objects.

Avoid prop drilling when proper composition solves the problem.

---

# Rendering

Rendering should be deterministic.

The same input should always produce the same output.

Avoid hidden side effects during rendering.

Never mutate props.

Never mutate state directly.

---

# Composition

Prefer composition over duplication.

Extract reusable UI patterns.

Avoid creating nearly identical components with copied implementations.

---

# Performance

Optimize only after identifying a real bottleneck.

Do not introduce memoization by default.

Use:

- React.memo
- useMemo
- useCallback

only when they solve a measurable problem.

Correctness is more important than micro-optimizations.

---

# Decision Process

Before creating a new component ask:

1. Does a similar component already exist?
2. Can it be reused?
3. Is this responsibility already implemented?
4. Does this belong in a hook?
5. Does this belong in the domain layer?
6. Is state actually required?
7. Can this value be derived?

Only then create a new component.

---

# Success Criteria

A task is complete only if:

- components focus on rendering
- state has one owner
- derived state is not stored
- business logic remains outside UI
- side effects are isolated
- reusable UI was not duplicated

---

# Review Checklist

Before completing work verify:

- No duplicated components
- No duplicated JSX
- No business logic inside components
- No unnecessary useEffect
- No duplicated state
- No derived state stored
- No prop mutation
- No state mutation
- Components remain focused
- Rendering remains predictable