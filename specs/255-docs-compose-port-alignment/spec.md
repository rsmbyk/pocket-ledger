# Spec: Align Git Flow docs and isolate Docker Compose host ports

- **ID:** 255
- **Status:** Accepted
- **Item:** ITEM-003
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Bump:** none

## Intent

Make the repository's public and local-compose instructions truthful and reduce collisions with other local development processes, without changing the application's runtime architecture or production deployment.

## Scope

### In scope

- Replace README's GitHub Flow references with Git Flow.
- Expose Docker Compose services only on loopback using host ports 45173 (dev web), 48080 (API), and 44173 (preview).
- Make Compose browser-facing URLs, CORS defaults, API URLs, health-check guidance, and OAuth local origins/redirects consistent with those ports.
- Update the roadmap to declare 255 as the next numbered spec.

### Out of scope

- Changing container-internal listeners (5173, 8080, 4173), native host-dev commands, Playwright's self-managed ports, or Cloud Run configuration.
- Changing application features, dependencies, CI, or release version.

## Domain rules

- Docker Compose dev web's configured API URL must resolve to the Compose API's loopback host port.
- Docker Compose API's default `WEB_ORIGIN` must equal the Compose dev web URL.
- The preview profile's supplied `WEB_ORIGIN` must equal its Compose preview URL.

## Acceptance scenarios

### Scenario: README describes the active branching model

- **Given** the repository has adopted Git Flow in ADR 0009
- **When** a contributor reads the README stack and process sections
- **Then** each section identifies Git Flow, not GitHub Flow.

### Scenario: Compose development starts without the old common host ports

- **Given** a developer runs `docker compose up --build`
- **When** Docker publishes the services to loopback
- **Then** dev web is available at `http://127.0.0.1:45173`, API health at `http://127.0.0.1:48080/healthz`, and no Compose service binds host ports 5173 or 8080.

### Scenario: Compose CORS and OAuth documentation match the new origins

- **Given** a developer follows the Compose setup guidance
- **When** they use dev or preview with official Google Identity Services
- **Then** the documented origins and redirect URI use 45173/44173/48080 respectively and match Compose configuration.

### Scenario: Roadmap reports the next available spec

- **Given** Specs 251 through 254 exist
- **When** a contributor reads the roadmap
- **Then** it reports 255 as the next spec ID.

## Traceability

- Domain/app tests: N/A
- E2E: N/A
- Implementation: `README.md`, `docker-compose.yml`, `.env.example`, `docs/HOSTING.md`, `AGENTS.md`, and `docs/ROADMAP.md`
- Verification: `docker compose --profile preview config`; selected host-port availability check with `ss`; focused documentation-reference search.
