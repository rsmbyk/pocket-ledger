# Spec 057: ConfirmDialog danger chrome

- **ID:** 057
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Two confirm severity levels:
- **High** (delete / wipe persisted data): danger header + icon + destructive confirm button
- **Lower** (discard filter / unsaved edits): plain layout + **destructive confirm button** (no danger header)

Also unify all `Button variant="destructive"` chrome to match Void (outline border + soft fill).

## Scope

### In scope

1. **`dangerChrome`** — edge-to-edge danger header (`border-b`, `bg-destructive/5`) with TriangleAlert + title; `data-testid="confirm-dialog-danger-header"`
2. **`destructive`** — confirm uses `variant="destructive"` (button only; layout stays plain unless `dangerChrome`)
3. **Call sites:**
   - `destructive` + `dangerChrome`: category / recurring / goal delete, import backup, void, disable lock, reset local data (if ConfirmDialog)
   - `destructive` only: discard filter changes, discard unsaved tx edits
   - neither: category in-use warn (056)
4. **Button variant** — `destructive` matches Void: `border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20`

### Out of scope

- Custom icons per action
- Changing confirm copy
- Spec 055 z-index
- Expense type toggle selection styling

## Domain rules

- None

## Acceptance scenarios

### Scenario: Delete category shows danger chrome

- **Given** an unused category delete confirm is open
- **When** the dialog renders
- **Then** a danger header with alert icon is visible (`confirm-dialog-danger-header`)
- **And** the confirm action uses destructive styling

### Scenario: Discard filters — destructive button, no header

- **Given** the user has dirty Activity filter draft and the discard confirm opens
- **When** the dialog renders
- **Then** there is no danger header
- **And** the confirm action uses destructive styling (Void-matching danger button)

### Scenario: Discard unsaved tx — no danger header

- **Given** unsaved transaction edits and the discard confirm opens
- **When** the dialog renders
- **Then** there is no danger header
- **And** the confirm action uses destructive styling

## Traceability

- Vitest: none
- Playwright: `e2e/categories.e2e.ts`, `e2e/activity-filters.e2e.ts`
- Implementation: `ConfirmDialog.svelte`, `button.svelte`, call sites

## Related

- Spec 015, 053 (Void fill), 056
- Amendment: discard keeps destructive button (was incorrectly plain)
