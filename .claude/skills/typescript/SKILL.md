---
name: typescript
description: Use proactively whenever writing, modifying, reviewing or generating TypeScript code. Apply before creating new types, interfaces, functions, API contracts or domain models. Enforce strict typing, runtime validation and maintainable type design.
---

# Philosophy

TypeScript models the domain, not the implementation.

The type system should prevent invalid states instead of documenting valid ones.

If the compiler complains, prefer improving the design instead of bypassing the type system.

Optimize for correctness, readability and maintainability over convenience.

---

# General Principles

- Always write code compatible with `strict: true`.
- Prefer compile-time guarantees over runtime assumptions.
- Prefer explicit domain models over primitive types.
- Keep types as narrow as possible.
- A type should have one clear responsibility.
- Reuse existing types before creating new ones.

---

# Type Modeling

Use `type` by default.

Use `interface` only when:

- declaration merging is required
- implementing classes
- extending third-party library contracts

Do not create interfaces simply because the shape is an object.

Prefer literal unions instead of generic strings.

Prefer discriminated unions over multiple boolean flags.

Model domain concepts explicitly instead of using primitive aliases everywhere.

---

# Source of Truth

Every domain model has exactly one owner.

Never duplicate:

- entity types
- DTOs
- response models
- request models
- enums represented as unions

If a type already exists:

- import it
- compose it
- extend it

Never redefine it.

---

# Type Composition

Prefer composition over duplication.

Before creating a new type consider:

- Pick
- Omit
- Partial
- Required
- Readonly
- Record
- intersections
- unions

Reuse existing information whenever possible.

---

# External Data

Everything outside the application is untrusted.

Examples:

- API responses
- JSON.parse
- localStorage
- sessionStorage
- URL parameters
- browser APIs
- third-party libraries

Treat all external data as `unknown`.

Validate it before using it.

Never trust external data because documentation says it is correct.

---

# Runtime Validation

Compile-time types do not validate runtime data.

Every external payload entering the application should be validated using the project's runtime validation library.

Never replace validation with:

- `as`
- `as any`
- double assertions

Validation creates trusted domain models.

---

# Forbidden Patterns

Never introduce:

- any
- as any
- implicit any
- double assertions
- non-null assertions unless unavoidable
- ts-ignore without documented justification
- duplicated types
- duplicated interfaces
- duplicated DTOs

These are design problems, not compiler problems.

---

# Functions

Public functions must expose explicit parameter and return types.

Function signatures should communicate intent.

Avoid hidden mutations.

Avoid side effects unless they are the function's primary responsibility.

---

# Error Modeling

Errors are part of the domain.

Do not communicate failures using unrelated values such as:

- null
- undefined
- false
- empty arrays

Represent failures explicitly and consistently.

---

# Constants

Avoid magic strings representing finite states.

Avoid magic numbers with business meaning.

Domain concepts deserve dedicated types instead of repeated literals.

---

# Decision Process

Before creating a new type ask:

1. Does a similar type already exist?
2. Can it be reused?
3. Can utility types derive it?
4. Can composition solve the problem?
5. Is this actually a new domain concept?
6. Does external data require validation?
7. Does this improve the domain model?

Only create a new type if the answer justifies it.

---

# Success Criteria

A task is complete only if:

- strict mode passes
- no new `any` exists
- no duplicated types were introduced
- external data is validated
- public APIs expose explicit types
- domain models remain the single source of truth
- invalid states are difficult or impossible to represent

---

# Review Checklist

Before completing work verify:

- No `any`
- No `as any`
- No duplicated types
- No duplicated interfaces
- No duplicated DTOs
- No unchecked external data
- Runtime validation exists
- Public APIs have explicit types
- Union types are exhaustive where appropriate
- Utility types were preferred over duplication
- No unnecessary assertions
- Domain models remain consistent
