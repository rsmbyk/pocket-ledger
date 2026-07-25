# Plan 106: Transfer admin fee

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 073 (transfers); Spec 071 (pocket balance); Spec 027/043 (Uncategorized system bucket + order); Spec 002 (month charts); Spec 104 (create-form drafts)

## Why

Bank-style pocket transfers sometimes skim an admin fee so the destination receives less than left the source. Today transfers are 1:1 (`amountMinor` only). Users need an optional fee on the same transfer row so pocket balances and month expenses reflect money that left the ledger.

## Scope / edges

**In:** Optional `feeMinor` on transfer rows; form = amount sent + optional Fee; source `−(amount + fee)`, dest `+amount`; fee counts as expense under synthetic **Admin Fee** (before Uncategorized); Activity filter; list-row fee chrome when `feeMinor > 0`; backup/restore normalize missing fee → `0`; create-draft includes fee; PRODUCT + DATA_MODEL.

**Out:** Separate linked expense transaction; renaming/deleting Admin Fee; Admin Fee as a selectable category on normal income/expense; percentage fees; FX; multi-destination splits (078).

## Approach

- Add `feeMinor` to `LedgerTransaction` (required on type; read/backup missing → `0`)
- Transfers keep `categoryId: null`; attribution via `feeMinor` + sentinel `__admin_fee__`
- Update `pocketDelta`, `buildTransferFields`, `buildMonthSummary` (expense + opening for prior fees)
- QuickAddSheet Fee field (Amount chrome); row shows fee when > 0; chart + filter order Admin Fee before Uncategorized

## TDD

- Vitest: `transfer-rules`, `pocket-balance`, `month-summary`, transactions app, backup normalize, activity-filters, create-form-drafts
- Playwright: create with fee; blank fee; edit fee; void; Admin Fee filter; chart order
