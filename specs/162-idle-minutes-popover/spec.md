# Spec 162: Idle minutes popover

- **ID:** 162
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Idle timeout minutes uses the same popover-dropdown chrome as Display currency. Options and draft/save behavior stay Spec 156.

## Scope

### In scope

1. Replace `#idle-minutes` `<select>` with a Popover trigger + list (same trigger classes as `currency-picker`: `h-11 w-full … md:h-9`, chevron).
2. Closed label stays `{n} minutes` (5 / 10 / 15 / 30). Open list is those four rows; pick sets draft and closes. No search.
3. Keep `data-testid="idle-minutes"` on the trigger. Keep `id="idle-minutes"` so the Minutes `Label` still points at it.
4. Draft / Save / Cancel / Default / leave-tab checkbox unchanged. No live-apply.

### Out of scope

- Idle option set; checkbox chrome; Privacy; screensaver copy

## Domain / UI rules

- Stored values and draft footer remain 156.
- The control is a button trigger, not a native `<select>` (Playwright must not use `selectOption` / `toHaveValue`).

## Acceptance scenarios

### Scenario: Same chrome as currency

- **Given** stored idle 30
- **When** Idle Screensaver renders
- **Then** the minutes control shows **30 minutes** with the same closed-field chrome as Display currency (height, chevron, border)
- **When** the user opens it and picks **10 minutes**
- **Then** Save and Cancel enable; screensaver still uses 30 until Save (156)
- **When** they Cancel
- **Then** the control shows **30 minutes** again

## Traceability

- Vitest: none (idle parse unchanged)
- Playwright: `e2e/settings.e2e.ts` — click trigger, pick 10 minutes, Cancel / Save / reload
- Implementation: Idle card in `MorePanel.svelte`

## Related

- 156 Settings idle; 155 currency picker chrome
