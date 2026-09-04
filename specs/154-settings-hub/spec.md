# Spec 154: Settings hub

- **ID:** 154
- **Status:** Accepted
- **Owner:** Ronald / Vex
- **Plan:** [./plan.md](./plan.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Intent

The More hub is **Settings**: name, path, and card chrome match. Cards are uniform, sectioned, and ordered. Cloud Sync keeps the existing Google/session/WebAuthn flow in the new shell; other cards’ behavior lands in 155–159.

## Scope

### In scope

1. **Copy** — Nav (rail + mobile sheet), page title, command palette, onboarding/docs: **More** → **Settings**. Lucide **Settings** replaces the ellipsis icon. PRODUCT / ARCHITECTURE / AGENTS “More” in the settings-hub sense becomes Settings (onboarding “Transactions / Pockets / Settings”).
2. **Path** — `/settings` is the hub. `parsePath('/more')` is Settings (same alias pattern as `/activity` → Transactions, 134). `routeToPath('settings')` is `/settings`. Kit stub `apps/web/src/routes/settings/+page.svelte`. Visiting `/more` replace-navigates to `/settings`. AppRoute id is `settings` (not `more`).
3. **Testids** — Rename panel hooks to `settings-panel`, `settings-sections`, `settings-section-cloud` (and matching section ids as 155–159 land). E2E follows in this PR for hub chrome; later cards update their own hooks.
4. **Uniform cards** — Each section `Card.Root` uses `p-(--card-spacing)`; Header/Content do not double horizontal padding. Title row: icon `size-5` + title `text-base`. Content uses one shared gap scale (e.g. `flex flex-col gap-4` between inner sections, `gap-2` inside a section). **Backup** Export/Import gap is `--card-spacing` ([167](../167-backup-section-gap/spec.md)). **Inner sections**: a muted section heading + body so fields are not one clump. Cloud Sync uses the same shell even if its inner layout stays close to today.
5. **Order** (signed-out): Cloud Sync → Currency → Idle Screensaver → Privacy → Backup → Reset. Signed-in: hide Backup and Reset (120 / 024 local-only). Currency / Idle / Privacy cards may be empty shells in this slice if 155–157 have not landed; this spec still reserves their **order and titles**. Prefer landing 154 as the shell those PRs fill.
6. **Cloud Sync** — Title **Cloud Sync** (not Cloud). Keep Google sign-in, session list, revoke, sign-out confirm, WebAuthn enroll, and “not configured on this build” copy. Do not redesign that flow.

### Out of scope

- 155–159 field behavior
- Sidebar logo stack / account footer (160)
- Redesigning Google onboarding screens

## Domain / UI rules

- `isLegacyMorePath` (name may vary) is true for `/more` (and trailing slash). Shell replace-navigates like `/activity`.
- Nav `data-testid="nav-settings"` (was `nav-more`).
- Cloud card testid `settings-section-cloud`; existing `google-sign-in`, `cloud-sign-out`, `session-list` stay.

## Acceptance scenarios

### Scenario: Nav and path

- **Given** the app shell
- **When** the user views nav
- **Then** the last item is **Settings** with a Settings icon
- **And** choosing it opens `/settings` and `page-title` is Settings
- **When** they open `/more`
- **Then** the URL becomes `/settings` (replace) and the Settings panel is shown

### Scenario: Card order signed-out

- **Given** signed out
- **When** Settings renders
- **Then** section cards appear in order Cloud Sync, Currency, Idle Screensaver, Privacy, Backup, Reset
- **And** each card uses the shared padding and an icon beside the title

### Scenario: Signed-in hides local-only cards

- **Given** signed in
- **When** Settings renders
- **Then** Backup and Reset cards are absent
- **And** Cloud Sync still shows sign-out / sessions

### Scenario: Cloud Sync keeps today’s actions

- **Given** a build with fake Google configured, signed out
- **When** Settings → Cloud Sync
- **Then** `google-sign-in` is present
- **And** the card title is **Cloud Sync**

## Traceability

- Vitest: `apps/web/src/lib/shared/router.test.ts` — `/settings`; `/more` → settings; `routeToPath`
- Playwright: `e2e/router.e2e.ts`; `e2e/base-features.e2e.ts` (nav label, sections order, rename testids)
- Implementation: `router.ts`; Kit `/settings`; `AppShellChrome.svelte` nav; `MorePanel.svelte` (rename file optional); command palette; docs
- Docs: PRODUCT, ARCHITECTURE, AGENTS.md, `specs/README.md`

## Related

- 008 More hub; 029 stack; 061 icons; 117 paths; 134 activity alias
