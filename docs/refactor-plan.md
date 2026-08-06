# Refactor Plan — Orbital Ops

## Why

`npm run validate` fails today across lint, typecheck, coverage, and
duplication. Research (see below) traced every failure back to six smell
clusters, all called out in ASSIGNMENT.md Exercise 1. This plan orders the
fixes, defines the target structure, and resolves one factual
discrepancy (the O2 alert floor) before any code moves.

## Research findings

1. **God component** — `Dashboard.tsx` (336 lines) fetches 4 resources,
   polls, computes status/trends/power-budget/resupply-countdown/crew
   aggregates/incident ranking, formats dates, and renders — all inline,
   violating the components/hooks/domain/api layering in
   `.claude/skills/architecture` and `.claude/skills/react`.

2. **Copy-pasted fetching** — `CrewPanel`, `TelemetryChart`, `IncidentFeed`,
   and `Dashboard` each hand-roll their own loading/error/retry state and
   have drifted:
   - `CrewPanel`: 3 retries, 1000ms delay, has unmount guard.
   - `TelemetryChart`: 3 retries, 1000ms delay, **missing unmount guard**
     (sets state after unmount — a real bug, flagged in its own comment).
   - `IncidentFeed`: 2 retries, 1500ms delay, then **silently swallows the
     error** and renders an empty list as if it were valid data — this is
     the exact anti-pattern `.claude/skills/api` forbids ("never silently
     return empty arrays unless they are valid business values"), and the
     comment notes ops has already complained about it twice.
   - `Dashboard`: no retry at all, separate polling `useEffect`.

3. **Untyped API layer** — `src/api/client.ts#getData` returns
   `Promise<any>`; `src/api/types.ts` only defines `Station` and
   `Severity`. Every component consumes data as `any`
   (`useState<any>`, `.map((m: any) => …)`), which is exactly what
   `.claude/skills/typescript` calls a forbidden pattern.

4. **Homeless logic** — `utils.ts` is a grab-bag: some functions are pure
   domain logic that never touches React (`formatTimestamp`,
   `severityColor`, `downsampleTelemetry`), one does DOM manipulation
   directly (`flashAlert` — a side effect, not a util), and three are dead
   (see #5). `Dashboard.tsx` also duplicates logic that already exists
   elsewhere: its inline `fmtDate` reimplements `formatTimestamp` with a
   different output format, and `TelemetryChart` reimplements
   `downsampleTelemetry` inline instead of importing it.

5. **Dead code** — confirmed via grep, zero call sites outside the file
   itself:
   - `src/components/OldDashboard.tsx` — not imported anywhere (`App.tsx`
     only renders `Dashboard`). Its export `renderStatusBadge` is also
     unused.
   - `utils.ts#computeStationStatus` — unused anywhere in the app.
   - `utils.ts#legacyStatusLabel` — only consumer is `OldDashboard`.
   - `utils.ts#OLD_SEVERITY_MAP` — unused anywhere in the app.
   All four go away together in one commit.

6. **Magic numbers / scattered constants** — poll interval (`5000`,
   duplicated as `POLL_INTERVAL` in `Dashboard` and `REFRESH_MS` in
   `TelemetryChart`), retry counts/delays (three different values across
   three panels), power budget baseline (`90`), hull temp/integrity
   thresholds, resupply warning windows (`7`/`14` days), sleep thresholds
   (`6`/`7`h), downsample point count (`12`, duplicated), and the status
   colors (`#3ddc84`/`#ff4d4d`/`#ffb020`/`#4da3ff`/`#8892a6`, repeated as
   inline hex literals in `Dashboard`, `utils.severityColor`, and
   `TelemetryChart`). None of these have a single owner today.

## The O2 threshold discrepancy

Three different O2 floors exist in the codebase:

| Location                          | Critical floor | Degraded floor |
|-----------------------------------|-----------------|-----------------|
| `Dashboard.tsx` (live, inline)     | 19.5            | 19.9            |
| `TelemetryChart.tsx` (live, breach)| 19.5            | —               |
| `utils.ts#computeStationStatus`    | 19.0            | 19.8            |
| `OldDashboard.tsx` (dead)          | 19.0            | 20.0            |

**Decision: 19.5% is the canonical critical floor, 19.9% the degraded
floor.** Reasoning: `computeStationStatus` (19.0) is dead code — it has
zero call sites, so it was never actually driving the UI shown to users.
The two live surfaces that render to the crew (`Dashboard`'s status pill
and `TelemetryChart`'s breach indicator) already agree on 19.5, and
`Dashboard`'s own comment cites it as "the mission control wall display"
value — i.e. the operationally trusted number. `computeStationStatus`'s
19.0/19.8 pair is deleted along with the rest of the dead code in
`utils.ts` rather than reconciled, since nothing depends on it.

This becomes a single constant in `src/config.ts` and a single pure
function in `src/domain/`, so the two live surfaces read from the same
source instead of coincidentally agreeing.

## Target structure

```
src/
  config.ts              # all thresholds, poll/retry intervals, colors, downsample size
  api/
    client.ts             # generic, typed request function (no `any`)
    types.ts               # Station, TelemetryResponse, CrewResponse, CrewMember,
                            # IncidentsResponse, Incident, Severity — complete
    validate.ts             # hand-written type guards, one per response shape
                            # (no new dependency — see "Validation approach" below)
  hooks/
    useApiResource.ts       # shared fetch + loading/error/retry/cancellation hook
  domain/
    stationStatus.ts        # status computation (NOMINAL/DEGRADED/CRITICAL), single O2 floor
    telemetry.ts             # downsampling, latest value, trend arrow
    incidents.ts              # severity ranking, unresolved/resolved counts
    crew.ts                    # on/off duty split, shift counts, avg sleep
    formatting.ts               # one canonical timestamp formatter
  components/
    Dashboard.tsx                # composition root only: renders sub-components
    DashboardHeader.tsx           # station name/orbit/status pill
    AlertBanner.tsx                # top incident banner
    MetricTile.tsx                  # single reusable tile (replaces 7 near-identical blocks)
    TilesGrid.tsx                    # arranges MetricTile instances
    CrewPanel.tsx, TelemetryChart.tsx, IncidentFeed.tsx  # use useApiResource, drop local fetch code
    # OldDashboard.tsx deleted
```

### Validation approach (explicit tradeoff)

No new dependency is added. `src/api/validate.ts` holds small
hand-written type guards (`isStation`, `isTelemetryResponse`, …) that
check required fields and types at runtime before `client.ts` returns
data. This is less exhaustive than a schema library but matches the
project's existing dependency footprint — a deliberate choice, not an
oversight.

## Commit plan (≥ 4 commits, `npm run validate` after each)

1. **Dead code removal** — delete `OldDashboard.tsx`,
   `computeStationStatus`, `legacyStatusLabel`, `OLD_SEVERITY_MAP`.
   Smallest, lowest-risk commit; shrinks the diff surface for everything
   after it.
2. **Config + domain extraction** — add `src/config.ts` and `src/domain/`
   (status, telemetry, incidents, crew, formatting) with unit tests, ported
   from the inline logic in `Dashboard.tsx`/`TelemetryChart.tsx`/`utils.ts`.
   `utils.ts` is deleted once every export has a new home. Nothing wired
   into components yet — pure functions only, verified by tests.
3. **Typed API layer + shared hook** — complete `api/types.ts`, add
   `api/validate.ts`, make `client.ts#getData` generic and validated, add
   `hooks/useApiResource.ts`. Fixes the `TelemetryChart` unmount bug and
   the `IncidentFeed` error-swallowing bug as a side effect of unifying on
   one hook.
4. **Component decomposition** — split `Dashboard.tsx` into the
   composition root + `DashboardHeader`/`AlertBanner`/`MetricTile`/
   `TilesGrid`; migrate `CrewPanel`/`TelemetryChart`/`IncidentFeed` onto
   `useApiResource` and the new domain functions; remove all `any`.
   This is the commit that gets `Dashboard.tsx` under 150 lines.

(A 5th cleanup commit is fine if lint/dupcheck still flags something after
commit 4 — e.g. leftover duplication `jscpd` catches between panels.)

## Risks

- **Behavior drift while decomposing `Dashboard.tsx`**: the tile
  thresholds/colors are read out of the same JSON fixtures every time
  (`public/api/*.json` is static), so before/after screenshots of `npm run
  dev` are a cheap regression check after commit 4.
- **`useApiResource` must not regress the working panels**: `CrewPanel`
  already handles cancellation correctly — its behavior (not
  `TelemetryChart`'s buggy one) is the reference implementation for the
  shared hook.
- **jscpd duplication threshold** (`minTokens: 45`, `minLines: 8`): the
  three panel components will still share structural similarity (loading/
  error JSX) even after commit 4; if `dupcheck` still flags them, extract
  a shared `<PanelState>` presentational wrapper rather than fighting the
  threshold.

## Verification

After each commit: `npm run validate` (lint, typecheck, coverage,
dupcheck, structural checks). After commit 4: `npm run dev`, click through
all panels, confirm status pill/alert banner/tile colors match current
behavior at the 19.5/19.9 floors, and confirm the retry/error paths
(temporarily point `getData` at a bad path, or use `?fail=1`) show a real
error state on all three panels instead of `IncidentFeed`'s old silent
empty-list behavior.
