# Plan 078: Pocket picker on Normal transactions

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070 (order + Main icon), 075 (optional default from Activity filter)
- **Related:** 073 (Transfer already has source/dest; this is Normal only)

## Why

Income/expense always lands on the shell default pocket (Main) with no way to choose another pot on Add/Edit. Transfers already pick pockets; Normal should too.

## Scope / edges

**In:** Pocket field on Normal create/edit; full ordered list + Main icon; default from Activity pocket filter when set, else Main; edit can move a tx to another pocket.

**Out:** Changing Transfer source/dest (073); multi-pocket split; hiding the field when only one pocket (still show for consistency).

## Approach

- Local `selectedAccountId` in `QuickAddSheet` for Normal mode (create + income/expense edit)
- Reuse existing `pocketPicker` snippet / same dropdown chrome as Transfer
- Seed: Activity applied `pocketId` if not `all`, else Main / shell default
- Wire `addTransaction` / `updateTransaction` with selected id (app layer already accepts `accountId`)

## TDD

- Playwright: create expense on non-Main; edit moves pocket
- Vitest only if new default-resolution helper is extracted; otherwise UI + existing update path
