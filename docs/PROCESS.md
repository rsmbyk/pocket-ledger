# Process: Spec-Driven Development, TDD, GitHub Flow

## Spec-Driven Development (SDD)

1. Write or update a spec under `specs/` **before** implementing behavior.
2. Acceptance scenarios use Given / When / Then.
3. Playwright covers acceptance; Vitest covers domain/use-case rules.
4. PRs must link the spec. Behavior changes without a spec update are incomplete.

Do not spec pure CSS tweaks. Do spec any user-visible behavior or money rule change.

## TDD

Default implementation loop for domain and application code:

1. Red — failing Vitest
2. Green — minimal code
3. Refactor — keep green

UI wiring is thin; prefer testing rules below the Svelte boundary.

## GitHub Flow

1. `main` is always deployable (Cloudflare deploys from `main`).
2. Feature work happens on short-lived branches (`feat/*`, `fix/*`, `chore/*`, `docs/*`).
3. Open a PR into `main`; CI must pass when GitHub Actions is available.
4. Merge to `main` triggers Cloudflare production deploy.

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
