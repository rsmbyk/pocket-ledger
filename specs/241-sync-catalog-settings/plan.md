# Plan 241: Sync pockets, category overlay, and settings

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 121, 119, 123

## What

Signed-in sync already stores ciphertext entities by `kind`. Transactions, plans, goals, and a few settings PUT on save. Pockets (accounts), custom categories, custom groups, overlay prefs, and theme never do — so a second browser shows **Unknown** pockets, an empty Pockets list, and missing customs.

Close that hole: push/pull the catalog and ledger settings, catch-up-upload local rows with no `syncRevs`, pull before seeding Main, drop an unused local seed Main when the cloud already has pockets.

## Why

Spec 121 promised the ledger follows the account. Spec 119 promised cloud-empty + local data uploads once. Neither shipped for pockets or the category overlay.

## Out of this slice

- Stock catalog rows (bundle-only, 123)
- Device lock / wrap / WebAuthn keys
- Hide-amounts chrome
- Sealing pocket name/notes at rest (120 gap; push Dexie rows as stored)
- Repairing cloud if every device already lost the Dexie pockets
