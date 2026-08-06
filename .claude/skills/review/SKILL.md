---
name: review
description: Use before completing every coding task. Perform a complete engineering review covering architecture, TypeScript, React, API design and overall code quality. Consider the implementation incomplete until all review checks pass.
---

# Philosophy

Writing code is only half of the task.

Before considering any implementation complete, perform a full engineering review.

Never assume the first implementation is the best implementation.

Review the solution as if you were reviewing another engineer's pull request.

---

# Architecture Review

Verify that:

- responsibilities remain separated
- dependency direction is preserved
- business logic is not duplicated
- every concern has a single owner
- no new architectural violations were introduced

---

# TypeScript Review

Verify that:

- no `any` was introduced
- no duplicated types exist
- no unnecessary assertions exist
- external data is validated
- public APIs expose explicit types
- strict typing is preserved

---

# React Review

Verify that:

- components focus on rendering
- business logic remains outside UI
- state has one owner
- derived state is not stored
- unnecessary effects were not introduced
- components remain focused

---

# API Review

Verify that:

- request logic is not duplicated
- transport models stay inside the API layer
- runtime validation exists
- error handling is consistent
- failures are never ignored

---

# Code Quality Review

Verify that:

- no duplicated logic exists
- no duplicated constants exist
- no dead code exists
- no unused exports exist
- no magic values were introduced
- naming clearly communicates intent

---

# Simplicity Review

Ask yourself:

- Can this be simpler?
- Can existing code be reused?
- Can duplication be eliminated?
- Can responsibilities be separated more clearly?
- Can another developer understand this immediately?

Prefer the simplest correct solution.

---

# Before Finishing

Do not finish a task until all answers are **Yes**.

- Is the architecture still clean?
- Is the solution consistent with existing code?
- Is there only one implementation of every behavior?
- Is every responsibility clearly owned?
- Is every external input validated?
- Is the code easy to understand?
- Would this pass a professional code review?

If any answer is **No**, continue improving the implementation before completing the task.
