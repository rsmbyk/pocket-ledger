# ADR 0009: Adopt vexbook process at v0.4.0, Git Flow

## Status

Accepted

## Context

Pocket Ledger used its own SDD variant (GitHub Flow per ADR 0005, no ITEM board, no SemVer, gate text duplicated in `.cursor/rules/`). Vexbook (`rsmbyk/vexbook`, local checkout `~/Projects/vexbook`) is the reusable process template. The owner asked to adopt it (Spec 253), naming source `v0.4.0`, and to use Git Flow instead of vexbook's documented GitHub Flow default.

## Decision

- Adopt vexbook process at source `v0.4.0` per its `docs/ADOPT.md` (owner-triggered; no auto-sync). Binding: [`docs/PROCESS.md`](../PROCESS.md), [`docs/KICKOFF.md`](../KICKOFF.md), [`docs/rules/SDD-GATE.md`](../rules/SDD-GATE.md).
- Git model: **Git Flow**. `main` is production; `develop` is integration. Features (`feat/*`, `fix/*`, `chore/*`, `docs/*`) branch from and PR into `develop`. Hotfixes branch from `main`. Releases cut `main` when the owner says release. This supersedes the GitHub Flow portion of ADR 0005; the SDD+TDD portion of 0005 stands as absorbed by vexbook PROCESS.
- Kept pocket-ledger's `.github/PULL_REQUEST_TEMPLATE.md` (richer Test plan) instead of vexbook's stub.
- `VERSION`/`CHANGELOG.md` stay absent until the first slice with `bump != none`.

## Consequences

- New behavior/CSS/copy work follows vexbook SDD (Draft → owner Accept → implement), ITEM board, and `specs/NNN-slug/{plan,spec,tasks}.md` with consecutive IDs (existing 000–252 history kept as-is).
- Vendor rules (`.cursor/rules/`) are thin loaders deferring to the canonical docs, not duplicates.
- CI runs on `develop` + `main`; production deploys still trigger from `main` only.
- Future vexbook syncs happen only when the owner names a source; add a thin note here (or a new ADR if the owner wants a distinct record).
