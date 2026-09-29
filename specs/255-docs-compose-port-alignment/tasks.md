# Tasks 255: Align Git Flow docs and isolate Docker Compose host ports

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

<!-- Failing test first → implement → green. Check off in order. -->

## Checklist

- [x] Spec Accepted by the project owner
- [x] Branch from `develop` as `chore/255-docs-compose-port-alignment`
- [x] Update README Git Flow language and Compose URL.
- [x] Update `docker-compose.yml` host-port mappings, CORS origin, browser API URLs, and comments.
- [x] Update `.env.example`, `docs/HOSTING.md`, and `AGENTS.md` Compose-only instructions and OAuth URLs.
- [x] Update `docs/ROADMAP.md` next-spec value.
- [x] Verify `docker compose config` contains the intended loopback port mappings and `rg` finds no stale Compose-facing old ports.
- [x] Fill Traceability in `./spec.md`.
- [ ] Update ITEM + [`backlog/board.md`](../../backlog/board.md) in this PR (In review while open; Done before merge).
- [x] Conventional Commit + draft PR linking `./spec.md` (same PR; extra commits fine)

## Done when

- [ ] All acceptance scenarios in spec.md hold.
- [ ] Compose config and documentation checks are green.
- [ ] Board and tasks are complete in the same PR.
