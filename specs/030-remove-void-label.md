# Spec 030: Remove Void label from lists

- **ID:** 030
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

Voided transactions are already clear via strikethrough and dimming. Remove the redundant **Void** badge from list rows.

## Scope

### In scope

- Remove the Void chip/badge from Home Recent and Activity list rows
- Keep strikethrough + muted/dim styling for voided rows
- Update e2e that asserted on a Void badge text in lists

### Out of scope

- Void domain rules (014)
- Void button / confirm in the edit sheet
- Sheet title “Voided transaction” copy

## Domain rules

- Unchanged from 014

## Acceptance scenarios

### Scenario: No Void badge on Recent

- **Given** a voided transaction on Home Recent
- **When** the row renders
- **Then** there is no visible “Void” badge; the row remains struck through and dimmed

### Scenario: No Void badge on Activity

- **Given** a voided transaction on Activity
- **When** the row renders
- **Then** there is no visible “Void” badge; strikethrough/dim remain

## Traceability

- Vitest: n/a
- Playwright: polish / void list asserts
- Implementation: `AppShellChrome.svelte` (Recent), `ActivityTable.svelte`
- Depends on: 014
