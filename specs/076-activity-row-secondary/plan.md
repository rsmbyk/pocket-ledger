# Plan 076: Activity row date/note + empty-secondary chrome

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** 068 (partially superseded for spacer / Default date)

## Why

Default sort should show dates on rows again; date-sorted rows should not keep an empty spacer; empty secondary should tighten and center category.

## Scope / edges

**In:** Activity secondary rules by sort; no empty spacer; vertical center when no secondary line.

**Out:** Changing Home Recent (stays note+date); pocket-under-amount (077).

## Approach

- `TransactionListRow` / ActivityTable props: secondary mode `note-date` | `note` | `none`
- Default sort → show date (note then date, or date alone) like Recent
- Date sorts → note only; if no note, omit secondary entirely (no spacer)
- CSS: single-line center when no secondary

## TDD

- Prefer Playwright for chrome; small unit helpers if any pure logic
