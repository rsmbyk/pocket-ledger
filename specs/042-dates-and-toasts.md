# Spec 042: Date format YY Mon DD, DateField, and toasts

- **ID:** 042
- **Status:** Draft
- **Owner:** Ronald / Vex

## Intent

Unify human-readable dates to `YY Mon DD`, show that format **inside** every date control (not as a hint under the field), and replace top-of-panel success/status banners with brief toast notifications.

## Scope

### In scope

1. **Display format** — always `YY Mon DD` (e.g. `2026-06-16` → `26 Jun 16`). English month abbrev, zero-padded day, two-digit year
2. **Lists** — Recent, Activity, and any other `formatOccurredOnDisplay` callers use the new format
3. **DateField** — shared control: visible value is the formatted string; storage remains ISO `YYYY-MM-DD`; opening a calendar/popover (or equivalent) to pick a date
4. **Apply DateField** to all date pickers/fields: transaction occurred-on; Activity filter From / To
5. **Remove muted date hint** under the tx date input (`tx-occurred-on-display` readout goes away once the field itself shows the format)
6. **Toasts** — success/error feedback that today uses top-of-panel `message` / `role="status"` in Categories and More becomes toast (or equivalent brief notification popup); remove those banners

### Out of scope

- Changing ISO storage
- Month summary label format (`formatMonthLabel`) unless it already uses occurred-on helper
- Spec 041 ConfirmDialog (errors that need blocking confirm stay dialogs)

## Domain rules

- Storage: `YYYY-MM-DD`
- Display: `YY Mon DD` via `formatOccurredOnDisplay` (remove or ignore obsolete `year: 'auto' | 'always'` — one format for all)

## Acceptance scenarios

### Scenario: List date format

- **Given** a transaction on 2026-06-16
- **When** Activity or Recent shows it
- **Then** the date reads `26 Jun 16`

### Scenario: Date in the field

- **Given** the transaction sheet with an occurred-on value
- **When** the date control renders
- **Then** the field itself shows `YY Mon DD` (no separate hint line required for format)

### Scenario: Filter dates

- **Given** Activity From/To filters
- **When** dates are set
- **Then** each control shows `YY Mon DD` in the field

### Scenario: Toast instead of banner

- **Given** the user deletes or renames a category successfully
- **When** feedback appears
- **Then** a toast/notification shows and no persistent top-of-Categories status banner is used for that success message

## Traceability

- Vitest: `occurred-on-display.test.ts`
- Playwright: Activity/Recent date text; sheet DateField; optional toast assert
- Implementation: `occurred-on-display.ts`; `DateField.svelte`; `QuickAddSheet.svelte`; `AppShellChrome.svelte`; `CategoriesPanel.svelte`; `MorePanel.svelte`; `svelte-sonner` Toaster in `App.svelte`
- Depends on: 026, 036 (supersedes display rules); pairs with 039/040
- Supersedes: Spec 026 / 036 year auto/always display rules
