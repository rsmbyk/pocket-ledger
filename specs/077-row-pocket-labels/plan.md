# Plan 077: Pocket under amount; transfer row chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 070, 073 (transfers), 076 (row chrome)

## Why

Rows should show which pot a tx belongs to; transfers need a distinct right-column treatment.

## Scope / edges

**In:** Pocket name below amount on Activity + Home Recent; Main icon; transfers neutral amount + source → dest under amount.

**Out:** Changing left category column for transfers beyond what’s needed for distinct chrome.

## Approach

- Extend `TransactionListRow` right stack: amount then pocket line (`text-xs` muted)
- Income/expense: pocket name (+ Main icon if `isMain`)
- Transfer: amount neutral (not green/red); under amount `Source → Dest` (names + Main icons as needed)
- Left column for transfers: avoid income/expense coloring; category may be absent — use Transfer label or muted primary text per UI pass

## TDD

- Playwright for placement; Vitest optional for label formatting helper
