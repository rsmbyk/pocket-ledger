# Spec 071: Pocket opening balance + derived balance

- **ID:** 071
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Each pocket has **one** opening (known) balance and as-of date. **Current balance** is derived from that opening plus later ledger effects for the pocket. Opening is **optional** on create.

## Scope

### In scope

1. On create/edit pocket: opening amount (minor units, may be zero) + as-of date (default **today** / creation date)
2. **Create:** opening field may be left blank → persist **`0`** with as-of = creation date; editable later
3. Persist `openingBalanceMinor` and `openingAsOf` on the account/pocket row
4. Domain helper `derivePocketBalance` (and all-pockets sum for Home Balance)
5. Show current balance on Pockets list (and edit/detail if present)
6. Dating a transaction before `openingAsOf` is allowed; those txs **do not** affect derived balance

### Out of scope

- List of historical balance statements
- Blocking txs dated before opening
- Per-pocket scoping of Home charts (all pockets combined remains)

## Domain rules

- Opening amount is integer minor units; may be `0`; negative opening **allowed** (overdraft / credit-style start) as a signed integer
- Blank/omitted opening on create ≡ `0`
- `openingAsOf` must be a valid `YYYY-MM-DD`; defaults to create day when unset
- For pocket `P`, include a non-voided tx in the sum iff `occurredOn >= openingAsOf` and the tx affects `P`:
  - `income` on `accountId === P` → `+amount`
  - `expense` on `accountId === P` → `−amount`
  - `transfer` with `accountId === P` (source) → `−amount`
  - `transfer` with `counterAccountId === P` (destination) → `+amount`
- Voided → `0` effect
- Global Home balance (v1) = sum of each pocket’s `derivePocketBalance` (transfers cancel across pockets)

## Acceptance scenarios

### Scenario: Default opening on create

- **Given** the user creates a pocket today
- **When** they leave opening blank (or defaults)
- **Then** opening amount is `0` and as-of is the creation date (today)
- **And** current balance shows `0` with no txs

### Scenario: Opening plus later expense

- **Given** pocket opening `100_000` as of `2026-01-01`
- **And** an expense `25_000` on `2026-01-15` on that pocket
- **When** balance is derived
- **Then** current balance is `75_000`

### Scenario: Tx before as-of ignored

- **Given** opening `50_000` as of `2026-06-01`
- **And** an income `10_000` on `2026-05-01` on that pocket
- **When** balance is derived
- **Then** current balance is `50_000` (May tx excluded)

### Scenario: Edit opening updates balance

- **Given** a pocket with opening `0` and no txs
- **When** the user sets opening to `20_000` as of today
- **Then** list shows current balance `20_000`

## Traceability

- Vitest: `derivePocketBalance` / sum helpers — `src/lib/domain/pocket-balance.test.ts` (TDD first)
- Playwright: create pocket with blank opening → 0; list shows balance; edit opening
- Implementation: account fields; Pockets UI; Home balance wiring to all-pockets sum

## Related

- 070, 073 (transfer deltas)
