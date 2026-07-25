# Plan 103: Pocket amount fields match Amount

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 037/039 (Amount chrome); Spec 071 (opening — negatives superseded); Spec 072/086 (goals / optional checkboxes)

## Why

Opening balance and Goal target use plain numeric inputs. Transaction Amount uses InputGroup + currency prefix, digits-only entry, and as-you-type thousand grouping. Pocket money fields should match that chrome exactly. Negatives for opening are dropped.

## Scope / edges

**In:** Pocket form Opening balance + Goal target fields; non-negative opening domain/application rule; legacy negative clamp on edit form load; Vitest + Playwright.

**Out:** Activity filter amount; checkbox model (086); locale-aware grouping; shared Svelte MoneyAmountField component (inline InputGroup like QuickAddSheet).

## Approach

- Reuse `amountDigitsOnly`, `formatAmountDigitsDisplay`, `isBlockedAmountKey`
- Add `parseNonNegativeAmountInput` (blank/`0` OK; reject non-digits and negatives)
- Reject `openingBalanceMinor < 0` in create/update pocket
- Wire both fields in `PocketsPanel.svelte` to Amount’s InputGroup pattern

## TDD

- Vitest: `transaction-rules` parse helper; `accounts` reject negative opening
- Playwright: currency prefix; typed `15000` → `15,000`; opening `0` still saves
