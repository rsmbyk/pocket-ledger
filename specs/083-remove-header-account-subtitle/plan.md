# Plan 083: Remove header Account subtitle

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Mobile sticky header shows redundant “Account {name}” under the page title.

## Approach

Delete the `md:hidden` subtitle `<p>` in `AppShellChrome`. Keep `pageTitle` only.
