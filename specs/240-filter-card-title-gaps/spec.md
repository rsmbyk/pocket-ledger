# Spec 240: Filter card title + even header/footer padding

- **ID:** 240
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On xl, the Transactions and Plans filter cards read as a **Filters** card (same title and icon as the sheet). Header and footer padding is even — inner edges match the outer `py-3`.

## Scope

### In scope

1. Xl cards `activity-filters-drawer` and `plans-filters-drawer`.
2. Title **Filters** with `SlidersHorizontalIcon`, matching the sheet. Clear stays on the right.
3. Header/footer `px-4 py-3` on all sides (override shadcn bordered extra padding). Fields stay `px-4 py-4`.
4. Narrow sheet unchanged.

### Out of scope

- Column split, hug-content, no Close on xl (234)
- Filter criteria, Apply/Clear semantics

## Domain / UI rules

- **Supersedes 234** only on “no Filters title” and the implied header chrome.
- Copy and icon match the sheet: Filters + sliders icon, `text-base font-semibold`.
- Testids: `activity-filters-title`, `plans-filters-title`. Existing Clear/Apply testids stay.

## Acceptance scenarios

### Scenario: Xl card has a Filters title

- **Given** Transactions or Plans at viewport width ≥ 1280
- **When** the filter card renders
- **Then** it shows the title Filters with the same sliders icon as the sheet
- **And** Clear remains on the right of that header

### Scenario: Header and footer padding is even

- **Given** the xl filter card
- **When** it renders
- **Then** the header’s top padding equals its bottom padding
- **And** the footer’s top padding equals its bottom padding

### Scenario: Narrow sheet unchanged

- **Given** Transactions or Plans at viewport width &lt; 1280
- **When** the user opens Filters
- **Then** the sheet still shows Filters + icon, Close, and dirty-discard as today

## Traceability

- Vitest: none required
- Playwright: `e2e/activity-filters.e2e.ts`; `e2e/plans.e2e.ts`
- Implementation: `AppShellChrome.svelte` persistent `filterPanel` / `planFilterPanel`

## Related

- 058, 234
