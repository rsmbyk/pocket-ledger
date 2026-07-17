# Spec 056: Category in-use warn dialog

- **ID:** 056
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Before offering a destructive delete confirm, check whether the category is still used. If it is, show a warning dialog explaining it cannot be deleted. Remove the Categories panel inline error banner for this path.

## Scope

### In scope

1. On Delete click: check usage (transactions **or** recurring rules with that `categoryId` — same rule as `removeCategory`)
2. **In use:** open a non-destructive warning dialog (title/body clear that delete is blocked); single dismiss (**OK** / **Got it**); category remains
3. **Not in use:** open the existing destructive delete confirm; confirm deletes
4. Remove Categories panel `{#if error}` `role="alert"` banner UI

### Out of scope

- Disabling the Delete button when in use
- Reassign / merge category UX
- More panel error alerts
- Soft-delete or orphaning transactions

## Domain rules

- A category is in use when at least one transaction **or** recurring rule references its id (unchanged from existing `removeCategory` guard)
- `removeCategory` continues to refuse in-use deletes (defense in depth)

## Acceptance scenarios

### Scenario: In-use category warns

- **Given** a category that is used by at least one transaction (or recurring rule)
- **When** the user clicks Delete
- **Then** a warning dialog explains the category cannot be deleted
- **And** there is no destructive Delete confirm for that click
- **And** dismissing the warn leaves the category in the list
- **And** no inline `role="alert"` banner appears for this case

### Scenario: Unused category delete confirm

- **Given** a category with no transactions and no recurring rules
- **When** the user clicks Delete
- **Then** the destructive delete confirm opens
- **And** confirming removes the category

### Scenario: Application still guards

- **Given** an in-use category id
- **When** `removeCategory` is called
- **Then** it still rejects with the existing “still used” error

## Traceability

- Vitest: `src/lib/application/categories.test.ts`
- Playwright: `e2e/categories.e2e.ts`
- Implementation: `src/lib/application/categories.ts`, `src/lib/ui/CategoriesPanel.svelte`

## Related

- Spec 010 / 015 (category delete + confirms)
- Spec 057 (danger chrome on the unused-path delete confirm)
