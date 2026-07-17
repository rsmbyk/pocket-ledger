# Spec 061: More cards padding + icons

- **ID:** 061
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Give More section cards uniform padding on all four sides and a Lucide icon beside each section title.

## Scope

### In scope

1. Each remaining More card (Backup, Recurring, Goals, Privacy): Root `p-(--card-spacing)`; Header/Content `px-0` so padding is not double-applied horizontally
2. Title row icons: **HardDrive**, **Repeat**, **Target**, **Lock** (`size-5`, beside title)
3. Stable hooks e.g. `data-testid="more-section-backup"` (optional) or icon testids per section

### Out of scope

- Changing global `card.svelte` defaults (Categories keeps its own density)
- Net worth section
- Behavior of backup/goals/lock beyond chrome

## Domain rules

- None

## Acceptance scenarios

### Scenario: Icons present

- **Given** More panel
- **When** sections render
- **Then** Backup, Recurring, Goals, and Privacy each show a section icon with the title
- **And** there is no Net worth section

### Scenario: Uniform padding intent

- **Given** a More section card
- **When** it renders
- **Then** card content uses equal spacing from Root on all four sides (no py-only / double-px mismatch)

## Traceability

- Vitest: none
- Playwright: `e2e/base-features.e2e.ts` or `e2e/more-chrome.e2e.ts`
- Implementation: `src/lib/ui/MorePanel.svelte`

## Related

- Spec 029 (single column)
- Spec 059 (no Net worth)
