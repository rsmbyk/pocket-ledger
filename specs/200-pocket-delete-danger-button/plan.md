# Plan 200: Delete pocket uses outlined danger

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

Delete pocket uses old solid destructive fill. Void, Drop goal, and Sign out already use outlined danger (`buttonVariants` destructive).

## Approach

Keep the popover trigger. Apply `buttonVariants({ variant: 'destructive' })` plus `w-full`.
