# Plan 219: Leave-tab lock defaults off

- **Status:** Accepted
- **Spec:** [./spec.md](./spec.md)
- **Tasks:** [./tasks.md](./tasks.md)
- **Related:** Specs 119 idle overlay, 156 Idle Screensaver card, 007 screensaver

## Why

Leaving the tab currently locks the app and drops the DEK unless the user turns **Lock when I leave this tab** off. That default is too aggressive for everyday use (another tab, the OS app switcher, a notification). Idle minutes still lock after 30 minutes.

## Approach

Change `DEFAULT_LEAVE_TAB` to `false`. Missing `idle.leaveTab` parses as off. The Settings checkbox starts unchecked. **Default** on the idle card sets 30 minutes + leave-tab **off**. An explicit stored `'true'` stays on (no migration rewrite).

## Scope / edges

**In:** Factory default, parse of missing key, Settings Default pair, PRODUCT copy, supersede 119/156 default-on.

**Out:** Idle minute choices, overlay copy, signed-in sync of the key, rewriting ledgers that already saved leave-tab on.
