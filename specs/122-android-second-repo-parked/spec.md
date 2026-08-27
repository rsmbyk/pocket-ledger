# Spec 122: Android later (second GitHub repo)

- **ID:** 122
- **Status:** Accepted (parked)
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Record that Android is **parked**: a future second GitHub repo, not this monorepo.

## Scope

### In scope

1. Document in ROADMAP / PRODUCT (via Spec 115) that Android is later
2. Repo name: `pocket-ledger-android`
3. Explicit non-goal: Android sources in `pocket-ledger`

### Out of scope

- Creating the GitHub repo now
- Play Console, signing, native UI
- Sharing Dexie or Svelte with Android

## Domain rules

- Web signed-in API (121) is the contract a future Android client would call.
- Same E2E rules: passphrase never on the server.

## Acceptance scenarios

### Scenario: This repo stays web + API

- **Given** Spec 122 is the standing decision
- **When** someone proposes `apps/android` in `pocket-ledger`
- **Then** that change is out of scope until a new spec **Accepts** bringing Android here (not expected)

### Scenario: Future repo name

- **Given** Ronald starts Android
- **When** the GitHub repo is created
- **Then** it is named `pocket-ledger-android` unless a later spec changes the name

## Traceability

- Docs only in this wave (115). No `src/` in this repo for Android.

## Related

- Spec 115 parked list
- Specs 119–121 as the future client contract
