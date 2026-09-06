# Plan 222: Recent note/category stack matches Transactions

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Home Recent still leads with category, then the note. Transactions already leads with the note and treats category as supporting chrome. The two lists should share that hierarchy; Recent still needs its per-row date.

## Approach

Reuse the Transactions left-column markup (`secondary === 'category'`) inside the `date` branch of `TransactionListRow`: note-or-title primary, category/transfer muted when a note exists, then always the date line. Pass `categoryIconSlug` from Home Recent and pocket-details recent so catalog icons match Transactions.

## TDD

- Playwright: `e2e/polish.e2e.ts` — with-note Recent row is note primary, category muted, date present; empty-note has no note testid
