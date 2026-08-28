# ADR 0002: Dexie / IndexedDB

## Status

Accepted

## Context

Offline personal ledger needs durable on-device storage. Signed-out mode has no backend; signed-in mode uses Dexie as a cache in front of ciphertext on Cloud SQL.

## Decision

Use IndexedDB via Dexie with versioned schema. Money as integer minor units. Signed-in sync (Spec 121) does not replace Dexie as the local working set.

## Consequences

- Data is origin-scoped (Pages URL matters)
- Clearing site data wipes the ledger — export becomes critical later
- Optional encryption can wrap the data layer later without changing use cases
- SQLite-WASM remains a future option if SQL reporting demands it
