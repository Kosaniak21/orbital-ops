---
name: new-widget
description: Scaffold a new dashboard widget with pure domain logic, colocated unit tests, typed data hooks, and grid registration.
allowed-tools: Read, Write, Edit, Bash(npx vitest:*)
---

# Scaffold New Dashboard Widget

Use this skill when tasked with creating or scaffolding a new dashboard widget.

## Architecture Guidelines

All dashboard widgets must adhere to strict separation of concerns:

1. **Pure Domain Logic:** Isolated in `src/domain/widgets/` with zero React dependencies.
2. **Colocated Unit Tests:** Placed adjacent to domain logic (`src/domain/widgets/<name>.test.ts`).
3. **UI Component:** Placed in `src/components/widgets/` utilizing the shared typed data hook.
4. **Grid Registration:** Registered in the dashboard layout configuration.

---

## Scaffolding Workflow

Follow these steps sequentially to create the widget:

### Step 1: Review Templates

Read the template reference for code structures and patterns:

- See [Widget Template Reference](references/widget-template.md) for pure logic, test, UI component, and grid registration boilerplate.

### Step 2: Create Pure Domain Logic

- Create `src/domain/widgets/<widget-kebab-name>.ts`.
- Export typed data structures and pure calculation/formatting functions.

### Step 3: Create Colocated Unit Test

- Create `src/domain/widgets/<widget-kebab-name>.test.ts`.
- Write unit tests covering domain calculation edge cases.

### Step 4: Create Typed Data Hook

- Create `src/hooks/use<WidgetName>Data.ts`.
- Use the shared `useApiResource` hook for consistent fetch/retry/error handling.

### Step 5: Create UI Component

- Create `src/components/widgets/<WidgetName>Widget.tsx`.
- Accept computed metrics as props (all logic pre-computed by domain).
- Use `MetricTile` for consistent styling.
- Apply status classes (tile-ok, tile-warn, tile-bad) based on domain thresholds.

### Step 6: Register in Dashboard

- Import the hook and domain logic in `src/components/TilesGrid.tsx`.
- Compute metrics using domain functions.
- Render the widget alongside existing tiles.

### Step 7: Run Tests & Validate

Execute vitest to verify domain logic:

```bash
npx vitest run src/domain/widgets/<widget-kebab-name>.test.ts
```

Then validate the full project:

```bash
npm run validate
```
