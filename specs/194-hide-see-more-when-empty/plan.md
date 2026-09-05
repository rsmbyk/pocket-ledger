# Plan 194: Hide See more when Recent is empty

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 066, 148

## Why

See more in Transactions under an empty Recent (Home or pocket details) goes to a list with nothing extra to show.

## Approach

Render the footer control only when that card has at least one transaction. EmptyState and Add stay. Spec 066 empty-visible and Spec 148 always-including-empty are superseded for this footer.
