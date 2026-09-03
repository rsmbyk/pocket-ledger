# Spec 168: Import helper + Choose file button

- **ID:** 168
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Import uses the same helper + button chrome as Export. Picking a file still inspects then summarizes (158).

## Scope

### In scope

1. Helper copy stays **Choose a Pocket Ledger backup**, restyled as Export’s muted `p` (`text-muted-foreground text-sm`), not a Label.
2. Visible control is a default `Button` **Choose file** (same variant as Export backup). It opens a **hidden** `<input type="file" accept="application/json,.json">`. Keep `data-testid="import-backup"` on that input so Playwright `setInputFiles` still works.
3. After a valid pick: show muted `pendingImportFile.name`; **Choose file** stays so they can pick another. Summary + Import (confirm) still 158.
4. Hidden input may reset `value` after each change (so the same path can be re-picked). Pending `File` in memory is the source of truth (166).

### Out of scope

- Confirm dialog (166)
- Invalid modal copy (158)
- Export
- Backup section gap (167)

## Domain / UI rules

- Hidden input is visually hidden (`sr-only` / `hidden` / off-screen), not the styled shadcn file Input.
- Button click programmatically opens the file picker.
- Invalid pick still opens `backup-import-invalid-dialog` and does not show summary (158).

## Acceptance scenarios

### Scenario: Idle Import chrome

- **Given** signed out, Backup card
- **When** Import renders with no file
- **Then** helper is muted `text-sm` like Export
- **And** the visible control is a **Choose file** button (no native “Choose File / No file chosen”)

### Scenario: Valid pick

- **Given** the user activates Choose file and picks a valid v2 backup
- **When** inspect succeeds (158)
- **Then** the filename is shown, summary appears, and Import (confirm) is available

### Scenario: Invalid pick

- **Given** an invalid file (158)
- **When** they pick it via the button
- **Then** `backup-import-invalid-dialog` still opens; no summary

## Traceability

- Vitest: none (inspect stays `backup.test.ts`)
- Playwright: `e2e/settings.e2e.ts` — `import-backup` `setInputFiles` still works; invalid modal; summary after valid pick
- Implementation: Import section in `MorePanel.svelte`

## Related

- 158 Settings backup
- 166 Keep pending file on wrong passphrase
