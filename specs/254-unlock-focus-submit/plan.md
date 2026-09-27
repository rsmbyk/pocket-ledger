# Plan 254: Unlock screen focuses passphrase field + Enter unlocks

- **Status:** Accepted (2026-09-27)
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Source:** owner report — on load of the unlock screen, Enter does not unlock; the field must be clicked first.

## Why

On page load (or after header lock) the unlock screen renders but focus stays on `document.body`. Pressing Enter in `body` does not submit the form, so the user must click the passphrase field first. Worse, the Unlock button is `disabled={busy || !passphrase}` where `passphrase` is only fed by `bind:value`: when a password manager fills the field without firing an `input` event, the bound state stays `''`, the button stays disabled, and Enter can never submit (implicit submission is skipped when a form's default button is disabled).

## Approach

1. **Focus on mount:** in `UnlockScreen.svelte`, focus the first text field via the existing `$lib/ui/focus-first-text-field` helper in an `$effect` when the form becomes visible (initial mount and again when a lockout expires and the form re-renders). Reuse — do not fork — the helper dialogs already use.
2. **Submit reads the DOM value:** `onsubmit` reads the input's current `value` from the form element (authoritative — includes autofill that never fired `input`). Drop the `passphrase` `$state`; keep `oninput` to clear the field error.
3. **Button state:** `disabled={busy}` only. Empty submit is a guarded no-op inside `submitPass` (`busy` / `locked` / empty → return), so Enter with an empty field does nothing and never hits `onUnlock`.

## Scope / edges

**In:** `apps/web/src/lib/ui/UnlockScreen.svelte` (both `device` and `account` variants render this component), one component test, one E2E test.

**Out:** other gate screens (`AccountRecoveryScreen`, `AccountPassphraseScreen`, `HexKitScreen`) — same pattern may exist; capture as separate ITEMs if wanted. No global `keydown` Enter handler (focus is the fix). No change to lockout rules, `onUnlock` contract, or recovery flow. No deps.

**Edges:** lockout active → form hidden (unchanged); after lockout expiry the field is focused again. Double-Enter while checking → `busy` guard. Autofill timing (before/after focus) → DOM value read at submit covers it.
