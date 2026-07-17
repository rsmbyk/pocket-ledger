# Spec 058: Always-on Activity filters drawer

- **ID:** 058
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When the viewport is wide enough (≥1280), show Activity filters as a persistent right rail without opening a sheet. Reduce drawer chrome, and let the Activity stage use full main width so list + filters don’t look cramped in the center.

## Scope

### In scope

1. **Always on (≥1280, Activity route)** — `activity-filters-drawer` is visible without clicking Filters
2. **Hide toolbar Filters button** on ≥1280 (`activity-filters-open` absent)
3. **Drawer chrome** — remove **Filters** title; remove **Close**; keep **Clear** and **Apply**
4. **Stage layout** — with always-on drawer, Activity stage is full main inset width (not centered `max-w-5xl` island); keep even shell side padding
5. **Panel layout** — filter fields + footer stack at the **top** (no flex stretch / justified empty gaps)
6. **&lt;1280** — unchanged: Filters button, sheet (bottom/right), title, Close, dirty discard warn

### Out of scope

- Changing filter criteria or Apply/Clear semantics
- Live filtering without Apply
- Changing xl breakpoint (stays 1280)

## Domain rules

- Draft vs applied model unchanged from Spec 045/049
- On always-on drawer, sync draft from applied when entering Activity or when crossing into xl

## Acceptance scenarios

### Scenario: Drawer visible without open

- **Given** Activity at viewport width ≥ 1280
- **When** the panel renders
- **Then** `activity-filters-drawer` is visible
- **And** `activity-filters-open` is not shown

### Scenario: Persistent chrome

- **Given** the always-on drawer
- **When** it renders
- **Then** there is no Filters title text in the drawer header
- **And** there is no Close control
- **And** Clear and Apply remain available

### Scenario: Stage uses width

- **Given** Activity with always-on drawer
- **When** the stage renders
- **Then** list + filters span the main content area (not a narrow centered column with large empty side margins)

### Scenario: Narrow viewport unchanged

- **Given** Activity at viewport width &lt; 1280
- **When** the user opens Filters
- **Then** the sheet still opens with Close and dirty-discard behavior as today

## Traceability

- Vitest: none
- Playwright: `e2e/activity-filters.e2e.ts`
- Implementation: `src/lib/ui/AppShellChrome.svelte`

## Related

- Spec 049 (drawer introduced; 058 makes it always-on on xl)
- Spec 045 (draft/Apply model)
