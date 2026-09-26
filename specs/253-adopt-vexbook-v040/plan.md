# Plan 253: Adopt vexbook v0.4.0 + Git Flow

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Source:** local `~/Projects/vexbook` at `v0.4.0` (per `docs/ADOPT.md`, owner-named source)

## Why

Pocket Ledger uses its own SDD variant (GitHub Flow, no ITEM board, no SemVer, duplicated gate in `.cursor/rules`). Vexbook v0.4.0 is the locked process template (SDD gate, ITEM board, SemVer, Git Flow / GitHub Flow choice). Adopt it owner-triggered, no auto-sync, then reconcile the Git Flow override.

## Approach

1. Copy vexbook v0.4.0 **process file set** only (overwrite process docs, keep product docs).
2. Write adoption ADR `0009` (next free number, no renumber).
3. Refresh `.cursor/rules/sdd-gate.mdc` to defer to canonical `docs/rules/SDD-GATE.md`.
4. Ensure `backlog/board.md` + reusable `_template`s exist; do not import vexbook history / VERSION / CHANGELOG / templates / multi-ADR chain.
5. Record Git Flow choice (develop integration, features PR into develop, hotfixes from main, releases cut main on owner say-so); update CI triggers + AGENTS/process references accordingly. Create `develop` branch.

## Scope / edges

**In:** process docs adopt, ADR 0009, vendor-rule rewire, board + templates bootstrap, Git Flow record + CI/PR-target updates.

**Out:** app code (`apps/**`) changes; opencode auto-review (dropped); starting `VERSION`/`CHANGELOG` (stays absent until first versioned slice); vexbook history import.
