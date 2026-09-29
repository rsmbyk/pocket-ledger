---
id: ITEM-003
status: in_review
title: 'Align Git Flow docs and isolate Docker Compose host ports'
type: chore
priority: P1
effort: S
created: 2026-09-29
updated: 2026-09-29
spec: 255-docs-compose-port-alignment
branch: chore/255-docs-compose-port-alignment
pr: 118
archived_at:
archive_reason:
bump: none
release_version:
---

# ITEM-003: Align Git Flow docs and isolate Docker Compose host ports

## Summary

Correct stale GitHub Flow wording, move Docker Compose's host-facing ports to uncommon loopback ports, and remove the stale manually maintained next-spec value from the roadmap.

## Notes

- Compose container ports remain 5173, 8080, and 4173; only their loopback host mappings and browser-facing URLs change.
- Proposed host ports: web 45173, API 48080, preview 44173.

## Acceptance sketch

- README identifies Git Flow.
- Compose defaults and every Compose-specific instruction use the proposed ports consistently.
- ROADMAP does not require a manually updated next-spec value.

## Links

- Spec: [255](../../specs/255-docs-compose-port-alignment/spec.md)
- Related items:
