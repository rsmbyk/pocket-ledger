# Spec 243: Plans filters dirty leave keep-open

- **ID:** 243
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The Plans filter **sheet** follows Spec **080** prevent-then-warn. Dirty dismiss never closes the host first. Keep editing leaves the sheet open; Discard closes it cleanly with no hung `plansFiltersOpen`.

## Scope

### In scope

1. Narrow `/plans` filter sheet (`plans-filters-sheet`, viewport &lt; 1280).
2. Prevent-then-warn: `preventDefault` on interact-outside and Escape while the draft is dirty or while discard is open; ignore native date pickers and portaled Type/Pocket/Category menus.
3. Refuse applying `open = false` while dirty; open **Discard filter changes?** on top.
4. Keep editing: sheet stays open with the unsaved draft; Filters is not stuck.
5. Discard: sheet closes; Filters can open again immediately.
6. Clean overlay / Escape still close.

### Out of scope

- Xl persistent card (`plans-filters-drawer`)
- Discard copy or ConfirmDialog chrome (057)
- Activity filters, tx/plan form sheets
- Adding Category (244)

## Domain rules

- None (UI open-state only).
- Controlled `plansFiltersOpen` must not stay `true` while the sheet is visually gone after Keep editing, and must not stay `true` after Discard.

## Acceptance scenarios

### Scenario: Dirty overlay prevents close then warns

- **Given** a dirty Plans filter draft on the sheet
- **When** the user presses the overlay
- **Then** `plans-filters-sheet` stays visible
- **And** Discard filter changes? appears on top

### Scenario: Dirty Escape prevents close then warns

- **Given** a dirty Plans filter draft on the sheet
- **When** the user presses Escape
- **Then** discard appears
- **And** the sheet stays visible

### Scenario: Keep editing keeps the sheet

- **Given** discard is open over a dirty Plans filter sheet
- **When** the user chooses Keep editing
- **Then** discard closes
- **And** the sheet stays open with the unsaved draft
- **And** Filters can still be used (no hung open)

### Scenario: Discard closes cleanly

- **Given** discard is open over a dirty Plans filter sheet
- **When** the user confirms Discard
- **Then** the sheet closes
- **And** Filters can be opened again immediately

### Scenario: Clean overlay and Escape still close

- **Given** a clean Plans filter sheet
- **When** the user presses the overlay or Escape
- **Then** the sheet closes with no discard

## Traceability

- Playwright: `e2e/plans.e2e.ts` (mobile viewport)
- Implementation: `AppShellChrome.svelte` `onPlanFiltersDismissAttempt` on `plans-filters-sheet`
- Hardens: 080, 085 for this surface

## Related

- 044, 080, 085, 223
