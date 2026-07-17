# Spec 047: Transaction sheet polish

- **ID:** 047
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Make the add/edit transaction surface feel selectable and predictable: pointer on menu items, balanced amount chrome, DateField that toggles closed, labels that don’t act as the control, and an outlined Void control centered in the header.

## Scope

### In scope

1. **Dropdown cursor** — category (and shared) dropdown menu items use `cursor: pointer` on hover
2. **Currency prefix padding** — amount InputGroup currency addon has matching left and right padding
3. **DateField toggle** — clicking the visible date control while the picker is open closes it instead of re-opening
4. **Labels inert** — clicking the visible field label (Amount, Category, Date, Note) does not focus or open the control; only the inner control does
5. **Void chrome** — Void is an outlined danger button and is vertically centered in the transaction modal/sheet header

### Out of scope

- bits-ui / shadcn Calendar replacement for DateField
- Activity filter form labels (see 049)
- Amount visibility (048)

## Domain rules

- None (UI behavior only)

## Acceptance scenarios

### Scenario: Dropdown pointer

- **Given** the category dropdown is open
- **When** the pointer hovers a menu item
- **Then** the cursor is `pointer` (selectable)

### Scenario: Currency padding

- **Given** the amount field with a currency prefix
- **When** the field renders
- **Then** the prefix has equal horizontal padding on left and right

### Scenario: DateField closes on second click

- **Given** the date picker is open from the DateField trigger
- **When** the user clicks the DateField trigger again
- **Then** the picker closes (does not stay open as if newly opened)

### Scenario: Label does not activate

- **Given** Add or Edit transaction is open
- **When** the user clicks the “Amount”, “Category”, “Date”, or “Note” label text
- **Then** the related control does not receive focus / open (dropdown or date picker)

### Scenario: Void outlined and centered

- **Given** Edit transaction (not voided)
- **When** the header renders
- **Then** Void is an outlined destructive-styled button and is vertically centered relative to the title + description block

## Traceability

- Vitest: none
- Playwright: `e2e/tx-sheet-polish.e2e.ts`
- Implementation: `src/lib/ui/QuickAddSheet.svelte`, `src/lib/ui/DateField.svelte`, `src/lib/components/ui/dropdown-menu/dropdown-menu-item.svelte`
