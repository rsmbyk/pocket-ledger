# Spec 163: Enable-lock check when typed

- **ID:** 163
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

New-passphrase and confirm do not show live icons or requirement coloring until that field has text.

## Scope

### In scope

1. `enable-lock-pass`: icon + **At least 8 characters** only when `lockPass.length > 0`.
2. `enable-lock-pass-confirm`: icon only when `lockPassConfirm.length > 0`. No **Passphrases match** helper ([169](../169-confirm-pass-icon-only/spec.md)).
3. Enable button enablement unchanged (157).

### Out of scope

- New strength rules; UnlockScreen; disable-lock; backup/export passphrase fields

## Domain / UI rules

- Per field: empty → no trailing icon and no requirement line. Any character → 157 live coloring (cross vs check).
- Clearing a field back to empty hides that field’s chrome again.
- `enable-lock` stays disabled until length ≥ 8 and confirm matches.

## Acceptance scenarios

### Scenario: Empty fields are quiet

- **Given** lock off, both fields empty
- **When** Privacy renders
- **Then** there is no trailing check/cross on either field
- **And** **At least 8 characters** and **Passphrases match** are not shown
- **And** `enable-lock` is disabled

### Scenario: Length check starts after typing

- **Given** the user types 7 characters in new passphrase, confirm still empty
- **When** the field updates
- **Then** the new-field icon is a cross and **At least 8 characters** is `text-destructive`
- **And** confirm still has no icon and no **Passphrases match** line

### Scenario: Valid pair enables

- **Given** 8+ characters and matching confirm (157)
- **When** both fields are filled
- **Then** both icons are checks and `enable-lock` is enabled

## Traceability

- Vitest: none (length rule already in lock/wrap tests)
- Playwright: `e2e/settings.e2e.ts` — empty Privacy hides requirements; after typing, 157 asserts still hold
- Implementation: Privacy enable-lock form in `MorePanel.svelte`

## Related

- 157 Settings privacy passphrase UX
- 169 Confirm passphrase icon only
