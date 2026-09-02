# Plan 137: Signed amounts after currency

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## What

List row amounts use `formatMinor` with a signed integer so the minus sits on the number after the currency code, matching Home month net.

## Why

Rows were prefixing `−`/`+` onto `formatMinor`, producing `−IDR 189,398` while Home prints `IDR -189,398`.

## Scope

- `TransactionListRow` expense/income strings
- Home Recent shares the component
- Vitest on negative `formatMinor` if useful

## Out of this slice

- Color tokens (Brick / income)
- Transfer unsigned magnitude
