# Spec 159: Settings reset (local-only)

- **ID:** 159
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Local reset is a dedicated **danger** Settings card. Users can keep display/idle settings and, if they have one, the device passphrase — not categories. If a passphrase is set, they must type it before the wipe runs.

## Scope

### In scope

1. **Card** — `settings-section-reset`, signed-out only. Destructive chrome (border / Brick). Brief description + **Reset** (`reset-all`). Not inside Backup.
2. **Confirm** — Dialog with danger chrome (057). Copy: permanent, cannot be undone, suggest export first. Confirm button `reset-all-confirm`.
3. **Keep options** (replace 024):
   - **Keep settings** (`reset-preserve-settings`) — display currency (155) + idle minutes + leave-tab (156). Theme `pocket-ledger-theme` still never cleared. Default unchecked.
   - **Keep passphrase** (`reset-preserve-passphrase`) — **only rendered if** device lock is on. Default unchecked. Same keys as 024 when checked (`SETTINGS_LOCK_*`, wrap/raw DEK as today).
4. **No Keep categories** — always wipe `categories` and `categoryGroups` (and overlay settings). Remove `reset-preserve-categories`.
5. **Passphrase gate** — If lock is on, the confirm includes a current-passphrase field (`reset-passphrase`). Reset does not run until it verifies (`verifyPassphrase`). Wrong passphrase: error, no wipe. Required even when Keep passphrase is checked.

Always wipe: transactions, accounts (recreate Main), goals, net-worth snapshots, `clearDataKey`. Then `ensureDefaultAccount`. UI refresh via existing bootstrap.

### Out of scope

- Signed-in reset / wipe-cloud
- Auto-export before reset

## Domain rules

`resetLocalData` options become `{ preserveSettings: boolean; preservePassphrase: boolean }` (drop `preserveCategories`).

- `preserveSettings`: keep `displayCurrency`, `SETTINGS_IDLE_MINUTES`, `SETTINGS_IDLE_LEAVE_TAB` (and 155/156 keys if named differently).
- `preservePassphrase`: existing lock/wrap keys.
- Categories always cleared.

## Acceptance scenarios

### Scenario: Danger card and confirm

- **Given** signed out Settings
- **When** Reset renders
- **Then** the card is visually danger (not the same quiet chrome as Currency)
- **When** the user activates Reset
- **Then** the confirm uses danger chrome and cannot-undo copy

### Scenario: Keep settings only

- **Given** USD display currency, idle 10, leave-tab off, custom categories, txs
- **And** Keep settings checked, passphrase unset
- **When** they confirm Reset
- **Then** txs and categories are gone, Main exists
- **And** currency is still USD and idle is still 10 / off

### Scenario: Passphrase option hidden when unset

- **Given** lock off
- **When** the confirm opens
- **Then** there is no `reset-preserve-passphrase`
- **And** there is no `reset-passphrase` field

### Scenario: Passphrase required when set

- **Given** lock on
- **When** the confirm opens
- **Then** Keep passphrase is listed
- **And** `reset-all-confirm` does not wipe if `reset-passphrase` is empty or wrong
- **When** they enter the correct passphrase and confirm (Keep passphrase off)
- **Then** the ledger is wiped and lock is off

## Traceability

- Vitest: `apps/web/src/lib/application/reset.test.ts` — preserveSettings matrix; always wipe categories; passphrase not in this unit if verify is UI-gated (then application accepts options only after UI verified)
- Playwright: `e2e/reset.e2e.ts` or `e2e/base-features.e2e.ts` — danger card, keep settings, no keep categories, passphrase field when locked
- Implementation: `reset.ts`; Settings Reset card + confirm
- Docs: PRODUCT / 024 superseded keep flags

## Related

- 024 reset (supersede keep-categories); 015/057 danger; 154 hub; 155–156 keys
