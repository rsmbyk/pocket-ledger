# ADR 0004: GitHub Pages + PWA

## Status

Accepted

## Context

Deploy without a server; use offline after first visit; mobile installability.

## Decision

- Static `dist/` on GitHub Pages with base `/pocket-ledger/`
- vite-plugin-pwa: manifest, icons, service worker, offline fallback page
- Public repository

## Consequences

- First visit needs network; later visits work offline
- Changing Pages URL/origin can appear as an empty database
- Flutter / native shells deferred
