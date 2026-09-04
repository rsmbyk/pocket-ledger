# Spec 172: Amount field caret stays put

- **ID:** 172
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Typing or deleting in the middle (or at the start) of a grouped amount field leaves the caret at that digit position after commas update.

## Scope

### In scope

1. Domain helper (name may vary) in `apps/web/src/lib/domain/transaction-rules.ts`: given the formatted string and how many **digits** were left of the caret on `input`, return the new `selectionStart`. Grouping commas do not count.
2. After `amountDigitsOnly` + format, restore caret (`tick` then `setSelectionRange`). Apply on: goal Target, pocket opening, tx Amount, transfer amount, transfer fee, expense fee.
3. Grouping and digits-only rules stay 105 / 037. Paste that replaces the whole field may still land at the end.

### Out of scope

- Locale separators
- A shared Amount Input component (105 deferred that)
- Filter amount

## Domain / UI rules

- Count **digits** before the caret on the live `input` value (pre-rewrite), then map that count onto `formatAmountDigitsDisplay` of the new digits.
- Empty field → caret `0`.
- Commas inserted or removed to the left of the caret shift the index; digit identity under the caret stays.

## Acceptance scenarios

### Scenario: Delete first digit

- **Given** Target shows `15,000` and the caret is after `1`
- **When** the user Backspaces
- **Then** the field is `5,000` and the caret stays at the start (not the end)

### Scenario: Type in the middle

- **Given** Target shows `15,000` and the caret is between `5` and the comma
- **When** the user types `9`
- **Then** the field is `159,000` and the caret is after `9`

### Scenario: Same chrome elsewhere

- **Given** the same grouping on opening / tx Amount / transfer amount / transfer fee / expense fee
- **When** they edit mid-value
- **Then** caret behaves the same

## Traceability

- Vitest: `apps/web/src/lib/domain/transaction-rules.test.ts` — caret index for delete-first-digit and mid-insert
- Playwright: `e2e/goals.e2e.ts` — Backspace / mid-type on `pocket-goal-target-input`; `selectionStart`
- Implementation: helper in `transaction-rules.ts`; `oninput` on the six fields

## Related

- 105 Pocket amount field format
- 037 / 039 transaction Amount chrome
