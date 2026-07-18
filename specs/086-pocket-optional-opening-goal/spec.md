# Spec 086: Optional opening + goal via checkboxes

- **ID:** 086
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Opening balance / As of and Goal are **optional**, each gated by a checkbox. Persist enable flags so default values differ from user-set. Goal date uses a **suffix checkbox** for whether the goal has a date.

## Scope

### In scope

1. Dexie schema bump: `openingEnabled: boolean`, `goalEnabled: boolean` on pocket/account
2. Checkbox **Set opening balance** (wording OK if equivalent) above Opening / As of
3. When opening disabled: fields disabled; show `0` and as-of = pocket **creation date**; inline helper that values will be set to those defaults; on save persist `openingBalanceMinor = 0`, `openingAsOf = creation date`, `openingEnabled = false`
4. When opening enabled: fields editable; persist user values + `openingEnabled = true`
5. Reopen modal: if disabled, show defaults with checkbox off (still disabled)
6. Goal (edit): checkbox **Set goal**; disabled → `goalTargetMinor`/`goalTargetOn` null + helpers; enabled → target required
7. Goal date: suffix checkbox when goal enabled — off → date disabled, `goalTargetOn = null`; on → date editable
8. Migration: `openingEnabled = true` if opening ≠ 0 or as-of ≠ creation-date; else false. `goalEnabled = goalTargetMinor != null`

### Out of scope

- Changing `derivePocketBalance` rules (071)
- Multiple goals / openings

## Domain rules

- Creation date = date part of `createdAt` (YYYY-MM-DD)
- Disabled opening always stores `0` + creation as-of regardless of UI draft while toggling off
- `goalTargetOn` null means no date (suffix unchecked)

## Acceptance scenarios

### Scenario: Create without opening

- **Given** Add pocket with opening checkbox off
- **When** the user saves
- **Then** `openingEnabled` is false, balance opening is `0`, as-of is creation date
- **And** helper text was visible while disabled

### Scenario: Enable opening

- **Given** edit pocket with opening off
- **When** the user checks opening, sets `50_000` as of a date, saves
- **Then** `openingEnabled` is true and those values persist

### Scenario: Goal date suffix

- **Given** goal enabled
- **When** the date suffix checkbox is off
- **Then** goal date control is disabled and `goalTargetOn` stays null on save
- **When** the checkbox is on and a date is picked
- **Then** that date persists

## Traceability

- Vitest: normalize/migrate flags; disabled save defaults
- Playwright: checkbox helpers; create/edit opening + goal date suffix
- Implementation: `account.ts`, Dexie, `accounts` app, `PocketsPanel.svelte`

## Related

- 071, 072
