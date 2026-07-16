# Spec 024: Reset everything (More)

- **ID:** 024
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Let the user wipe all on-device ledger data from More and return to a fresh install under **current** product defaults (including existing seed-category behavior until 025).

## Scope

### In scope

- Destructive **Reset everything** on More (Backup / danger zone): `data-testid="reset-all"`, destructive styling
- Confirm (015-style): all local data permanently deleted; suggest export first; cannot be undone
- Clear all Dexie tables used by the ledger (same set as import wipe): accounts, categories, transactions, recurring, goals, net-worth snapshots, settings
- Clear session crypto key (`clearDataKey`)
- Re-bootstrap via existing `ensureDefaultAccount` + current `getAccountsOverview` / seed path
- Theme preference in `localStorage` (`pocket-ledger-theme`) left alone
- UI refreshes like after import (`bootstrap`)

### Out of scope

- Changing whether seed categories exist (025)
- Partial reset, auto-export, import/export format changes

## Domain rules

- After reset, the app is usable without a full browser reload
- Lock settings are gone (settings table cleared)

## Acceptance scenarios

### Scenario: Reset wipes transactions

- **Given** at least one saved transaction
- **When** the user confirms Reset everything
- **Then** Recent/balance reflect an empty ledger and the app remains usable

### Scenario: Cancel leaves data

- **Given** existing data
- **When** the user cancels the confirm
- **Then** data is unchanged

## Traceability

- Vitest: application reset use case
- Playwright: More → reset flow
- Implementation: application reset helper; `MorePanel.svelte`; `App.svelte` wiring
- Depends on: 003, 008, 015
