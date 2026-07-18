# Spec 073: Normal / Transfer add; immutable type; neutral badge

- **ID:** 073
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Add transactions as **Normal** (income/expense) or **Transfer** between pockets. **Type is immutable** after create (cannot change income ↔ expense ↔ transfer). Transfers are **editable** like normal txs for amount, source, destination, date, and note; void remains available.

## Scope

### In scope

1. Add sheet top: **Normal** | **Transfer** as a **standard tab control** (underline/tab list chrome — not a dual filled-button toggle)
2. Transfer tab available only when there are **≥2** pockets; otherwise Normal only (or Transfer disabled with reason)
3. Transfer fields: **source** pocket, **destination** pocket, **amount**, optional **note** (no category); **date** on create/edit like normal
4. Persist `type: 'transfer'`, `accountId` = source, `counterAccountId` = destination
5. Pocket pickers use 070 order + Main icon; **both** source and dest menus list the **full** ordered pocket list
6. When source === destination (both set): show an **inline warning**; Save stays disabled
7. **Edit transfer:** same sheet shows editable amount, source, dest, date, note; type badge read-only (Transfer); Save when dirty; Void still available
8. **Type immutable** for all kinds: cannot change type on edit (income/expense/transfer)
9. Type badge for Transfer: same chip layout as Expense/Income; **neutral** colors

### Out of scope

- Converting a transfer into income/expense (or reverse)
- Recurring transfers
- Transfer category
- Activity type filter option for Transfer (may show under All; dedicated filter follow-up OK)

## Domain rules

- Source ≠ destination; both required; amount positive minor units
- `categoryId` null for transfers
- `updateTransfer` (or shared update path): may change accountId, counterAccountId, amountMinor, note, occurredOn; must reject `type` change; must keep `categoryId` null
- `assertTransferNotEditable` **removed** / superseded — transfers are editable except type
- Balance effects per 071

## Acceptance scenarios

### Scenario: Transfer tab with two pockets

- **Given** Main and Vacation pockets
- **When** the user opens Add
- **Then** tabs Normal and Transfer are available as a standard tab list (`tx-mode-tabs`), not dual primary/outline buttons

### Scenario: Transfer tab hidden with one pocket

- **Given** only Main
- **When** the user opens Add
- **Then** Transfer is not available as a create path

### Scenario: Both pickers list all pockets

- **Given** Main and BCA pockets and Transfer mode
- **When** the user opens the source menu
- **Then** both Main and BCA appear
- **And** the destination menu likewise lists both

### Scenario: Same-pocket warning

- **Given** Transfer mode with source and destination both set to Main
- **When** the form renders
- **Then** an inline warning is visible (e.g. `tx-transfer-same-pocket-warn`)
- **And** Save is disabled

### Scenario: Create transfer

- **Given** source Main, dest Vacation, amount `10_000`
- **When** the user saves Transfer
- **Then** a transfer row exists with those pockets
- **And** Main balance decreases and Vacation increases by `10_000` (given openings allow)

### Scenario: Edit transfer fields

- **Given** an existing transfer Main → BCA
- **When** the user opens it
- **Then** amount, source, destination, date, and note are editable
- **And** the type badge shows Transfer and cannot be switched to Income/Expense
- **And** saving updated amount/pockets updates balances accordingly
- **And** Void remains available

### Scenario: Type immutable

- **Given** any existing transaction (income, expense, or transfer)
- **When** the user opens edit
- **Then** they cannot change its type

### Scenario: Neutral badge

- **Given** a transfer in the add/edit chrome where type badge shows
- **When** it renders
- **Then** the badge reads Transfer with neutral styling, not income/expense colors

## Traceability

- Vitest: transfer create/update validation; reject type mutation; allow field updates on transfer
- Playwright: create; edit amount/source/dest; same-pocket warning; void still works
- Implementation: `QuickAddSheet.svelte`; `updateTransfer` / transactions app; `transfer-rules.ts`

## Related

- 070, 071, 077
