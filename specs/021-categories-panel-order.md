# Spec 021: Categories panel — Income first + right-aligned actions

- **ID:** 021
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Make Categories easier to scan: show **Income** before **Expense**, and keep Rename/Delete on the right of each row so the name field can breathe.

## Scope

### In scope

- On Categories, list groups in this order: **Income**, then **Expense** (desktop two-column grid and mobile stack)
- Each category row: name input grows; **Rename** and **Delete** stay flush on the **right**
- Existing add modal (018), rename/delete rules (010), and destructive confirms (015) unchanged

### Out of scope

- Reordering individual category rows (drag/sort)
- Changing add / rename / delete behavior
- Home or Activity category ordering

## Domain rules

- None (presentation only)

## Acceptance scenarios

### Scenario: Income before Expense

- **Given** the user opens Categories
- **When** both Income and Expense cards are shown
- **Then** the Income card appears before the Expense card (first in reading order / DOM order)

### Scenario: Actions on the right

- **Given** a category row with a name field and Rename/Delete
- **When** the row is laid out at a normal phone or desktop width
- **Then** Rename and Delete sit on the right of the row; the name field uses the remaining width

## Traceability

- Vitest: n/a (no domain change)
- Playwright: `e2e/categories.e2e.ts` (Income list precedes Expense in document order)
- Implementation: `src/lib/ui/CategoriesPanel.svelte`
- Depends on: 010, 018
