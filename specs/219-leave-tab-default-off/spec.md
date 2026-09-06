# Spec 219: Leave-tab lock defaults off

- **ID:** 219
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

A fresh ledger (or any ledger that has never saved `idle.leaveTab`) must **not** lock when the tab becomes hidden. Idle timeout stays 30 minutes. Users can still turn leave-tab lock on in Settings.

## Scope

### In scope

1. `DEFAULT_LEAVE_TAB` is `false`. `parseIdleSettings` treats a missing `idle.leaveTab` as off.
2. Settings **Lock when I leave this tab** starts unchecked when the key is missing.
3. Idle **Default** sets draft to **30 minutes** and leave-tab **off** (disabled when the draft already is that pair).
4. PRODUCT / 119 / 156 default-on copy is superseded.
5. Stored `'true'` / `'false'` keep their saved value. No rewrite of existing rows.

### Out of scope

- Idle minute set or default 30
- Overlay wording
- Auto-migrating ledgers that already saved leave-tab on
- Changing how hide + leave-tab-on drops the DEK (119)

## Domain rules

- Supersedes Spec 119 item 18 and Spec 156: leave-tab factory default is **off**; Default button pair is 30 + off.
- `leaveTabRaw === undefined` → `DEFAULT_LEAVE_TAB` (`false`). `'true'` → on. Anything else stored → off.
- Hide-tab lock still requires the **saved** leave-tab flag (156 no live-apply).
- Signed-in sync of `SETTINGS_IDLE_LEAVE_TAB` is unchanged (121).

## Acceptance scenarios

### Scenario: Missing key does not lock on hide

- **Given** no `idle.leaveTab` setting and the app is unlocked
- **When** the document becomes hidden
- **Then** the screensaver does not appear
- **And** the DEK stays in RAM

### Scenario: Settings checkbox starts off

- **Given** a fresh ledger
- **When** Idle Screensaver renders
- **Then** `idle-leave-tab` is unchecked
- **And** Save, Cancel, and Default are disabled

### Scenario: Default fills 30 and leave-tab off

- **Given** stored 10 minutes and leave-tab on
- **When** the user activates Default
- **Then** the draft is 30 minutes and leave-tab off
- **And** stored values stay 10 / on until Save

### Scenario: Explicit on still locks

- **Given** `idle.leaveTab` is `'true'` and the app is unlocked
- **When** the document becomes hidden
- **Then** the screensaver appears and the DEK is dropped

## Traceability

- Vitest: `apps/web/src/lib/application/idle.test.ts` — missing key → `{ minutes: 30, leaveTab: false }`; `'true'` stays on
- Playwright: `e2e/settings.e2e.ts` — checkbox unchecked on a fresh ledger; hide-tab does not show `screensaver` until the user saves leave-tab on
- Implementation: `idle.ts` `DEFAULT_LEAVE_TAB`; App / shell prop defaults; PRODUCT idle row
- Docs: `docs/PRODUCT.md`; Specs 119 / 156 superseded notes; `specs/README.md`

## Related

- 119 screensaver / leave-tab
- 156 Idle Screensaver draft/save
- 007 passphrase lock overlay
