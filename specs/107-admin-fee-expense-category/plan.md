# Plan 107: Admin Fee as selectable expense category

- **Status:** Cancelled — Ronald cancelled; Admin Fee stays transfer-fee-only (Spec 106)
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 106 (transfer admin fee / Admin Fee bucket); Spec 027/043 (Uncategorized system option)

## Why

Spec 106 made **Admin Fee** a synthetic expense bucket for transfer fees only and explicitly barred it from the Normal expense picker. Users also need to record standalone bank/admin fees as normal expense transactions under the same system category so charts and the Activity filter stay unified.

## Scope / edges

**In:** Offer **Admin Fee** in the Normal **expense** category picker (system marker, before Uncategorized); persist `categoryId = '__admin_fee__'`; Activity Admin Fee filter matches those expenses **and** fee transfers; month chart merges both into one Admin Fee bucket; still no Categories-panel editable row; supersede 106 “picker has no Admin Fee” scenarios.

**Out:** Income Admin Fee; rename/delete/reorder Admin Fee; Dexie-seeded user-editable category row; changing transfer `feeMinor` model (106).

## Approach

- Keep synthetic sentinel `ADMIN_FEE_CATEGORY_ID` (no Dexie category row)
- `resolveCategoryId` / add+update expense accept the sentinel
- Expense picker: Admin Fee option with system marker, then Uncategorized
- Activity filter Admin Fee: `categoryId === ADMIN_FEE` **or** (`type === 'transfer' && feeMinor > 0`)
- Month summary already keys expenses by `categoryId` and transfer fees by sentinel — both merge
- Update PRODUCT; adjust 106 e2e that asserted picker exclusion

## TDD

- Vitest: category resolve / addTransaction with Admin Fee; activity-filters union; month-summary merge
- Playwright: create expense as Admin Fee; filter; chart; Categories still has no row
