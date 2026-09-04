# Spec 173: Tx type chrome is always tabs

- **ID:** 173
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Add-transaction type chrome is a single `Tabs.List` (`variant="default"`, Spec 081). Create offers Income, Transfer (when allowed), and Expense. Edit and voided show that same list with **exactly one** trigger — the row’s type. Type stays immutable (073).

## Scope

### In scope

1. **Create + ≥2 pockets:** one `Tabs.Root` / `Tabs.List`: **Income | Transfer | Expense** (Transfer in the middle). Keep `data-testid="tx-mode-tabs"` and `tx-mode-transfer`. Drop **Normal** (`tx-mode-normal`). Income/Expense triggers: `tx-type-income` / `tx-type-expense`.
2. Selecting Income or Expense → `mode = normal` + that type (same as today’s `onTypeChange`: categories reload, category cleared). Selecting Transfer → `mode = transfer` (fields unchanged).
3. Active Income keeps income tint; active Expense keeps destructive tint; Transfer uses default raised tab (neutral). Inactive muted.
4. **Create + one pocket:** Transfer omitted (073). Tabs are **Income | Expense** only.
5. **Default create type** stays **expense** (039).
6. **Edit and voided:** replace the centered type badge with `tx-mode-tabs` containing **exactly one** selected trigger (`tx-type-income` / `tx-type-expense` / `tx-mode-transfer`). Same tints as the selected create tab. No other types. Drop `tx-type-badge-transfer`. Display-only — no type change.

### Out of scope

- Edit type changes
- Transfer fields, fee, 174
- 104 draft key shape (`mode` still `'normal' | 'transfer'`)
- 172 caret; 177 footer

## Domain / UI rules

- Domain type and mode mapping unchanged: Normal = income/expense; Transfer = source/dest/amount/fee.
- Tab value is `income | expense | transfer`, mapped onto existing `mode` + `type`.
- One-pocket: `canOfferTransfer` false → no Transfer trigger (create). Edit of a transfer still shows a single Transfer tab even if pockets were later reduced (row type is locked).
- Voided uses the same single-tab chrome as edit.

## Acceptance scenarios

### Scenario: Create three tabs

- **Given** ≥2 pockets, Add open
- **When** the type chrome renders
- **Then** one tab list is Income, Transfer, Expense (Transfer in the middle)
- **And** Expense is selected by default
- **And** there is no Normal tab and no second Income/Expense button row

### Scenario: Transfer selected

- **Given** Transfer is selected on create
- **When** the sheet updates
- **Then** transfer fields show (source/dest/amount/fee)

### Scenario: Transfer to Income

- **Given** Transfer is selected
- **When** the user picks Income
- **Then** Normal income fields show (pocket, amount, category, …)

### Scenario: One pocket

- **Given** only Main
- **When** Add opens
- **Then** tabs are Income | Expense only

### Scenario: Edit income is one tab

- **Given** edit of an income
- **When** the sheet opens
- **Then** type chrome is a tab list with a single Income tab (selected)
- **And** there is no Expense/Transfer trigger and no pill badge

### Scenario: Edit or voided transfer is one tab

- **Given** edit of a transfer (or a voided row)
- **When** the sheet opens
- **Then** a single Transfer tab, same list chrome as create

## Traceability

- Vitest: none required (chrome mapping only; no new money rules)
- Playwright: `e2e/pockets.e2e.ts` — create still reaches Transfer via `tx-mode-transfer`; no `tx-mode-normal`; three (or two) triggers; edit income/transfer single-tab
- Playwright: `e2e/transfer-admin-fee.e2e.ts` — still clicks `tx-mode-transfer`
- Implementation: `apps/web/src/lib/ui/QuickAddSheet.svelte`

## Related

- 039 create default expense + Income/Expense chrome
- 073 Transfer tab + type immutability
- 081 `Tabs.List variant="default"`
