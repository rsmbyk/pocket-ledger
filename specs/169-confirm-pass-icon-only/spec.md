# Spec 169: Confirm passphrase icon only

- **ID:** 169
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Confirm passphrase live-check is the trailing icon only.

## Scope

### In scope

1. Remove the **Passphrases match** `<ul>` under `enable-lock-pass-confirm`.
2. Keep suffix check / cross when `lockPassConfirm.length > 0` (163). Empty confirm: no icon (163).
3. Keep **At least 8 characters** under the new passphrase field (157 / 163).
4. `enable-lock` enablement unchanged (157): still needs length ≥ 8 and match.

### Out of scope

- New-passphrase helper
- Disable-lock
- UnlockScreen
- Backup / export passphrase fields
- Min-length 8

## Domain / UI rules

- Spec 157 allowed an optional **Passphrases match** line. This slice drops it; mismatch is icon-only.
- Spec 163 still gates the confirm icon on typed text.

## Acceptance scenarios

### Scenario: Matching confirm, no helper line

- **Given** lock off, user has typed 8+ in new passphrase and a matching confirm
- **When** Privacy renders
- **Then** confirm shows a trailing check and no **Passphrases match** text
- **And** `enable-lock-requirements` still shows **At least 8 characters**
- **And** `enable-lock` is enabled

### Scenario: Mismatch, icon only

- **Given** confirm has text that does not match
- **When** the field updates
- **Then** confirm shows a trailing cross and still no helper line
- **And** `enable-lock` stays disabled

## Traceability

- Vitest: none
- Playwright: `e2e/settings.e2e.ts` — after typing confirm, **Passphrases match** is absent; enable still works
- Implementation: Privacy form in `MorePanel.svelte`

## Related

- 157 Settings privacy
- 163 Enable-lock live check only after typing
