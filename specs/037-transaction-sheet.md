# Spec 037: Transaction sheet redesign

- **ID:** 037
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Redesign the create/edit/voided transaction dialog (desktop) and bottom sheet (mobile) as one cohesive surface: clearer type, safer dismiss, better amount/category UX, and tighter chrome.

## Scope

### In scope

1. **Description** — no “Quick add…”; same description text regardless of entry point (command palette, Recent, Activity, etc.)
2. **Type immutable after create** — remove Expense/Income toggle on edit; `updateTransaction` rejects a type different from the stored row
3. **Type visual** — strong income vs expense chrome; on **create**, that chrome switches type (and reloads categories); on **edit/voided**, chrome is read-only
4. **Amount as-you-type** — display with thousand grouping while typing; parse to positive integer minor units (existing rules)
5. **Void / Close** — void = destructive icon-only in the **header** (`data-testid="tx-void"`); **Close** in the footer (`data-testid="tx-close"`) where void used to sit
6. **Void confirm** — warn that void is irreversible before proceeding
7. **Save enablement** — create: disable Save when amount (digits) is empty; edit: disable Save when no field changes vs baseline
8. **Close animation** — intentional close (Close, successful save, confirmed leave) animates the panel out
9. **Category order** — options ordered like Categories menu for that kind; **Uncategorized** last, separated by a clear divider
10. **Unsaved guard** — if dirty, confirm before close (Close / Escape / `onOpenChange(false)`); cancel keeps the sheet open
11. **Outside click** — do not dismiss; play an emphasis animation on the panel (`tx-dialog` / `tx-sheet`) so outside-click-to-close is clearly unavailable

### Out of scope

- Spec 036 date readout (may land separately; ISO date input remains)
- Changing void ledger rules (still irreversible void, lists keep voided rows)
- Spec 038 Categories menu redesign

## Domain rules

- Money: integer minor units; amount parse rejects empty / non-digits / ≤0
- Update: `type` must equal existing transaction type
- Dirty (edit): amount, categoryId, note, and occurredOn vs values when the sheet opened
- Dirty (create): any non-default user input (amount, note, category, date, or type ≠ initial) counts for unsaved warn

## Acceptance scenarios

### Scenario: Shared description

- **Given** add is opened from any entry point
- **When** the sheet shows
- **Then** the description does not contain “Quick add” and matches the standard add copy

### Scenario: Edit cannot change type

- **Given** an expense being edited
- **When** the sheet shows
- **Then** type chrome shows expense and cannot switch to income; update with a different type fails in application

### Scenario: Create type visual switches

- **Given** add sheet on expense
- **When** the user switches the type visual to income
- **Then** type is income and the category list is for income

### Scenario: Amount formats while typing

- **Given** the amount field
- **When** the user types `15000`
- **Then** the field shows grouped digits (e.g. `15,000`) and save stores 15000 minor units

### Scenario: Void in header, Close in footer

- **Given** an editable (non-voided) transaction
- **When** the sheet shows
- **Then** void is an icon-only danger control in the header; footer has Close instead of void

### Scenario: Void irreversible confirm

- **Given** the user activates void
- **When** the confirm appears
- **Then** the message states the action cannot be undone

### Scenario: Save disabled rules

- **Given** create with empty amount
- **Then** Save is disabled
- **Given** edit with no changes
- **Then** Save is disabled

### Scenario: Unsaved warn

- **Given** dirty create or edit
- **When** the user tries to close
- **Then** a warn appears; declining leaves the sheet open

### Scenario: Outside click emphasizes

- **Given** an open sheet
- **When** the user presses outside the panel
- **Then** the sheet stays open and the panel plays an emphasis animation

### Scenario: Categories order and Uncategorized

- **Given** several categories of the current type
- **When** the category select opens
- **Then** order matches Categories menu order for that kind; Uncategorized is last below a divider

## Traceability

- Vitest: amount format helper; updateTransaction type lock; dirty helpers as needed
- Playwright: extend transaction / polish e2e for void location, save disabled, outside click
- Implementation: `QuickAddSheet.svelte`; `transactions.ts`; Dialog/Sheet interact-outside
- Depends on: 001, 014, 015, 027; pairs with 036, 038 for category order
