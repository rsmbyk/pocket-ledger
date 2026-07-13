# ADR 0003: Layered client architecture

## Status

Accepted

## Context

Even without a server, UI/storage/rules must stay separable for TDD and future double-entry / encryption.

## Decision

Layers: `ui` → `application` → `domain` ← `data`.

## Consequences

- Vitest can cover domain without Playwright
- Dexie stays out of components
- Slightly more files early; cheaper evolution later
