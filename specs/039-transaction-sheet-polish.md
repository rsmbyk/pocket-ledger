# Spec 039: Transaction sheet polish

- **ID:** 039
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Tighten create/edit transaction chrome: safer amount entry, currency prefix, clearer type presentation, custom category menu, and a more obvious irreversible void path.

## Scope

### In scope

1. **Amount digits only** — typing/paste cannot enter non-digit characters (grouping commas are display-only via existing as-you-type formatter)
2. **Currency prefix** — account currency shown as an InputGroup prefix addon on the amount field (not in the label text)
3. **Create type order** — type chrome shows **Income then Expense**; default selected type on open remains **expense**
4. **Edit type chrome** — show **only** the current transaction type (no second muted column)
5. **Type height** — compact control height (shorter than Spec 037 large `h-12` chrome)
6. **Category dropdown** — custom dropdown (design-system), not native `<select>`; Uncategorized last below a natural separator that matches other UI
7. **Void prominence** — void control more noticeable than icon-only alone (e.g. destructive icon + label); keep `data-testid="tx-void"` in header
8. **Void irreversible warn** — before voiding, a **custom** confirm (AlertDialog / shared ConfirmDialog from Spec 041) states the action cannot be undone — not `window.confirm`

### Out of scope

- Spec 041 open-binding / outside-click flicker / close animation (pairs with this sheet)
- Spec 042 DateField / `YY Mon DD` (date control may still be native until 042)
- Changing void ledger rules
- Spec 040 Categories DnD

## Domain rules

- Amount storage remains digit string → positive integer minor units (`parseAmountInput`)
- Non-digit keystrokes/paste content are stripped or blocked before they appear as editable characters
- Type lock on update unchanged (037)

## Acceptance scenarios

### Scenario: Non-digits blocked

- **Given** the amount field
- **When** the user types or pastes letters/symbols
- **Then** the field shows only digits (and thousand grouping); Save still parses minor units correctly

### Scenario: Currency prefix

- **Given** the add/edit sheet
- **When** the amount field renders
- **Then** the currency label appears as a prefix addon on the field, not inside the Amount label

### Scenario: Create type order and default

- **Given** add sheet opens
- **When** the type chrome renders
- **Then** Income appears before Expense, and Expense is selected by default

### Scenario: Edit shows only current type

- **Given** an expense being edited
- **When** the sheet shows
- **Then** only expense type chrome is shown (income chrome absent)

### Scenario: Category custom dropdown

- **Given** categories for the current type
- **When** the category control opens
- **Then** it is a custom dropdown with Uncategorized last under a separator that matches the app UI

### Scenario: Void warn is custom and irreversible

- **Given** an editable transaction
- **When** the user activates void
- **Then** a custom confirm states the action is irreversible; declining leaves the sheet open and the transaction active

## Traceability

- Vitest: amount digit filtering helper if extracted
- Playwright: transactions / polish (type order, void dialog, category control)
- Implementation: `QuickAddSheet.svelte`; InputGroup; dropdown-menu or Select; ConfirmDialog (041)
- Depends on: 037; pairs with 041 (confirms / modal lifecycle), 042 (dates)
- Supersedes in part: 037 void icon-only + native confirm presentation
