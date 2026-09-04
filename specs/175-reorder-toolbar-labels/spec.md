# Spec 175: Reorder toolbar Default + Cancel

- **ID:** 175
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Reorder-mode toolbar labels: **Default** (was Reset) and **Cancel** (was Discard). Default is disabled when both kinds already match factory stock-then-customs order. 146 Reset/Discard **behavior** is unchanged.

## Scope

### In scope

1. Reset control visible label **Default** (keep `data-testid="category-reorder-reset"`).
2. Disabled when the current reorder draft already equals `resetBothKindsInOrder` (both kinds, factory stock then customs by `createdAt`), or `busy`. Enabled when either kind differs — including a **saved** custom order on enter (not “equal to the enter snapshot”).
3. Helper e.g. `isFactoryKindGroupOrder(draft, groups)` in `apps/web/src/lib/domain/category-reorder-session.ts`.
4. Discard control visible label **Cancel** (keep `data-testid="category-reorder-discard"`). Dirty still opens `category-reorder-discard-confirm` with existing title/body/confirm **Discard**. Clean still exits with no dialog.

### Out of scope

- Save label
- Confirm copy
- Reset of one kind only
- Add-category / add-group discard dialogs
- 173 / 174

## Domain / UI rules

- Default order = Spec 146 Reset result: `resetBothKindsInOrder`.
- Click Default (when enabled) still applies that helper, stays in reorder, dirty vs enter snapshot until Save.
- After Default, the control disables if the draft is now factory order.

## Acceptance scenarios

### Scenario: Already factory

- **Given** reorder and both kinds already factory stock then customs
- **When** the toolbar renders
- **Then** the left control reads Default and is disabled
- **And** the middle control reads Cancel

### Scenario: Custom order enables Default

- **Given** Expenses (or Income) order differs from factory
- **When** the toolbar renders
- **Then** Default is enabled
- **When** the user clicks Default
- **Then** both kinds are factory order, Default disables, and Save is dirty if that differs from the enter snapshot

### Scenario: Dirty Cancel still confirms

- **Given** a dirty reorder
- **When** the user chooses Cancel
- **Then** the existing Discard-group-order confirm still appears (146)

### Scenario: Clean Cancel still exits

- **Given** reorder with no changes
- **When** the user chooses Cancel
- **Then** they exit reorder with no confirm

## Traceability

- Vitest: `apps/web/src/lib/domain/category-reorder-session.test.ts` — `isFactoryKindGroupOrder` true/false
- Playwright: `e2e/categories.e2e.ts` — Default/Cancel visible text; Default disabled at factory; dirty Cancel still `category-reorder-discard-confirm`
- Implementation: `category-reorder-session.ts`, `CategoriesPanel.svelte`

## Related

- 123 Reset factory rule
- 146 Reset both kinds + Discard confirm
