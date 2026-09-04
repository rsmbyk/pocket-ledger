# Spec 188: Change account passphrase

- **ID:** 188
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Signed-in Privacy replaces the stub with a change-passphrase form. Cannot remove the account passphrase while signed in.

## Scope

### In scope

1. Current + new + confirm (NewPassphraseFields live check).
2. Submit: unwrap old → if fail **Incorrect passphrase**; if old === new, new must differ; else rewrap + `putCloudWrap` + `enableLock`.
3. Recovery wrap unchanged.

### Out of scope

Remove-while-signed-in, new hex kit, unlock cooldown on this form.

## Acceptance scenarios

### Scenario: Wrong current passphrase

- **Given** signed-in Privacy change form
- **When** current is wrong
- **Then** alert **Incorrect passphrase**

### Scenario: New equals old

- **Given** current unwraps
- **When** new equals old
- **Then** alert that the new passphrase must be different

### Scenario: Distinct new succeeds

- **Given** a valid current and a different new pair
- **When** the user submits
- **Then** the next unlock uses the new passphrase

## Traceability

- Vitest: `apps/web/src/lib/application/account-lock.test.ts` (change helper)
- Playwright: `e2e/cloud-auth.e2e.ts`
- Implementation: account-lock, MorePanel, App.svelte
