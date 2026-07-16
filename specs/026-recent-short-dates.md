# Spec 026: Recent card — short date display

- **ID:** 026
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Show friendlier dates on Home Recent instead of raw `YYYY-MM-DD`.

## Scope

### In scope

- Home Recent secondary-line dates only
- Domain helper `formatOccurredOnDisplay(occurredOn, todayYmd?)`:
  - Same calendar year as today: `Mon DD` (e.g. `Jul 06`, `Jul 16`) — English 3-letter month + zero-padded day
  - Other year: `Mon DD, YYYY` (e.g. `Dec 25, 2025`)
- Wire Recent to use the helper for the date portion

### Out of scope

- Empty-note filler behavior (023)
- Activity table / filters / month chrome dates
- Relative labels (“Today”, “Yesterday”)

## Domain rules

- Input remains ISO `YYYY-MM-DD` in storage
- Month abbrevs fixed: Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec (not locale-dependent in tests)

## Acceptance scenarios

### Scenario: Same year omits year

- **Given** today is in 2026 and `occurredOn` is `2026-07-06`
- **When** the display helper runs
- **Then** the result is `Jul 06`

### Scenario: Other year includes year

- **Given** today is in 2026 and `occurredOn` is `2025-12-25`
- **When** the display helper runs
- **Then** the result is `Dec 25, 2025`

## Traceability

- Vitest: `src/lib/domain/occurred-on-display.test.ts` (or equivalent)
- Playwright: Recent shows abbrev month pattern
- Implementation: domain helper; Recent in `AppShellChrome.svelte`
- Depends on: 013; pairs with 023 for secondary-line composition
