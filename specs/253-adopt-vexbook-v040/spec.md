# Spec 253: Adopt vexbook v0.4.0 + Git Flow

- **ID:** 253
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

Adopt vexbook process at v0.4.0 into this existing repo (owner-triggered, no auto-sync) and lock Git Flow as the git model.

## Scope

### In scope

1. Copy from vexbook v0.4.0 (overwrite):
   - `docs/PROCESS.md`, `docs/KICKOFF.md`, `docs/ADOPT.md`, `docs/rules/SDD-GATE.md`
   - `backlog/items/_template.md`, `specs/_template/`, `docs/adr/_template.md`
   - `.github/PULL_REQUEST_TEMPLATE.md` (if vexbook copy differs; keep Test plan checklist working)
   - Align `AGENTS.md` process / kickoff / adopt sections; keep product-specific section.
2. Ensure `backlog/board.md` + reusable `_template`s exist after copy.
3. Write adoption ADR `docs/adr/0009-*.md`: decision = adopt vexbook at v0.4.0; consequences = PROCESS / KICKOFF / SDD-GATE binding (link paths). No renumber of 0001–0008.
4. Refresh `.cursor/rules/sdd-gate.mdc`: thin loader referencing every must-apply shared doc from PROCESS (today: `docs/rules/SDD-GATE.md`); no duplicated gate text.
5. Record Git Flow: `main` = production, `develop` = integration; features (`feat/*`, `fix/*`, `chore/*`, `docs/*`) branch from and PR into `develop`; hotfixes branch from `main`; releases cut `main` on owner say-so. Create `develop` from `main` if absent.
6. Update triggers/references: CI `on.pull_request` + `push` branches include `develop` (and `main` for hotfixes/releases); `docs/PROCESS.md` choice, `AGENTS.md`, `docs/ARCHITECTURE.md` or ADR note record the model.

### Out of scope

- `apps/**` behavior changes.
- Opencode auto-review (dropped).
- `templates/` import, vexbook backlog/specs history, `VERSION`/`CHANGELOG` history, vexbook multi-ADR chain.
- Starting pocket-ledger `VERSION` (stays absent until first `bump != none` slice).

## Domain rules

- No auto-sync: future vexbook syncs only on owner ask naming a source.
- One concern per spec; adopt is process-only.

## Acceptance scenarios

### Scenario: Process set matches v0.4.0

- **Given** vexbook v0.4.0 source
- **When** adopt lands
- **Then** `docs/PROCESS.md`, `docs/KICKOFF.md`, `docs/ADOPT.md`, `docs/rules/SDD-GATE.md`, board/_templates match the source process set
- **And** `PRODUCT.md` / `ARCHITECTURE.md` product content is preserved (git-model record excepted)

### Scenario: Adoption ADR exists

- **Given** existing ADRs 0001–0008
- **When** adopt lands
- **Then** `docs/adr/0009-*.md` records the v0.4.0 adopt decision + binding paths
- **And** no existing ADR is renumbered

### Scenario: Vendor rules defer

- **Given** the committed gate
- **When** reading `.cursor/rules/sdd-gate.mdc`
- **Then** it references (not duplicates) every must-apply doc from PROCESS

### Scenario: Git Flow is the recorded model

- **Given** a feature branch
- **When** opening a PR
- **Then** the default target is `develop`
- **And** `develop` exists tracking `main`'s adopt commit

## Traceability

- Vitest: none (process-only)
- Playwright: none (process-only)
- Implementation: process docs, `docs/adr/0009-*.md`, `.cursor/rules/sdd-gate.mdc`, `backlog/board.md`, CI workflow branches, `develop` branch
- Docs: `docs/PROCESS.md`, `docs/ADOPT.md`, `docs/KICKOFF.md`, `docs/rules/SDD-GATE.md`, `AGENTS.md`
