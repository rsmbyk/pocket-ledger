# Spec 121: Signed-in sync (rev, 409, gravestones, poll, settings)

- **ID:** 121
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Sync sealed entities to Cloud SQL while signed in. The server never sees the DEK. Conflicts close the editor. Deletes leave gravestones. Settings (theme, idle, …) sync with the ledger.

## Scope

### In scope

1. Server stores ciphertext + plain `id`, `kind`, monotonic `rev`, `deleted`
2. Save sends the `rev` this device last read; newer server `rev` → **409** → close editor, discard typing, refresh
3. Deletes = gravestones (`deleted=true`, bump `rev`); same 409 rule
4. Account wraps = one coat-check record (`wrapRev` CAS); change passphrase updates that record only
5. Catch-up: pull on unlock, pull after successful save, **30s** poll while tab visible and unlocked
6. No offline mutation queue; save fails without network
7. Settings sync as ledger data
8. `openapi.yaml` for these endpoints
9. Dexie is a cache; unsigned-out mode still has no API

### Out of scope

- Per-field merge / CRDT / last-PUT-wins
- Signed-in export/import
- Cloud lockout
- Wipe cloud / delete account
- GCS (keep `bytea`)

## Domain rules

- Operator never has the DEK.
- Other devices keep saving until they lock after a wrap change; then they need the new passphrase (119).

## Acceptance scenarios

### Scenario: Stale editor loses the draft

- **Given** two devices; A saved a newer `rev` for the same id
- **When** B PUTs with the old `rev`
- **Then** the API returns 409
- **And** B’s editor closes, the draft is discarded, and the list refreshes from the server

### Scenario: Delete is a gravestone

- **Given** an entity the user deletes while signed in
- **When** the PUT succeeds
- **Then** the row remains on the server with `deleted=true` and a new `rev`
- **And** another device’s poll removes it from Dexie

### Scenario: Offline save fails

- **Given** signed in, unlocked, no network
- **When** they try to save a transaction
- **Then** the save fails (no queue)
- **And** the local cache is not treated as the source of truth for that write

### Scenario: Settings follow the account

- **Given** theme and idle timeout set on device A while signed in
- **When** device B unlocks and pulls
- **Then** those settings apply on B

### Scenario: Poll while visible

- **Given** the tab is visible and unlocked
- **When** 30 seconds pass
- **Then** the client pulls
- **And** a hidden or locked tab does not keep polling as if unlocked-visible

## Traceability

- Vitest: `apps/api` CAS/409/gravestone; client rev handling
- Playwright: 409 closes editor (stub API)
- Implementation: Hono + Postgres, `openapi.yaml`, web poller

## Related

- 118 API container
- 119 session required
- 120 blobs already sealed
