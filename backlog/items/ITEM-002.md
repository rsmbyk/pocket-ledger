---
id: ITEM-002
status: in_review
title: 'Unlock screen: focus passphrase field + Enter to unlock'
type: fix
priority: P1
effort: S
created: 2026-09-26
updated: 2026-09-27
spec: 254-unlock-focus-submit
branch: fix/254-unlock-focus-submit
pr: 116
archived_at:
archive_reason:
bump: patch
release_version: 0.0.1
---

# ITEM-002: Unlock screen: focus passphrase field + Enter to unlock

## Summary

On load of the unlock screen the passphrase field is not focused, so Enter does nothing and the user must click the field first. Password-manager autofill that fires no `input` event also leaves the Unlock button disabled (`!passphrase` bound state), which blocks implicit Enter submission entirely.

## Notes

- Root cause and fix approach: `specs/254-unlock-focus-submit/plan.md`.
- Reuse existing `$lib/ui/focus-first-text-field` (already used by Dialog/Sheet open focus).
- `bump: patch` — first versioned slice would create `VERSION` + `CHANGELOG`; owner may override to `none` at Accept.

## Acceptance sketch

- Unlock screen renders with the passphrase input focused; typing the passphrase and pressing Enter unlocks without any click.
- Autofill without `input` events still unlocks (submit reads the DOM value).
- Empty Enter is a no-op; no double submit while checking.

## Links

- Spec: [254](../../specs/254-unlock-focus-submit/spec.md)
- Related items:
