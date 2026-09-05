# Plan 205: Default GIS button, not Sign in as Name

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)

## Why

After a real Google sign-in, GIS personalizes `renderButton` to Sign in as Name. Settings should keep the generic Sign in with Google control after sign-out.

## Approach

Call `google.accounts.id.disableAutoSelect()` after `initialize` and before `renderButton`. Pass `auto_select: false`. Call the same helper after our Sign out if GIS is loaded. Do not enable One Tap `prompt()`.
