# Plan 102: Activity session sort + filters persistence

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 045/064 (previously non-persisted); Spec 101 (sort semantics — independent)

## Why

Activity sort mode and applied filters reset on full page reload. Users want them to stick for the **same browser tab session** (survive reload), without lasting across tabs closed / new visits.

## Scope / edges

**In:** `sessionStorage` for `activitySort` + **applied** filter criteria (including live search); restore into `applied` and sync `draft` from applied; injectable Storage helper + Vitest; wire in `AppShellChrome`.

**Out:** `localStorage` / cross-session persistence; persisting sheet/drawer open state, discard-confirm, or chunked reveal index; changing Apply/draft filter model or Sort sheet UX.

## Approach

- Shared module patterned on `src/lib/shared/hide-amounts.ts` (parse/read/write, injectable `Storage`, try/catch)
- Key: `pocket-ledger-activity-list`
- Validate on read: unknown sort → default; malformed JSON / bad fields → defaults
- On hydrate: set `applied`, then `draft = clone(applied)`
- Write whenever `activitySort` or `applied` changes

## TDD

- Vitest: new `src/lib/shared/activity-list-session.test.ts` (or equivalent) for parse/read/write + validation
- Playwright: optional — set sort/filter, reload, assert restored (sessionStorage survives Playwright reload in same context)
