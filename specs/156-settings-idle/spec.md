# Spec 156: Settings idle screensaver

- **ID:** 156
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Idle timeout and leave-tab lock are a Settings card of their own, edited as a draft and saved explicitly. The minutes dropdown always shows the real stored value, including the default 30.

## Scope

### In scope

1. **Card** — `settings-section-idle`, title **Idle Screensaver**. Remove `idle-settings` from Privacy.
2. **Controls** — Minutes select (`idle-minutes`): 5 / 10 / 15 / 30. **Always** the stored number as the selected option (including 30). No empty / “Default” placeholder. Checkbox **Lock when I leave this tab** (`idle-leave-tab`) on this card.
3. **Draft footer** — Save / Cancel / Default (`idle-save`, `idle-cancel`, `idle-default`):
   - Save applies minutes + leave-tab (disabled when draft equals stored).
   - Cancel restores both from stored (disabled when already stored).
   - Default sets draft to **30 minutes** and leave-tab **on** (disabled when draft already is that pair). Does not persist until Save.
4. **No live-apply** — Changing the select or checkbox does not write settings until Save. Screensaver / leave-tab behavior keeps using the last **saved** values until Save.

### Out of scope

- Overlay wording (`Click to unlock` / `Click to continue`)
- WebAuthn enroll (stays Cloud Sync, 154)
- Changing the 5/10/15/30 set or PRODUCT default 30

## Domain rules

- `parseIdleSettings` unchanged for missing keys (30 + leave-tab on).
- Draft is UI state; `SETTINGS_IDLE_MINUTES` / `SETTINGS_IDLE_LEAVE_TAB` update only on Save.
- Signed-in: those keys still sync (121).

## Acceptance scenarios

### Scenario: Default 30 is selected

- **Given** stored idle 30 and leave-tab on
- **When** Idle Screensaver renders
- **Then** `idle-minutes` value is `30`
- **And** Save, Cancel, and Default are disabled

### Scenario: Draft then Cancel

- **Given** stored 30 / leave-tab on
- **When** the user picks 10 minutes
- **Then** Save and Cancel are enabled; Default is enabled
- **And** the screensaver still uses 30 until Save
- **When** they Cancel
- **Then** the select is 30 again

### Scenario: Default fills draft

- **Given** stored 10 minutes, leave-tab off
- **When** the user activates Default
- **Then** the draft is 30 and leave-tab on
- **And** stored values are still 10 / off until Save

### Scenario: Not in Privacy

- **Given** Settings
- **When** Privacy renders
- **Then** there is no `idle-minutes` inside `settings-section-privacy`

## Traceability

- Vitest: none required beyond existing `idle.test.ts` unless a draft helper is extracted
- Playwright: Settings idle save/cancel/default; Privacy has no idle controls
- Implementation: `MorePanel` / Settings idle card; stop calling `onIdleMinutes` / `onLeaveTab` on change; Save writes settings
- Docs: PRODUCT idle row if copy changes

## Related

- 154 hub; 119 idle choices; 007 screensaver
