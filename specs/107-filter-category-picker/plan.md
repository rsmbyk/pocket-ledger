# Plan 107: Filter category dropdown + type coupling

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 017 / 045 (Activity filters); Spec 037 / 039 (tx category DropdownMenu); Spec 073 (Transfer type filter deferred); Spec 106 (Admin Fee filter option)

## Why

Activity filters still use a native category `<select>` while the transaction sheet uses a custom DropdownMenu. Users need the same picker chrome, Income/Expense grouping when type is All, and type-driven category options — including disabling category when filtering transfers (073 follow-up).

## Scope / edges

**In:** Shared `CategoryPicker` (filters + tx sheet); Activity type option **Transfer**; category options filtered/grouped by draft type; clear incompatible category on type change; Admin Fee only when type is All; keep Uncategorized / Admin Fee filter semantics.

**Out:** Multi-select categories; changing Admin Fee match rules; pocket filter chrome; type filter chrome beyond adding Transfer.

## Approach

- Extend `ActivityTypeFilter` with `'transfer'`
- Extract `CategoryPicker.svelte` from QuickAddSheet DropdownMenu pattern; support All / groups / Admin Fee / Uncategorized / disabled
- Wire AppShellChrome filters; refactor QuickAddSheet onto the shared picker
- Update Playwright helpers that used native `selectOption` on category

## TDD

- Vitest: `activity-filters` — Transfer type; pure helper for compatible category options / clear rules
- Playwright: `activity-filters.e2e.ts` + `transfer-admin-fee.e2e.ts` category picker interactions
