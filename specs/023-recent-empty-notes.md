# Spec 023: Recent card — empty notes (no filler)

- **ID:** 023
- **Status:** Accepted
- **Owner:** Ronald / Vex

## Intent

On Home Recent, do not invent a type label when a transaction has no note.

## Scope

### In scope

- Home Recent secondary line only
- Non-empty trimmed note → `{note} · {occurredOn}` (ISO date as today)
- Empty/whitespace note → only `{occurredOn}` — no `expense`/`income` or other filler
- Void styling unchanged

### Out of scope

- Short date formatting (026)
- Activity table secondary line
- Domain/storage of notes

## Domain rules

- None

## Acceptance scenarios

### Scenario: Noteless row shows date only

- **Given** a Recent transaction with an empty note
- **When** Home Recent renders
- **Then** the secondary line does not contain `expense` or `income` as filler; the occurred-on date is shown

### Scenario: Note still shown with date

- **Given** a Recent transaction with note `lunch`
- **When** Home Recent renders
- **Then** the secondary line includes `lunch` and the date

## Traceability

- Vitest: n/a
- Playwright: extend home/transactions e2e
- Implementation: `src/lib/ui/AppShellChrome.svelte` (Recent list)
- Depends on: 013
