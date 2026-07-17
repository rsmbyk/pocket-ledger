# Spec 062: Codebase test coverage audit

- **ID:** 062
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Ensure Pocket Ledger’s **entire** behavior surface is covered by Vitest and/or Playwright: no orphan domain/application modules, no shipped feature without acceptance coverage, and a green full test run.

## Scope

### In scope

1. **Module matrix** — every `src/lib/domain/*.ts` and `src/lib/application/*.ts` (excluding pure type-only re-exports if any) has a paired `*.test.ts` **or** an explicit deferral row with reason in tasks
2. **Feature matrix** — transactions, void, categories, activity filters, month charts, recurring, goals (060), backup/export/import, reset, lock/crypto, router, home amounts, desktop shell — each has Playwright coverage that still passes after 059–061
3. **Gap fill** — add missing unit/e2e cases discovered in the audit (including at least `application/accounts` and `application/month-summary` if still uncovered)
4. **Final gate** — `npm run check`, `npm run test:unit:run`, `npm run test:e2e` all pass

### Out of scope

- 100% statement/branch coverage as a vanity metric
- Snapshot/visual regression frameworks
- Testing generated shadcn primitives in isolation unless app behavior depends on a custom change

## Domain rules

- None (process / quality)

## Acceptance scenarios

### Scenario: No untested application/domain modules

- **Given** the inventory in tasks
- **When** the audit completes
- **Then** every module is either covered by Vitest or explicitly deferred with reason

### Scenario: Full suite green

- **Given** the branch after 059–061 and gap fills
- **When** `npm test` (unit + e2e) runs
- **Then** all tests pass

### Scenario: No stale feature asserts

- **Given** Net worth removed (059) and Goals redesigned (060)
- **When** the suite runs
- **Then** no tests require capture-net-worth or Set-saved progress UX

## Traceability

- Vitest: all `src/lib/**/*.test.ts` (existing + new gap fills)
- Playwright: all `e2e/*.e2e.ts`
- Deliverable: completed matrix checklist in `./tasks.md`

## Related

- Specs 059–061 (same pack)
- `docs/PROCESS.md` TDD / definition of done
