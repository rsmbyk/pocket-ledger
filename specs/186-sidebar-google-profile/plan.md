# Plan 186: Sidebar Google profile

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Spec 160

## Why

`sidebar-account` is email-only. GIS `tokeninfo` already has `name` and `picture`.

## Approach

Persist display name and picture URL on `users`, return them from `/v1/me`, show avatar + name + email in the sidebar footer. Click stays a no-op. Fake Google uses initials + email local-part.
