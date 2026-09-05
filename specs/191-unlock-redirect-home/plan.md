# Plan 191: Unlock `/`, shorter copy, Privacy labels and field errors

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 117, 185, 188

## Why

Unlock keeps the previous path in the address bar. Account Unlock copy mentions device lock. The signed-in change-passphrase form has no Old/New titles, and submit errors sit in a footer under the last field.

## Approach

Replace-navigate to `/` while Unlock or recovery is showing; stay on home after unlock. Shorten account description. Section titles Old / New. Incorrect passphrase under the old field with X. Must-differ live on the new field with X.
