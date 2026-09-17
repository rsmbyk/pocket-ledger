# Tasks 251: Cloud Sync Sessions section

- **Status:** Accepted
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [x] Spec Accepted
- [x] Branch: `feat/251-cloud-sessions-section`
- [x] **Red Vitest** `apps/web/src/lib/application/session-device.test.ts` — Infinix/iPhone/Windows/Fedora; Chrome/Firefox/Safari/Edge name+version; Android UA still `browser`; UA-CH model wins; native header `android`
- [x] **Green** `session-device.ts`
- [x] **Red Vitest** `apps/web/src/lib/domain/session-access-display.test.ts` — `DD MMM YYYY HH:mm`; access line join
- [x] **Green** `session-access-display.ts`
- [x] **Red Vitest** `apps/api/src/session-meta.test.js` — private IP → Local network + IP; city/region/country join; unknown; current-first sort; Android UA → browser
- [x] **Green** `session-meta.js` (+ injectable GeoIP default)
- [x] **Red Vitest** `apps/api/src/app.test.js` — list shape (no public `userAgent`, has `lastIp`); lastSeenAt on GET sync and PUT; current first when other is newer; GeoIP fixture; revoke other still 401s; revoke-all others vs include-current; CORS headers
- [x] **Green** `app.js` touch wrapper, public map, CORS `X-PL-*`, `POST /v1/sessions/revoke-all`
- [x] Schema + memory/postgres stores (`client`, `browser_label`, `device_label`, `last_area`, `last_ip`, delete others/all)
- [x] shadcn Vega Badge; Cloud Sync Sessions (first) + Account (picture, name, Sign out, WebAuthn) in `MorePanel.svelte`; revoke-all confirm
- [x] `cloud-api.ts` types + device headers on requests; `App.svelte` revoke-all include-current = sign-out wipe
- [x] **Playwright** `e2e/cloud-auth.e2e.ts` — signed-in Sessions above Account + first-row badge + no this-device revoke + revoke-all hidden; Account profile + sign-out; signed-out hidden
- [x] `openapi.yaml`; `docs/PRODUCT.md` Session; `specs/README.md`
