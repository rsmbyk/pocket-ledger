# Spec 137: Signed amounts after currency

- **ID:** 137
- **Status:** Draft
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Signed money on list rows matches Home: `{currency} {signedNumber}` via `formatMinor`. The sign is not glued in front of the currency code.

## Scope

### In scope

1. **Expense:** `formatMinor(-amountMinor, currencyLabel)` — e.g. `IDR -189,398` (locale number sign).
2. **Income:** `formatMinor(amountMinor)` — no leading `+`.
3. **Transfer:** unsigned magnitude as today (`formatMinor(amountMinor)`).
4. Color stays type-based (Brick expense, income, transfer foreground).
5. Shared `TransactionListRow` — Home Recent uses the same string.

### Out of scope

- Changing `formatMinor` label order (still `{currency} {number}`)
- Pocket balances / month KPIs (already `formatMinor`)
- Hide-amount bullets

## Domain rules

- Drop the Unicode `−` / `+` prefix in `TransactionListRow`.
- Negative minor units are valid input to `formatMinor` (Intl formats the number).

## Acceptance scenarios

### Scenario: Expense sign after IDR

- **Given** an expense of 189398 minor units, label `IDR`
- **When** the Transactions (or Recent) row amount renders
- **Then** the text matches `formatMinor(-189398, 'IDR')` (sign after `IDR`, not `−IDR`)

### Scenario: Income has no plus

- **Given** an income of 50000 minor units
- **When** the row amount renders
- **Then** the text is `formatMinor(50000, 'IDR')` with no leading `+`

### Scenario: Transfer unsigned

- **Given** a transfer of 2000000 minor units
- **When** the row amount renders
- **Then** the text is `formatMinor(2000000, 'IDR')` (no sign prefix)

## Traceability

- Vitest: `apps/web/src/lib/domain/money.test.ts` — negative amount still prefixes currency then signed number
- Playwright: list/Recent amount text does not start with `−IDR` / `+IDR`
- Implementation: `apps/web/src/lib/ui/TransactionListRow.svelte`

## Related

- 063 trailing signed amount; Home month summary
