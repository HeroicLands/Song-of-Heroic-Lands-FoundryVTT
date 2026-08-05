---
"sohl": minor
---

**A Script Action overrides the intrinsic action with the same shortcode**

A GM can now replace a built-in (intrinsic) action with their own house rule by
adding a Script Action whose `shortcode` matches it. The script _wholly overrides_
the intrinsic — the context menu, the default action, and `executeAction` all
resolve only the script; the system never runs both.

- **Deterministic merge, script wins.** `SohlLogic` now deduplicates intrinsic and
  script actions by `shortcode` before building `actions`, so a shadowed intrinsic
  is never constructed into the live set nor exposed to default-action selection —
  replacing the previous incidental, Map-ordering-dependent behavior.
- **The intrinsic stays reachable.** Every intrinsic action is retained on
  `SohlLogic.intrinsicActions`, and the new `SohlLogic.executeIntrinsicAction(shortcode)`
  runs it directly. An overriding script that only wants to _build on_ the intrinsic
  invokes it this way (calling `executeAction` with the same shortcode would re-enter
  the script itself).

Closes #1060
