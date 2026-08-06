---
name: api
description: Use proactively whenever implementing or modifying API clients, HTTP requests, external integrations or data fetching. Apply to enforce consistent request handling, runtime validation, error handling and separation between transport and domain models.
---

# Philosophy

The API layer is the application's boundary with the outside world.

External systems are unreliable.

The rest of the application should never need to know how external data is fetched.

The API layer exists to isolate uncertainty from the rest of the system.

---

# Responsibilities

The API layer is responsible for:

- making requests
- validating responses
- transforming transport models
- handling transport errors

The API layer is not responsible for:

- business rules
- UI decisions
- rendering
- formatting
- application state

---

# Single Source of Truth

Every external resource has one implementation.

Do not create multiple clients for the same endpoint.

Do not duplicate:

- fetch logic
- retry logic
- authentication
- request configuration
- error mapping

Shared behavior belongs in one place.

---

# External Data

Everything received from external systems is untrusted.

Never expose raw API responses to the application.

Validate responses before returning them.

Only validated domain models leave the API layer.

---

# Request Design

Every request should behave consistently.

Use the same approach for:

- authentication
- retries
- cancellation
- timeout handling
- headers
- error handling

Avoid special cases unless absolutely necessary.

---

# Transport vs Domain

Transport models describe the API.

Domain models describe the application.

Do not leak transport models outside the API layer.

Transform transport data into domain models immediately.

---

# Error Handling

Every request must define how failures are handled.

Never ignore request failures.

Do not silently return:

- null
- undefined
- empty arrays

unless they are valid business values.

Errors should be predictable and consistent.

---

# Side Effects

The API layer performs communication only.

Avoid:

- business calculations
- formatting
- filtering
- sorting
- permission checks

Those belong elsewhere.

---

# Reuse

Before creating a new request ask:

- Does a similar request already exist?
- Can an existing client be extended?
- Can existing request infrastructure support this?

Avoid parallel implementations.

---

# Decision Process

Before adding a new API function ask:

1. Does this endpoint already exist?
2. Can an existing request be reused?
3. Is validation present?
4. Does this leak transport models?
5. Is error handling consistent?
6. Does this introduce duplicated request logic?

Only then implement the request.

---

# Success Criteria

A task is complete only if:

- external data is validated
- transport models remain inside the API layer
- duplicated request logic was not introduced
- request behavior remains consistent
- failures are handled predictably

---

# Review Checklist

Before completing work verify:

- No duplicated request logic
- No duplicated retry logic
- No raw API responses outside the API layer
- Runtime validation exists
- Errors are handled consistently
- Authentication remains centralized
- No business logic inside API
- No formatting inside API
- No transport model leaks