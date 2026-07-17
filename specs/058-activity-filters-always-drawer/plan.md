# Plan 058: Always-on Activity filters drawer

- **Status:** Draft
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Supersedes Spec 049 “open to show drawer” on ≥1280

## Why

On wide screens the filters rail fits; making users click Filters is busywork. The drawer should be ambient, with less chrome, and the Activity stage should use the available width so the list isn’t a cramped centered island.

## Scope / edges

**In (≥1280 Activity):** always-on drawer; hide toolbar Filters button; drop Filters title + Close; keep Clear + Apply; full-width stage with even shell padding; top-aligned panel content.

**Out:** Changing filter fields / Apply semantics; sheet UX (&lt;1280); live-apply without Apply.

## Approach

- [`AppShellChrome.svelte`](../../src/lib/ui/AppShellChrome.svelte): Activity + xl → always render drawer; sync draft; persistent panel chrome; `max-w-none` stage
- Sheet path unchanged

## TDD

- Playwright: `e2e/activity-filters.e2e.ts` xl suite
