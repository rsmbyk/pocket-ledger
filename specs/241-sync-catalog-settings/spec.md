# Spec 241: Sync pockets, category overlay, and settings

- **ID:** 241
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

When signed in, pockets, custom categories/groups, overlay prefs, and ledger settings follow the account the same way transactions already do. A second browser that unlocks must show the same catalog — not **Unknown** pockets and a missing overlay.

## Scope

### In scope

1. Push and pull `account` (pockets), `category` (custom Dexie rows only), `categoryGroup`, and allowlisted ledger settings.
2. Catch-up after a successful signed-in pull: PUT any local entity that has no `syncRevs` row (covers Spec 119 first upload and pockets created before this slice).
3. Pull **before** seeding Main. After pull, if the cloud already has a Main, drop a **local-only unused seed Main** (default name, no notes/opening, referenced by no txs/plans/goals).
4. Settings that follow the account: theme (`theme.preference`), idle minutes, leave-tab, display currency, category overlay prefs.
5. Apply pulled theme to `pocket-ledger-theme` and mode-watcher; re-read idle/currency into the shell after pull.
6. Pocket create / update / delete / reorder and currency-save pocket rewrites PUT. Category/group CRUD and overlay save PUT. Pocket delete (and overlay-cleared prefs) are gravestones.
7. Signed-in save fails if the PUT fails (no silent Dexie-only catalog). Signed-out or 401 is a no-op push.
8. Testing-only: when `VITE_FAKE_GOOGLE` is on, `sessionStorage['pl-e2e-fake-token']` is used as the fake GIS token so two browsers can share one sub.

### Out of scope

- Stock catalog rows (Spec 123 — still not Dexie, not synced)
- Device-only keys: `lock.*`, `encryption.*`, WebAuthn, lockout, wrapRev, pending-reset, catalogMigrated
- Hide-amounts (this-device chrome)
- Sealing pocket name/notes at rest. Blobs are Dexie rows **as stored** (same as txs/plans/goals). Pocket names may still be plaintext in the blob until a later 120 slice.
- CRDT / last-write-wins; **409** still closes the editor and refreshes
- Repairing cloud data if every device already lost the Dexie pockets (the browser that still has them catch-up-pushes on next unlock)

## Domain rules

- Kinds: `account`, `category`, `categoryGroup`, `setting` (id = settings key), plus existing `transaction` / `goal` / `plan`.
- Allowlisted setting ids: `theme.preference`, `idle.minutes`, `idle.leaveTab`, `displayCurrency`, `category.overlayPrefs`. Pull ignores any other `setting` id (do not apply wrap/lock keys even if present).
- Stock categories/groups stay in the bundle. Only custom Dexie rows sync.
- Catch-up runs only after a **successful** pull. PUT when `localRev` is missing. 409 on catch-up → skip that id (already on the server).
- Unused seed Main: `isMain`, name `Main`, no notes, opening off, and no tx/plan/goal references. Dropped only when the pull included a live `account` that is Main.
- Signed-in catalog writes are online-required (same as transactions). `cloudConfigured()` false or HTTP 401 → do not throw (signed-out PWA / e2e). Other PUT failures propagate.
- Theme: on change, write Dexie `theme.preference` and PUT that setting; on pull, write `pocket-ledger-theme` and apply the mode.
- Unlock (account lock) re-runs bootstrap so pull + catch-up happen before the shell paints the ledger.

## Acceptance scenarios

### Scenario: Second browser sees the pocket

- **Given** device A is signed in, has a pocket named A, and saved a transaction on that pocket
- **When** device B signs in as the same Google user and unlocks
- **Then** Pockets lists pocket A (and the same Main as A)
- **And** the transaction row shows pocket A, not Unknown

### Scenario: Custom category overlay follows

- **Given** device A created a custom category (and optionally hid a stock id)
- **When** device B unlocks
- **Then** the custom category is on Categories
- **And** stock catalog rows still resolve from the bundle
- **And** hidden stock ids stay hidden on B

### Scenario: Unused seed Main is not a second Main

- **Given** device B’s Dexie only has a virgin seed Main
- **And** the cloud already has the account’s pockets
- **When** B unlocks and pulls
- **Then** the seed Main is not kept alongside the cloud Main
- **And** B does not PUT that seed Main

### Scenario: Catch-up uploads pockets that never synced

- **Given** device A already has pockets in Dexie with no `syncRevs`
- **When** A unlocks and pull succeeds
- **Then** those pockets are PUT
- **And** a later device B pull receives them

### Scenario: Settings follow the account

- **Given** device A set theme to Dark, idle, and display currency while signed in
- **When** device B unlocks
- **Then** B uses that theme, idle, and currency

### Scenario: Signed-out still works without the API

- **Given** a signed-out user (including e2e with fake Google configured)
- **When** they create a pocket
- **Then** the pocket is stored in Dexie
- **And** a 401 from PUT is ignored

### Scenario: Signed-in pocket save needs the network

- **Given** signed in, unlocked, no network
- **When** they try to save a new pocket
- **Then** the save fails (no silent Dexie-only catalog)

## Traceability

- Vitest: `apps/web/src/lib/application/sync-client.test.ts`; `apps/web/src/lib/application/accounts.test.ts` (push helper); `apps/web/src/lib/application/local-has-data.test.ts` (theme key)
- Playwright: `e2e/sync-catalog.e2e.ts`
- Implementation: `sync-client.ts`, `accounts.ts`, `categories.ts`, `display-currency.ts`, `App.svelte`
- Docs: `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/PRODUCT.md`

## Related

- 119 first upload / local vs cloud
- 121 sync protocol
- 123 overlay catalog (stock not synced)
- 155 currency as settings
- 156 idle as settings
