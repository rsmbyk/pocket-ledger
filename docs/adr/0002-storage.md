# ADR 0002: Dexie / IndexedDB

## Status

Accepted

## Context

Offline personal ledger needs durable on-device storage without a backend.

## Decision

Use IndexedDB via Dexie with versioned schema. Money as integer minor units.

## Consequences

- Data is origin-scoped (Pages URL matters)
- Clearing site data wipes the ledger — export becomes critical later
- Optional encryption can wrap the data layer later without changing use cases
- SQLite-WASM remains a future option if SQL reporting demands it
