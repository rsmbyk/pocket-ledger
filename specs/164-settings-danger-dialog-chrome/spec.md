# Spec 164: Settings danger dialog chrome

- **ID:** 164
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Custom danger dialogs use the same flush 057 chrome as ConfirmDialog. Copy, fields, and confirm actions stay 158/159.

## Scope

### In scope

1. `import-backup-dialog` and `reset-dialog`: Content `gap-0 overflow-hidden p-0` (plus existing `max-w-sm`).
2. Danger header stays flush (`px-6 py-3`, same classes as ConfirmDialog). Reset already has `confirm-dialog-danger-header`; import gets the same testid.
3. Body keeps `px-6 py-4`; drop the extra Content `gap-6`. Stack description / fields / footer with ConfirmDialog-like spacing (`space-y-4`).
4. `showCloseButton={false}` — Cancel remains.

### Out of scope

- ConfirmDialog itself; invalid-backup / export dialogs (no danger bar)
- Import/reset behavior
- Keep-settings helper copy (165)

## Domain / UI rules

- Flush danger header is 057 (`border-b`, `bg-destructive/5`, TriangleAlert + title).
- Default Dialog Close must not appear on these two confirms.

## Acceptance scenarios

### Scenario: Import confirm is flush

- **Given** a valid backup and Import confirm open
- **When** `import-backup-dialog` renders
- **Then** the danger header is edge-to-edge (no padded gap around the tinted bar)
- **And** there is no default Close control
- **And** Cancel + Import still work; passphrase field still present

### Scenario: Reset confirm is flush

- **Given** Reset confirm open
- **When** `reset-dialog` renders
- **Then** the same flush header / body padding / no default Close
- **And** keep-settings / passphrase **behavior** unchanged (159)

## Traceability

- Vitest: none
- Playwright: `e2e/reset.e2e.ts` / `e2e/settings.e2e.ts` — danger header present; no Close on reset/import confirms
- Implementation: `MorePanel.svelte` import + reset Dialogs

## Related

- 057 ConfirmDialog danger chrome; 158 backup; 159 reset
