# Plan 048: Home amount hide + by-category icons

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Supersedes:** Spec 045 items 2–3 (month tile icons; session-only amount hide) — see cross-link on 045

## Why

045 put icons on Income/Expenses **sum tiles** and kept amount-hide session-only. Intent was icons on **“… by category”** headings, and hide should neutralize signs/colors and survive reloads.

## Scope / edges

**In:** move icons to by-category titles; revert sum tiles to plain text; hide amounts → no digits, no `+`/`−`, no sign colors; persist via `localStorage` key `pocket-ledger-hide-amounts`.

**Out:** persisting Activity filters; changing chart bar widths encoding (optional mute bars only if needed for “no amount leak”).

## Approach

- Shared helper mirroring theme storage (`get`/`set`/`parse`).
- MonthSummary: icons on CategoryBreakdownChart titles; tiles without icons.
- When hidden: muted foreground for amounts; strip Recent signs; tiles/charts show `••••` without color coding by sign.

## TDD

- Vitest: `src/lib/shared/hide-amounts.test.ts`
- Playwright: `e2e/home-amounts.e2e.ts`

## Out of scope

Filter persistence; encryption of preference.
