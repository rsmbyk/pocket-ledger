# Plan 255: Align Git Flow docs and isolate Docker Compose host ports

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Item:** ITEM-003
- **Bump:** none

## Why

The README still describes the superseded GitHub Flow model, Docker Compose exposes common local-development ports that can collide with other processes, and the roadmap incorrectly names 251 as the next available spec despite Specs 251–254 existing.

## Scope / edges

**In:** README Git Flow wording; Compose loopback host mappings and browser-facing environment URLs; Compose-specific setup instructions in README, `.env.example`, `docs/HOSTING.md`, and `AGENTS.md`; roadmap next-spec value.

**Out:** Native host-development and Playwright ports; container-internal ports; production deployment settings; behavior, dependencies, and tests.

## Approach

Map Docker Compose's existing container ports to loopback host ports `45173` (Vite dev), `48080` (API), and `44173` (preview). Keep all internal service listeners unchanged. Update the Compose documentation and OAuth origin/redirect guidance to match those browser-facing ports, change README wording to Git Flow, and set the roadmap's next ID to 255.

## TDD

- Domain/app tests: N/A; no runtime domain or application behavior changes.
- E2E: N/A; validate Compose interpolation/config and documentation references instead.

## Risks

- Browser URLs and `WEB_ORIGIN` must agree exactly for CORS and Google OAuth; verify all Compose-specific references use the same values.
- Keep host-native and Playwright commands on their existing ports because they are out of scope.
