# Tasks 218: GIS redirect on mobile and installed PWA

- **Status:** Draft
- **Plan:** [./plan.md](./plan.md)
- **Spec:** [./spec.md](./spec.md)

## Checklist

- [ ] Spec Accepted
- [ ] TDD: `apps/web/src/lib/application/google-signin.test.ts` — `gisNeedsRedirectUx` (desktop tab vs Android / iOS / standalone); `initialize` popup vs redirect + `login_uri`; `consumeGisRedirectHash` returns JWT / error / none and strips the hash
- [ ] TDD: `apps/api/src/app.test.js` — valid POST → 302 `#pl_gis=`, no `pl_session`; CSRF or invalid JWT → `#pl_gis_error=1`
- [ ] Wire consume-hash on Settings boot into existing `onGoogleCredential`
- [ ] HOSTING: Authorized redirect URI `${API}/v1/auth/gis-callback` (Iowa + local `http://127.0.0.1:8080/v1/auth/gis-callback`)
- [ ] Existing Playwright fake-Google cloud-auth / sync-conflict still pass
- [ ] Commit linking Spec 218
