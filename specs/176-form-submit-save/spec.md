# Spec 176: Form submit is Save

- **ID:** 176
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Every create/edit dialog or sheet **primary submit** that persists the entity reads **Save**. Openers that *start* a create still use Add.

## Scope

### In scope

1. Pocket create: `pocket-save` visible text **Create** → **Save** (edit already Save). Title stays **Add pocket** / **Edit pocket**.
2. Add category: `category-add` **Add** → **Save** (supersedes 038 submit copy).
3. Add group: `category-group-add` **Add** → **Save**.
4. Tx sheet (`tx-save`) and goal dialog (`pocket-goal-save`) already **Save** — no copy change; listed so the rule is one.

### Out of scope

- Toolbar/openers: **Add Transaction**, **Add Pocket**, **Add Goal**, **Add group**, in-group Plus (`category-add-in-group`)
- Filters **Apply**
- Reorder **Save** / 175 Default + Cancel
- Dialog titles
- Busy **Saving…** on the transaction sheet

## Domain / UI rules

- Testids unchanged; Playwright that clicks testids keeps working.
- Assertions on visible name **Create** / exact **Add** on those submits must follow this spec.

## Acceptance scenarios

### Scenario: Add pocket

- **Given** Add pocket
- **When** the footer renders
- **Then** the primary is Save (not Create)

### Scenario: Add category or group

- **Given** Add category or Add group
- **When** the footer renders
- **Then** the primary is Save (not Add)

### Scenario: Openers unchanged

- **Given** Transactions / Home / Pockets / Categories
- **When** the page chrome renders
- **Then** Add Transaction, Add Pocket, Add Goal, and Add group still use Add
- **And** in-group Plus is still Add (aria / accessible name)

## Traceability

- Vitest: none
- Playwright: `e2e/pockets.e2e.ts` — `pocket-save` has name Save on create
- Playwright: `e2e/categories.e2e.ts` — `category-add` and `category-group-add` have name Save; in-group Add unchanged
- Implementation: `PocketsPanel.svelte`, `CategoriesPanel.svelte`

## Related

- 038 category submit was **Add**
- 084 Activity **Add Transaction** opener (unchanged)
