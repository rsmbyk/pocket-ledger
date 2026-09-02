# Spec 138: PocketLabel Main text optical alignment

- **ID:** 138
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

On the Transactions row pocket line and pocket **selection dropdowns**, the name sits visually centered with the Main landmark icon. Other icon+text pairs stay as they are.

## Scope

### In scope

1. `text-xs` pocket under the amount (`TransactionListRow` → `PocketLabel`).
2. Pocket picker trigger + menu items: Quick Add/Edit sheet; Transactions (Activity) filter pocket dropdown.
3. Optical-align the **name** (likely `leading-none` on the name span, optional 0.5–1px nudge). Only those call sites, or a PocketLabel compact/optical flag used only there.

### Out of scope

- Pockets hub rows (`font-medium` PocketLabel)
- Category icons, Uncategorized, transfer arrows, nav, any other icon+text
- Changing Landmark icon size globally

## Domain rules

- None (presentation)

## Acceptance scenarios

### Scenario: Row pocket name not high

- **Given** a Transactions row with pocket Main
- **When** the pocket line under the amount is shown
- **Then** the name glyphs sit optically centered with the landmark icon (not sitting high in the line box)

### Scenario: Picker matches

- **Given** the tx sheet or Transactions filter pocket dropdown
- **When** Main is shown on the trigger or an item
- **Then** the same optical alignment applies

### Scenario: Pockets hub unchanged

- **Given** the Pockets panel list
- **When** a Main row label renders
- **Then** its icon+name metrics are not retuned by this slice

## Traceability

- Vitest: n/a
- Playwright: optional visual/class assertion on compact PocketLabel; prefer manual
- Implementation: `PocketLabel.svelte` and/or classes at list + picker call sites only

## Related

- 070 PocketLabel; 077/096 pocket under amount
- Follow-up: compact (`optical`) list/picker Main icon is `size-3` to match the Transactions category tag. Lucide SVGs are `block` so they do not sit on the text baseline; labels keep the default `text-xs` line box so `items-center` can actually center. Pockets hub stays `size-3.5`.
