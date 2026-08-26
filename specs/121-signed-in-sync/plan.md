# Plan 121: Signed-in sync (rev, 409, gravestones, poll, settings)

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 118 API host, 119 session, 120 DEK

## Why

Signed-in mode must push and pull ciphertext without the server field-merging. Conflict = 409 + close editor. Deletes are gravestones. Settings ride the same bus.

## Approach

Postgres: `id`, `kind`, `rev`, `deleted`, `bytea` blob. Client PUT with last-seen `rev`. Coat-check wraps (`wrapRev`). Pull on unlock, after save, 30s poll while visible and unlocked. No offline queue.

## Scope / edges

**In:** sync protocol, 409 UX, gravestones, settings as entities, poll, wrap record CAS.

**Out:** CRDTs, LWW silent, signed-in file backup, wipe-account, GCS.
