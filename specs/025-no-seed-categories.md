# Spec 025: No automatic seed categories

- **ID:** 025
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Do not auto-insert default categories (Food, Salary, etc.) when the category table is empty. Users add categories themselves (010 / 018).

## Scope

### In scope

- Change `ensureSeedCategories`: if category count is 0, return `[]` — never insert `DEFAULT_CATEGORIES`
- First launch and post-reset (024) stay empty until the user adds categories
- Update tests that assumed seeds on a fresh DB
- Remove unused seed constant if nothing references it after the change

### Out of scope

- Reset button / wipe flow (024)
- Categories add/rename/delete UX
- Redesigning empty quick-add beyond existing validation

## Domain rules

- Empty categories is a valid permanent state
- Transactions still require a valid category **until** Spec 027; with only 025, quick-add may fail until the user creates a category (acceptable interim)

## Acceptance scenarios

### Scenario: Fresh DB has no categories

- **Given** an empty category table
- **When** `ensureSeedCategories` / overview bootstrap runs
- **Then** no seed categories are inserted

### Scenario: User-created categories still list

- **Given** the user added `Coffee`
- **When** categories are listed
- **Then** `Coffee` appears

## Traceability

- Vitest: `transactions` / categories application tests
- Playwright: light empty Categories check (or covered with 024 after both land)
- Implementation: `src/lib/application/transactions.ts` (`ensureSeedCategories`)
- Supersedes empty-DB seed behavior from 001
- Depends on: 010, 018
