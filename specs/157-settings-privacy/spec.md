# Spec 157: Settings privacy passphrase UX

- **ID:** 157
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Privacy explains device encryption in the card itself (no nested warning card). New passphrase uses live icons and a colored requirements list instead of error placeholders. Unlock / disable stay disabled until the user has typed.

## Scope

### In scope

1. **Merge warning** — Remove [`DeviceSkipWarning.svelte`](../../apps/web/src/lib/ui/DeviceSkipWarning.svelte) from Privacy (inner card, ack checkbox, extra **Set a passphrase**). One or two paragraphs keep the PRODUCT meaning: without a passphrase, anyone with this browser can read the ledger. Then the fields. Drop `device-skip-warning` / `device-skip-ack` / `device-skip-set` from this surface (onboarding skip warning elsewhere is unchanged unless it is this same component-only usage).
2. **New passphrase (lock off)** — Trailing icon **inside** `enable-lock-pass`: check (`text-income`) if length ≥ 8, else cross (`text-destructive`). Confirm field: check if confirm equals new passphrase **and** new is non-empty, else cross. **Requirements list** under the new field (`enable-lock-requirements`): each item colored income if met, destructive if not. v1: one item **At least 8 characters**. No `lock-field-error-passphrase` / `lock-field-error-passphraseConfirm` for length or mismatch.
3. **Enable lock** (`enable-lock`) — disabled until requirements met **and** confirm matches. Enable still wraps the DEK (120); disable still confirms (015/057).
4. **Disable lock** — `disable-lock` disabled until `disable-lock-pass` is non-empty. Confirm dialog unchanged.
5. **UnlockScreen** — `unlock-submit` disabled until `unlock-passphrase` is non-empty (and not lockout-busy). Wrong-guess errors still show after submit. Hex unlock unchanged. Not WebAuthn.

### Out of scope

- New rules (uppercase, digits, etc.)
- Account-passphrase onboarding screens beyond UnlockScreen
- WebAuthn enroll (154 Cloud Sync)

## Domain / UI rules

- Min length remains 8 (`assert` / wrap). Application may still throw if Enable is forced; UI should not offer Enable until valid.
- Confirm mismatch is shown only via the confirm icon ([169](../169-confirm-pass-icon-only/spec.md)) — not a `role="alert"` placeholder and not a **Passphrases match** helper line.
- Signed-in: cannot remove account passphrase; existing copy stays; no disable form.

## Acceptance scenarios

### Scenario: No inner warning card

- **Given** signed out, lock off
- **When** Privacy renders
- **Then** there is no `device-skip-warning`
- **And** warning copy is in the Privacy card body above the new-passphrase fields

### Scenario: Icons and requirements

- **Given** lock off, empty new passphrase
- **When** the user types 7 characters
- **Then** the new-field icon is a cross (`text-destructive`)
- **And** **At least 8 characters** is `text-destructive`
- **And** `enable-lock` is disabled
- **When** they type an 8th character and matching confirm
- **Then** both icons are checks (`text-income`)
- **And** `enable-lock` is enabled
- **And** there is no `lock-field-error-*`

### Scenario: Unlock disabled until typed

- **Given** the device unlock screen
- **When** `unlock-passphrase` is empty
- **Then** `unlock-submit` is disabled
- **When** they type any character
- **Then** it is enabled (unless lockout)

## Traceability

- Vitest: none required (length rule already in lock/wrap tests)
- Playwright: `e2e/lock.e2e.ts`; Settings Privacy; UnlockScreen; remove skip-warning asserts
- Implementation: Settings Privacy card; `UnlockScreen.svelte`; delete or stop using `DeviceSkipWarning` on this surface
- Docs: PRODUCT skip-warning if the More nested card was the only home for that copy

## Related

- 007 lock; 079 inline errors (supersede length/mismatch placeholders here); 120 wrap
