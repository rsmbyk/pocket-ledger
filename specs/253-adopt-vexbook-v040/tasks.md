# Tasks 253: Adopt vexbook v0.4.0 + Git Flow

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Draft Accepted (STOP before checklist below)
- [x] Copy process file set from vexbook v0.4.0 (PROCESS / KICKOFF / ADOPT / SDD-GATE / board item template / specs template / ADR template / PR template kept)
- [x] Ensure `backlog/board.md` + `_template`s exist; verify no history / VERSION / CHANGELOG / templates import
- [x] Write `docs/adr/0009-*.md` (adopt v0.4.0, binding paths)
- [x] Rewire `.cursor/rules/sdd-gate.mdc` to defer to canonical docs
- [x] Align `AGENTS.md` process sections; keep product section
- [x] Create `develop` from `main` (if absent); record Git Flow in PROCESS/ARCHITECTURE/ADR
- [x] Update CI `on` branches (`develop` + `main`) and PR-target references
- [x] `npm run check` clean (docs-only; no unit/e2e rule change)
- [x] Draft PR into `develop` linking Spec 253 (#115)
