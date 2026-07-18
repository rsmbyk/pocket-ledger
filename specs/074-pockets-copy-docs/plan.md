# Plan 074: Accounts → Pockets copy + docs

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070 (UI surfaces exist)

## Why

Product language should say Pocket/Pockets; docs and backup notes must match storage (`accounts`) vs UI.

## Scope / edges

**In:** PRODUCT.md, DATA_MODEL.md, ARCHITECTURE.md touch-ups; user-visible Account→Pocket strings; export/import field documentation.

**Out:** Renaming Dexie table `accounts` (keep name).

## Approach

- Grep user-facing “Account” strings; replace with Pocket where appropriate
- Document `isMain`, `sortOrder`, opening fields, goal fields, transfer semantics
- Backup JSON may still key `accounts` — document synonym

## TDD

- Light: copy checks via Playwright labels where practical; docs reviewed in PR
