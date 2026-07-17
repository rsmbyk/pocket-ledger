# Process: Spec-Driven Development, TDD, GitHub Flow

## Spec-Driven Development (SDD)

Every behavior change follows this loop. Agents and humans both use it.

1. **Plan** — what / why / scope / edges (short is fine).
2. **Spec** — write or update the behavior contract with Given / When / Then **before** any implementation.
3. **Tasks** — checklist for the slice (domain/app tests → use cases → UI → Playwright), with **concrete test file paths**.
4. **Permission gate** — stop and wait for Ronald’s explicit OK. Do **not** start coding, scaffolding, or installing deps until he approves the plan/spec/tasks — even if the ask sounds like “do X” or “proceed.”
5. **Execute** — TDD (red → green), one branch per spec, land via GitHub Flow.
6. **Done** — PR links the spec; behavior changes without a matching spec update are incomplete.

### Spec layout

- **000–046:** flat files `specs/NNN-….md` (historical).
- **047 onward:** one folder per slice — `specs/NNN-slug/{plan,spec,tasks}.md` — so plan, contract, and checklist stay together.

Playwright covers acceptance; Vitest covers domain/use-case rules. Tasks must name the Vitest/Playwright paths used for red→green.

Do not spec pure CSS tweaks. Do spec any user-visible behavior or money rule change.

Ops / docs-only / hotfix one-liners may skip a full numbered spec, but still get a short plan and OK when more than a trivial change.

## TDD

Default implementation loop for domain and application code:

1. Red — failing Vitest
2. Green — minimal code
3. Refactor — keep green

UI wiring is thin; prefer testing rules below the Svelte boundary.

## GitHub Flow

1. `main` is always deployable (Cloudflare deploys from `main`).
2. Feature work happens on short-lived branches (`feat/*`, `fix/*`, `chore/*`, `docs/*`).
3. Open a PR into `main`. Verify locally (`npm run check`, unit, e2e) before merge — GitHub Actions CI is not used (account billing blocked workflows).
4. Land the PR on `main` — that triggers Cloudflare production deploy.

### Merge style

- **Normal features / chores / docs:** **squash merge** the PR into `main` (one clean commit on `main`).
- **Hotfixes only:** use a regular **merge commit** (preserve the hotfix branch history).

Do not land features via local `--no-ff` merges to `main` unless GitHub is unavailable and Ronald explicitly approves a temporary exception.

### Scaffold exception

The initial scaffold was allowed to land directly on `main` once. After that, use branches + PRs.

## Definition of done (feature PR)

- [ ] Spec added or updated
- [ ] Vitest coverage for new domain/application rules
- [ ] Playwright scenarios for new acceptance (or explicitly deferred in spec out-of-scope)
- [ ] `npm run check` clean
- [ ] Conventional Commits; PR Summary + Test plan filled

## Commit style

Conventional Commits, e.g. `feat(accounts): seed default single-pot account`.
