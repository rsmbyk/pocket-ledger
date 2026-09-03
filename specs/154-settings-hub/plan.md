# Plan 154: Settings hub

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 008, 029, 061, 117, 119, 120

## What

Rename More → Settings (nav, path `/settings`, `/more` alias). Uniform cards with inner sections. Card order: Cloud Sync, Currency, Idle, Privacy, Backup, Reset. Cloud Sync keeps today’s Google / sessions / WebAuthn inside a new shell. Currency–Reset behavior is 155–159.

## Why

The hub is settings, not a leftover “More” overflow. Cards should scan as sections, not one clump.

## Out of this slice

- Currency picker, idle draft/save, privacy icons, backup import summary, reset keep-options (155–159)
- Sidebar header/footer (160)
