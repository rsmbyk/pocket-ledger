---
id: ITEM-001
status: done
title: 'Adopt vexbook v0.4.0 + Git Flow'
type: chore
priority: P0
effort: M
created: 2026-09-26
updated: 2026-09-26
spec: 253-adopt-vexbook-v040
branch: chore/253-adopt-vexbook-v040
pr: 115
archived_at:
archive_reason:
bump: none
release_version:
---

# ITEM-001: Adopt vexbook v0.4.0 + Git Flow

## Summary

Adopt the vexbook process template at v0.4.0 (owner-triggered, no auto-sync) and lock Git Flow as this repo's git model. Board bootstrapped by the adopt itself.

## Notes

- Source: local `~/Projects/vexbook` at tag `v0.4.0`.
- PR template kept (pocket-ledger's richer Test plan), not overwritten by vexbook's stub.
- `VERSION`/`CHANGELOG` stay absent until the first `bump != none` slice.
- Opencode auto-review dropped per owner.

## Acceptance sketch

- Process set matches v0.4.0; product docs preserved (git-model record excepted).
- ADR 0009 records the adopt decision + Git Flow choice.
- Vendor rules defer to canonical docs; `develop` exists; CI runs on `develop` + `main`.

## Links

- Spec: [253](../specs/253-adopt-vexbook-v040/spec.md)
- Related items:
