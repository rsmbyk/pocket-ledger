# Spec 027: Uncategorized transactions

- **ID:** 027
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Allow add/edit of income/expense **without** a category. Those txs appear in lists and month breakdown under a dedicated Uncategorized bucket that is distinct from any user category named “Uncategorized”.

## Scope

### In scope

- Add/edit transaction: category optional → persist `categoryId: null`
- Quick-add: Uncategorized / empty option; default to empty when no categories exist
- Activity, Recent: label **Uncategorized** when `categoryId` is null
- Month income/expense-by-category: null bucket labeled Uncategorized, keyed by `categoryId: null` (already separate from a real category id)
- Activity category filter: after **All**, add **Uncategorized** using sentinel `__uncategorized__`; selecting it shows only null-`categoryId` txs

### Out of scope

- Recurring rules without category (still require a category)
- Seed-policy changes (025)
- Renaming the Uncategorized label

## Domain rules

- `categoryId: null` means uncategorized
- A category whose **name** is “Uncategorized” is a normal category with its own id — never merged with the null bucket
- Filter: All = no category predicate; `__uncategorized__` = `categoryId == null`; otherwise match id equality
- `addTransaction` / `updateTransaction`: blank category → null; non-blank must exist for the tx type

## Acceptance scenarios

### Scenario: Save without category

- **Given** the add sheet with Uncategorized selected (or no categories)
- **When** the user saves a valid amount
- **Then** the tx is stored with `categoryId` null and lists show Uncategorized

### Scenario: Distinct from named Uncategorized category

- **Given** a user category named `Uncategorized` and a null-category tx
- **When** month breakdown and filters run
- **Then** null txs and the named category appear as separate buckets/options

### Scenario: Filter Uncategorized

- **Given** mixed categorized and uncategorized txs
- **When** the user selects Uncategorized in the Activity filter
- **Then** only null-`categoryId` rows are listed

## Traceability

- Vitest: transactions application; activity-filters; month-summary if needed
- Playwright: add uncategorized tx; filter; month chart label
- Implementation: `transactions.ts`, `QuickAddSheet.svelte`, `activity-filters.ts`, `AppShellChrome.svelte`
- Depends on: 001, 002, 017; pairs well after 025
