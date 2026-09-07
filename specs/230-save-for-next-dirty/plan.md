# Plan 230: Save for next until dirty

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Depends on:** 224

## What

Accept-mode **Save for next** is disabled until the form is dirty. **Save** (post) stays enabled when valid.

## Why

Writing the template with no edits is a no-op. Posting the occurrence is still the primary action.

## Out of this slice

- What Save for next writes (224)
- Edit-mode Save
