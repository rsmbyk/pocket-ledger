# Spec 105: Pocket amount fields match Amount

- **ID:** 105
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Opening balance and Goal target on the pocket form use the same amount-entry chrome as the transaction Amount field: currency prefix, digits-only input, and as-you-type thousand grouping. Opening balances are non-negative only (Spec 071 negatives allowed is superseded for new writes).

## Scope

### In scope

1. Opening balance and Goal target use InputGroup + account `currencyLabel` prefix (same pattern as Amount)
2. Digits-only entry with blocked non-digit keys; display via thousand grouping (`,`)
3. Placeholder style matches Amount (`15,000`)
4. Opening parse allows blank → `0` and explicit `0`; rejects negatives and non-whole input
5. Application create/update rejects `openingBalanceMinor < 0`
6. Legacy negative opening: edit form loads editable value clamped to `0` (do not strip `-` into a positive absolute)

### Out of scope

- Activity filter amount field
- Changing optional opening/goal checkbox behavior (086)
- Locale-aware thousand separators
- Extracting a shared Svelte amount field component

## Domain rules

- Goal target continues to use `parseAmountInput` (positive integer `> 0`) when goal is enabled
- Opening uses `parseNonNegativeAmountInput`: strip grouping/whitespace; blank → `0`; must be digits only; value must be an integer `>= 0`
- Stored `openingBalanceMinor` must be an integer `>= 0` when opening is enabled
- Spec 071 “negative opening allowed” is **superseded** by this spec for create/update

## Acceptance scenarios

### Scenario: Opening matches Amount chrome

- **Given** Add/Edit pocket with opening enabled
- **When** the Opening balance field renders
- **Then** the currency label appears as a prefix addon (not in the label text)
- **And** typing `15000` shows `15,000`
- **And** letters/symbols do not appear as editable characters

### Scenario: Goal target matches Amount chrome

- **Given** Edit pocket with goal enabled
- **When** the Goal target field renders
- **Then** it uses the same currency prefix + digit masking + thousand grouping as Amount

### Scenario: Opening zero still saves

- **Given** opening enabled and the field is blank or `0`
- **When** the user saves a valid pocket
- **Then** `openingBalanceMinor` is `0`

### Scenario: Negative opening rejected

- **Given** create or update with `openingEnabled` and `openingBalanceMinor < 0`
- **When** the application persists the pocket
- **Then** it rejects with an opening-balance error

### Scenario: Legacy negative clamps on edit

- **Given** a pocket whose stored opening is negative (pre-105 data)
- **When** the user opens Edit
- **Then** the Opening balance field shows `0` (clamped), not the absolute value of the negative

## Traceability

- Vitest: `src/lib/domain/transaction-rules.test.ts` (`parseNonNegativeAmountInput`); `src/lib/application/accounts.test.ts` (reject negative opening)
- Playwright: `e2e/pockets.e2e.ts` — prefix + grouped display + opening zero
- Implementation: `transaction-rules.ts`; `accounts.ts`; `PocketsPanel.svelte`

## Related

- Spec 037, 039 (Amount chrome)
- Spec 172 (caret stays on the same digit after grouping)
- Spec 071 (opening — negatives superseded for writes)
- Spec 072, 086 (goals / optional checkboxes)
