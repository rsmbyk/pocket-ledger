# Spec 008: More tab hub

- **ID:** 008
- **Status:** Accepted

## Intent

Enable the More tab as the hub for export/import, recurring, goals, net worth, and lock settings.

## Scope

### In scope

- Enable More tab
- Sections for Backup, Recurring, Goals, Net worth, Privacy
- Wire actions from specs 003–007

### Out of scope

- Router / deep links
- Custom category manager (still later)

## Acceptance scenarios

### Scenario: More tab is usable

- **Given** the shell is ready
- **When** the user opens More
- **Then** Backup and Privacy sections are visible

## Traceability

- Playwright: covered across `e2e/backup.e2e.ts`, `e2e/lock.e2e.ts`, etc.
- Implementation: `src/lib/ui/MorePanel.svelte`
