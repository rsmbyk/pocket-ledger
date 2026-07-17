# Spec 006: Net worth snapshots

- **ID:** 006
- **Status:** Superseded by [059](059-remove-net-worth/spec.md)

## Intent

Capture point-in-time net worth (account balance total) and show a simple history chart.

## Scope

### In scope

- “Capture now” uses current account balance sum (single-pot = that balance)
- List snapshots newest first
- Simple sparkline/bar history on More
- One snapshot per calendar day (recapture replaces same day)

### Out of scope

- Liabilities / credit accounts
- Automatic scheduled captures (manual only for now)

## Domain rules

- `totalMinor` integer (may be negative)
- `capturedOn` is `YYYY-MM-DD`
- Unique by `capturedOn` (upsert)

## Acceptance scenarios

### Scenario: Capture reflects balance

- **Given** balance is 85_000
- **When** user captures net worth
- **Then** a snapshot for today exists with total 85_000

## Traceability

- Vitest: `src/lib/application/net-worth.test.ts`
- Playwright: `e2e/net-worth.e2e.ts`
- Implementation: `src/lib/application/net-worth.ts`

## Related

- Superseded by Draft Spec [059](059-remove-net-worth/spec.md) (feature removal; backup table retained)
