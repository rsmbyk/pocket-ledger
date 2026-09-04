# Spec 183: Onboarding passphrase live check

- **ID:** 183
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Cloud **Set your account passphrase** uses the same live validation as Settings Privacy enable-lock (157 / 163 / 169). Continue stays disabled until the pair is valid. Do not keep submit-time match/length alerts on that screen.

## Scope

### In scope

1. Shared new-passphrase fields matching Privacy: trailing check (`text-income`) / cross (`text-destructive`) after that field has text; **At least 8 characters** under the new field when typed; confirm is icon-only (no **Passphrases match** line).
2. `account-pass-submit` (**Continue**) disabled until length ≥ 8 and confirm matches, and while busy.
3. Wrap/save failures still show `role="alert"` after submit.
4. Settings Privacy enable-lock keeps existing testids and behavior (`enable-lock-pass`, `enable-lock-requirements`, `enable-lock`).

### Out of scope

- UnlockScreen, disable-lock, backup/export passphrases, Hex kit
- New strength rules (uppercase, digits)
- Changing min length from 8

## Domain / UI rules

- Empty new field: no icon, no requirements list.
- Empty confirm: no icon.
- Onboarding requirements list uses `account-pass-requirements`.
- No `role="alert"` for mismatch or short passphrase on this screen (same as Privacy).

## Acceptance scenarios

### Scenario: Empty onboarding fields are quiet

- **Given** the account passphrase screen
- **When** both fields are empty
- **Then** there is no trailing check/cross
- **And** **At least 8 characters** is not shown
- **And** `account-pass-submit` is disabled

### Scenario: Continue enables when the pair is valid

- **Given** the user types 8+ characters and a matching confirm
- **When** both fields update
- **Then** both icons are checks
- **And** **At least 8 characters** is income-colored
- **And** `account-pass-submit` is enabled

### Scenario: Settings enable-lock unchanged

- **Given** signed out, lock off
- **When** Privacy renders
- **Then** `enable-lock` stays disabled until length ≥ 8 and confirm matches (157 / 163)

## Traceability

- Vitest: `apps/web/src/lib/application/new-passphrase-fields.test.ts`
- Playwright: `e2e/cloud-auth.e2e.ts`; `e2e/settings.e2e.ts` 157 case unchanged
- Implementation: `new-passphrase-fields.ts`, `NewPassphraseFields.svelte`, `AccountPassphraseScreen.svelte`, `MorePanel.svelte`

## Related

- 157 Settings privacy passphrase UX
- 163 Enable-lock check when typed
- 169 Confirm passphrase icon only
- 119 Google session (account passphrase screen)
