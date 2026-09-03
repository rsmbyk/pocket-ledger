# Plan 155: Settings currency

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 154

## What

App-wide display currency on Settings: searchable ISO dropdown (`CODE` + name; spec 161), Save / Cancel / Default (IDR). Persist a settings key and write every pocket’s `currencyLabel` on Save.

## Why

Currency is a display label (PRODUCT). It should be chosen in Settings, not inferred only from Main.

## Out of this slice

- FX / multi-currency amounts; per-pocket currencies
