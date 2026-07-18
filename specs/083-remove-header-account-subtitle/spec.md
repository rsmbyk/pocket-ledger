# Spec 083: Remove header Account subtitle

- **ID:** 083
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Remove the mobile-only Account name line under the shell page title.

## Scope

### In scope

1. Delete the subtitle that renders Account / `{account?.name}` under `page-title` (`text-xs md:hidden`)
2. Keep the page title heading unchanged

### Out of scope

- Changing sidebar account labels
- Pocket filter chrome

## Acceptance scenarios

### Scenario: No Account subtitle

- **Given** mobile width on Activity (or any route)
- **When** the sticky header renders
- **Then** only the page title shows in the title block — no “Account …” line

## Traceability

- Implementation: `AppShellChrome.svelte`
- Playwright: optional assert no Account subtitle text under page-title

## Related

- 070, 074
