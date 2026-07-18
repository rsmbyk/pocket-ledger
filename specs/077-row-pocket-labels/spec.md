# Spec 077: Pocket under amount; transfer row chrome

- **ID:** 077
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Show the pocket on Activity and Home Recent **below the amount**. Transfers use distinct chrome: leading type icon, neutral amount, and **source → destination** under the amount.

## Scope

### In scope

1. **Placement:** pocket line in the **right column**, under the signed amount, muted `text-xs`
2. Income/expense: that row’s pocket name; include **Main `Landmark` icon** when `isMain`
3. Transfers: left primary shows Lucide **`ArrowLeftRight`** (muted) beside **Transfer**; amount uses **neutral** coloring (not income green / expense red); under amount show **`Source → Dest`** (pocket names; Main icon on either side if applicable)
4. Transfer rows are visually distinct from normal income/expense (no green/red amount; left side not pretending to be a categorized expense)
5. Applies to **Activity** and **Home Recent** shared row component

### Out of scope

- Pocket filter (075)
- Changing secondary note/date rules (076)

## Domain rules

- Resolve names via pocket id map; missing pocket → safe fallback (e.g. “Unknown”)
- Transfer source = `accountId`, dest = `counterAccountId`

## Acceptance scenarios

### Scenario: Expense shows pocket under amount

- **Given** an expense on renamed Main (`Household`)
- **When** Recent or Activity renders the row
- **Then** under the amount appears `Household` with the Main icon

### Scenario: Transfer source arrow dest

- **Given** transfer Main → Vacation
- **When** the row renders
- **Then** amount is neutral-colored
- **And** under it appears Main (with icon) → Vacation

### Scenario: Transfer type icon

- **Given** a transfer row on Recent or Activity
- **When** it renders
- **Then** the primary label shows an `ArrowLeftRight` icon beside “Transfer”

### Scenario: Non-Main pocket no Main icon

- **Given** an expense on Vacation
- **When** the row renders
- **Then** under amount shows `Vacation` without the Main icon

## Traceability

- Vitest: optional `formatPocketUnderAmount` / transfer label helper
- Playwright: Recent + Activity pocket under amount; transfer arrow line; Main icon; transfer type icon
- Implementation: `TransactionListRow.svelte`; callers pass pocket map

## Related

- 070, 073, 076
