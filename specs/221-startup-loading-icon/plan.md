# Plan 221: Startup loading icon

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

The first paint is a “Starting up…” line (and a leftover card in the shell). That copy is louder than the wait. A centered spinner is enough.

## Approach

Shared `StartupLoading` — Lucide `loader-circle` with `animate-spin`, no title or helper text. Accessible name “Loading”. Use it on the App `!ready` gate and the shell’s unused `!ready` branch so both stay the same.

## TDD

- Vitest browser: `apps/web/src/lib/ui/StartupLoading.svelte.test.ts`
- Playwright: `e2e/scaffold.e2e.ts` — after boot, Starting up copy is gone
