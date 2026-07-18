# Spec 082: Bottom sheet expand to fit

- **ID:** 082
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

If a **bottom sheet** would need to scroll, **expand its height** until it does not — **full screen if necessary**. Scroll only when content exceeds the full viewport.

## Scope

### In scope

1. Bottom `Sheet.Content`: grow with content; max height **`100svh`** (safe-area padding kept)
2. Flex column: header shrink-0; body scrolls only when sheet is at max height
3. Surfaces: transaction Add/Edit sheet; Activity filters/sort when `side="bottom"`
4. Near full viewport: drop top corner radius for flush full-screen feel

### Out of scope

- Desktop centered dialogs
- In-panel lists (e.g. Categories `max-h-80`)

## Acceptance scenarios

### Scenario: Add tx fits without scroll

- **Given** mobile viewport and Add transaction Normal form
- **When** content height is below 100svh
- **Then** Save and Close are reachable without scrolling the form body

### Scenario: Overflow only at full screen

- **Given** content taller than the viewport
- **When** the bottom sheet is open
- **Then** sheet height is 100svh and only then does the body scroll

## Traceability

- Implementation: `QuickAddSheet.svelte`; `AppShellChrome.svelte` bottom sheet classes
- Playwright optional smoke on mobile viewport

## Related

- 037, 044, 049
